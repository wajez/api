const express = require('express')
const {$, def, S, merge} = require('wajez-utils')
const T = require('./types')
const {middlewares, relationsOf} = require('./helpers')
const {resource} = require('./resource')

const addRoute = def('addRoute', {}, [T.Router, T.Route, T.Router],
  (router, route) => {
    return router[route.method](route.uri, middlewares(route))
  }
)

const router = def('router', {}, [$.Array(T.Route), T.Router],
  S.reduce(addRoute, express.Router())
)

const api = (models, relations = [], configs = {}) => router(
  models.reduce((routes, model) => {
    const config = merge({relations}, configs[model.modelName] || {})
    return routes.concat(resource(model, config))
  }, [])
)

module.exports = {router, api}
