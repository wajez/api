const R = require('ramda')
    , express  = require('express')
    , {plural} = require('pluralize')
    , action   = require('./action')
    , paginate = require('./paginate')

const pluralize = word => {
    const words = word.replace(/\.?([A-Z]+)/g, (x, y) => '-' + y.toLowerCase())
        .replace(/^-/, '')
        .split('-')
    words.push(plural(words.pop()))
    return words.join('-')
}

const defaultRoutes = Model => {
    const names = pluralize(Model.modelName)
    return {
        collection: `/${names}`,
        resource: `/${names}/:id`
    }
}

const notFound = (res, id) =>
    res.status(404).json({ error: `Unable to find resource with id '${id}'` })

const checkId = (req, res) => {
    if (! req.params.id.match(/^[0-9a-fA-F]{24}$/))
        notFound(res, req.params.id)
}

const defaultAll = (Model, routes, json, fields) => ({
    method: 'get',
    route: routes.collection,
    query: req => {
        let q = Model.find({}).skip(req.wz.offset).limit(req.wz.limit)
        fields.forEach(field => {
            q = q.populate({
                path: field,
                options: {
                    skip: req.wz[field+'-offset'],
                    limit: req.wz[field+'-limit']
                }
            })
        })
        return q
    },
    json: R.map(json.collectionItem)
})

const defaultGet = (Model, routes, json, fields) => ({
    method: 'get',
    route: routes.resource,
    beforeQuery: checkId,
    query: req => {
        let q = Model.findOne({_id: req.params.id})
        fields.forEach(field => {
            q = q.populate({
                path: field,
                options: {
                    skip: req.wz[field+'-offset'],
                    limit: req.wz[field+'-limit']
                }
            })
        })
        return q
    },
    beforeJson: (data, req, res) => (data === null) ? notFound(res, req.params.id) : data,
    json: json.resource
})

const defaultAdd = (Model, routes, json) => ({
    method: 'post',
    route: routes.collection,
    query: req => Model.create(req.body),
    json: json.resource,
    send: (data, res) => res.status(201).json(data)
})

const defaultEdit = (Model, routes, json, fields) => ({
    method: 'put',
    route: routes.resource,
    beforeQuery: checkId,
    query: req => {
        let q = Model.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, runValidators: true})
        fields.forEach(field => {
            q = q.populate({
                path: field,
                options: {
                    skip: req.wz[field+'-offset'],
                    limit: req.wz[field+'-limit']
                }
            })
        })
        return q
    },
    beforeJson: (data, req, res) => (data === null) ? notFound(res, req.params.id) : data,
    json: json.resource
})

const defaultRemove = (Model, routes, json) => ({
    method: 'delete',
    route: routes.resource,
    beforeQuery: checkId,
    query: req => Model.remove({_id: req.params.id}),
    json: () => ({})
})

const defaultChildAll = (Model, routes, {route, field, json} = {}) => ({
    method: 'get',
    route: route || routes.resource + '/' + field,
    beforeQuery: checkId,
    query: req => Model.findOne({_id: req.params.id}).populate({
        path: field,
        options: {
            skip: req.wz.offset,
            limit: req.wz.limit
        }
    }),
    beforeJson: (data, req, res) => (data === null) ? notFound(res, req.params.id) : data[field],
    json: R.map(json.collectionItem)
})

const defaultChildAdd = (Model, routes, child) => ({
    method: 'post',
    route: child.route || routes.resource + '/' + child.field,
    beforeQuery: checkId,
    query: req => Model.findOne({_id: req.params.id}),
    beforeJson: (data, req, res) => {
        if (data === null)
            return notFound(res, req.params.id)
        if (child.reference)
            req.body[child.reference] = data.id
        return child.Model.create(req.body)
            .then(childData => {
                data[child.field].push(childData)
                return Promise.all([
                    Promise.resolve(childData),
                    Model.findOneAndUpdate({_id: data.id}, data, {new: true, runValidators: true})
                ])
            })
            .then(pair => pair[0])
    },
    json: child.json.resource
})

const makeActions = (Model, {json, beforeQuery, beforeJson, beforeSend, errorHandler, pagination, all, get, add, edit, remove, children} = {}) => {
    beforeQuery = beforeQuery || (() => null)
    beforeJson = beforeJson || R.identity
    beforeSend = beforeSend || R.identity
    routes = defaultRoutes(Model)
    children = children || []
    const fields = children.map(child => child.field)
    const send = (data, res) => res.send(data)
    const defaults = {beforeQuery, beforeJson, beforeSend, send, errorHandler}
    const actions = [
        R.mergeAll([defaults, defaultAll(Model, routes, json, fields), all || {}]),
        R.mergeAll([defaults, defaultAdd(Model, routes, json), add || {}]),
        R.mergeAll([defaults, defaultGet(Model, routes, json, fields), get || {}]),
        R.mergeAll([defaults, defaultEdit(Model, routes, json, fields), edit || {}]),
        R.mergeAll([defaults, defaultRemove(Model, routes, json), remove || {}])
    ];
    children.forEach(child => {
        if (child.route === false) return;
        actions.push(R.mergeAll([defaults, defaultChildAll(Model, routes, child), child.all || {}]))
        actions.push(R.mergeAll([defaults, defaultChildAdd(Model, routes, child), child.add || {}]))
    })
    return actions
}

const makeMiddlewares = ({children, pagination} = {}) => {
    const middlewares = []
    children = children || []
    if (pagination)
        middlewares.push(paginate(pagination, children.map(R.prop('field'))))
    return middlewares
}

const resource = (Model, params) => {
    const router  = express.Router()
        , actions = makeActions(Model, params)
        , middlewares = makeMiddlewares(params)

    middlewares.forEach(middleware => router.use(middleware))
    actions.forEach(parameters => action(router, parameters))

    return router
}

module.exports = resource
