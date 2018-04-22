const {$, S} = require('wajez-utils')
const {_, Enum, Union, Optional} = require('./meta')
const {Middleware} = require('./express')

const RouteStep = $.Number

const RouteAction = _({
  step: RouteStep,
  middleware: Middleware,
})

const RouteMethod = Enum('RouteMethod', ['get', 'post', 'put', 'delete'])

const Route = _({
  method: RouteMethod,
  uri: $.String,
  actions: $.Array(RouteAction)
})

const RouteUpdater = $.Function([Route, Route])

const RouteConfig = $.Object

// const RouteConfig = _({
//   uri: Optional($.String),
//   converter: Optional($.Any),
//   actions: Optional($.Array(RouteAction)),
// })

module.exports = {
  RouteStep,
  RouteMethod,
  RouteAction,
  Route,
  RouteUpdater,
  RouteConfig
}
