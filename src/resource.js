const R       = require('ramda')
    , express = require('express')

/**
 * ResourceConfig = {
 *   database: {
 *     interface: 'mongoose' // more interfaces should be added
 *     mapper: object        // instance of the database mapper
 *     uri: string           // ex: `mongodb://localhost/myapi`
 *   }
 * }
 *
 * Resource = [Action]
 *
 * Action = {
 *   order: number,
 *   type: 'middleware' | 'route'
 *   content: Middleware | Route
 * }
 *
 * Middleware = Handler | ErrorHandler
 *
 * Handler = (Request, Response, Next) => void
 *
 * ErrorHandler = (Error, Request, Response, Next) => void
 *
 * Route = {
 *   method: 'get' | 'post' | 'put' | 'delete'
 *   uri: string
 *   handlers: [{
 *     step: RouteStep
 *     fn: Handler
 *   }]
 * }
 *
 * RouteStep = Enum {
 *   BEFORE_QUERY = 1
 *   AT_QUERY     = 2
 *   AFTER_QUERY  = 3
 *   BEFORE_JSON  = 4
 *   AT_JSON      = 5
 *   AFTER_JSON   = 6
 *   BEFORE_SEND  = 7
 *   AT_SEND      = 8
 *   AFTER_SEND   = 9
 * }
 */

/**
 * Creates an express Router for a resource.
 *
 * @param  {ResourceConfig} config
 * @param  {Model}          model
 * @return {Router}
 */
const resource = (config, model) => {
    const actions = make(config, model)
    return actions.reduce(apply, express.Router())
}

/**
 * Makes a resource actions (ie. middlewares, routes and error handlers).
 *
 * @param  {ResourceConfig} config
 * @param  {Model} model
 * @return {Resource}
 */
const make = (config, model) => {
    return [{
        order: 1,
        type: 'route',
        content: {
            method: 'get',
            uri: '/',
            handlers: [
                {step: 2, fn: (req, res, next) => { req.wz.data = 'world!'; next() }},
                {step: 1, fn: (req, res, next) => { req.wz = {}; next() }},
                {step: 3, fn: (req, res, next) => { res.json({hello: req.wz.data}) }},
            ]
        }
    }, {
        type: 'middleware',
        content: (err, req, res, next) => {
            res.status(200).json({hello: err})
            next()
        }
    }]
}

/**
 * Applies an action to an express router.
 * **This function is not pure; it changes the given router**.
 *
 * @param  {Router} router
 * @param  {Action} action
 * @return {Router}
 */
const apply = (router, action) => {
    switch (action.type) {
        case 'middleware':
            router.use(action.content)
        break
        case 'route':
            const {method, uri, handlers} = action.content
            const fns = R.pipe(
                R.sort((a, b) => a.step - b.step),
                R.map(R.prop('fn'))
            )(handlers)
            router[method](uri, ...fns)
        break
        default:
            throw `Unknow action type '${action.type}'`
    }
    return router
}

module.exports = {resource, make, apply}
