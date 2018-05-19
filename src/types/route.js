const {$, S} = require('wajez-utils')
const {_, Enum, Union, Optional} = require('./meta')
const {Middleware} = require('./express')

const RouteAction = _({
  step: $.Number,
  middlewares: $.Array(Middleware),
})

const RouteMethod = Enum('RouteMethod', ['get', 'post', 'put', 'delete'])

const Route = _({
  method: RouteMethod,
  uri: $.String,
  actions: $.Array(RouteAction)
})

const RouteConfig = $.Object

// const RouteConfig = _({
//   uri: Optional($.String),
//   converter: Optional($.Any),
//   actions: Optional($.Array(RouteAction)),
// })

module.exports = {
  RouteMethod,
  RouteAction,
  Route,
  RouteConfig
}
