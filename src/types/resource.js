const {$, S} = require('wajez-utils')
const {_, Enum, Union} = require('./meta')
const {MongooseModel, Relation} = require('wajez-utils/src/types')
const {RouteConfig} = require('./route')

const Converter = $.Any

const ResourceConverters = _({
  resource: Converter,
  listItem: Converter,
})

const RequiredResourceConfig = _({
  model: MongooseModel,
})

const ChildrenConfig = Union('ChildrenConfig', [
  $.Array($.String),
  $.StrMap(RouteConfig)
])

const ResourceConfig = $.Object

// const ResourceConfig = _({
//   relations: $.Array(Relation),
//   list: RouteConfig,
//   add: RouteConfig,
//   edit: RouteConfig,
//   show: RouteConfig,
//   destroy: RouteConfig,
//   fields: $.StrMap(RouteConfig)
// })

module.exports = {
  Converter,
  ResourceConverters,
  RequiredResourceConfig,
  ResourceConfig,
}
