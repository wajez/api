const mongoose = require('mongoose')
const {plural} = require('pluralize')
const {
  $, def, S,
  I, id, merge,
  mapObj, model,
  reference, applyConverter
} = require('wajez-utils')
const T = require('../types')

const toString = _ => _.toString()

const converter = def('converter', {}, [$.Integer, T.Schema, $.Any],
  (recursions, field) => {
    if (field.type === 'object') {
      if (recursions >= 0)
        return mapObj(converter(recursions - 1), field.fields)
      return S.K(undefined)
    }

    if (field.type === 'array')
      return converter(recursions, field.schema)

    if (field.type === 'reference') {
      if (recursions >= 0) {
        const fieldsConverter = converter(recursions, model(mongoose.model(field.name)))
        return merge({id}, fieldsConverter || {})
      }
      return id
    }

    if (field.type === 'buffer')
      return toString

    return I
  }
)

const defaultConverter = def('defaultConverter', {}, [T.MongooseModel, $.Any],
  _ => {
    const {fields} = model(_)
    return Object.keys(fields).reduce((result, name) => {
      const field = fields[name]
      if (field.type === 'buffer')
        result[name] = toString
      else if (field.type != 'reference' && field.type != 'object' && field.type != 'array')
        result[name] = I
      return result
    }, {id})
  }
)

const routeConverter = def('routeConverter', {}, [T.MongooseModel, $.Any, $.AnyFunction],
  (model, override) =>
    async req => applyConverter(merge(defaultConverter(model), override))
)

module.exports = {converter, routeConverter}
