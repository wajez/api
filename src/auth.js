const R = require('ramda')
    , jwt = require('jsonwebtoken')
    , expressJWT = require('express-jwt')
    , defaultErrorHandler = require('./error-handler')

const auth = (app, {secret, Model, fields, route, ignore, errorHandler} = {}) => {
    if (!secret)
        throw Error(`Wajez API: 'auth.secret' is missing`)
    if (!Model)
        throw Error(`Wajez API: 'auth.Model' is missing`)
    if (!fields)
        throw Error(`Wajez API: 'auth.fields' is missing`)
    route = route || '/auth'
    ignore = ignore || {}
    errorHandler = errorHandler || defaultErrorHandler

    app.use(expressJWT({secret}).unless(ignore))

    app.use((req, res, next) => {
        if (req.user) {
            Model.findOne({_id: req.user.id})
            .then(user => {
                if (user === null)
                    return errorHandler({name: 'UnauthorizedError'}, req, res, next)
                req.user = user
                next()
            })
            .catch(err => errorHandler(err, req, res, next))
        } else
            next()
    })

    app.post(route, (req, res, next) => {
        const filter = {}
        for(let i = 0; i < fields.length; i ++) {
            if (!req.body[fields[i]])
                return errorHandler({name: 'WrongCredentialsError'}, req, res, next)
            filter[fields[i]] = req.body[fields[i]]
        }
        Model.findOne(filter)
        .then(user => {
            if (null === user)
                return errorHandler({name: 'WrongCredentialsError'}, req, res, next)
            const token = jwt.sign({id: user.id}, secret)
            res.json({token})
        })
        .catch(err => errorHandler(err, req, res, next))
    })
}

module.exports = auth
