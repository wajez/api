const {$, S} = require('wajez-utils')
const {_, Enum, Union} = require('./meta')
const {MongooseModel, Relation} = require('wajez-utils/src/types')
const {RouteConfig} = require('./route')

const Converter = $.Any

const ResourceConfig = $.Object

module.exports = {
  Converter,
  ResourceConfig,
}
