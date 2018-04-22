const mongoose = require('mongoose')
const {$, def, S, model} = require('wajez-utils')
const T = require('../types')
const helpers = require('../helpers')
const {get} = require('../routes')
const {onQuery, onRun, beforeConvert, onConvert} = require('../actions')
const {
  setQuery, runQuery, convertData, setData,
  getData, getOffset, getLimit, getSort
} = require('../middlewares')

const showRelated = ({type, source, target}, config = {}) => {
  const parent = mongoose.model(source.name)
  const child = mongoose.model(target.name)
  if (type === 'one-one' || type === 'many-one')
    return showOneRelated(parent, child, source.field, config)
  if (type === 'one-many' || type === 'many-many')
    return showManyRelated(parent, child, source.field, config)
  throw `Unknown relation type '${type}'!`
}

const showOneRelated = def('showOneRelated', {}, [T.MongooseModel, T.MongooseModel, $.String, T.RouteConfig, T.Route],
  (parent, child, field, {uri, converter, actions} = {}) => {
    uri = uri || helpers.uri(parent) + '/:id/' + field
    return get(uri, [
      onQuery(setQuery(async req => ({
        type: 'find',
        conditions: {_id: req.params.id},
        projection: '_id',
        options: {
          limit: 1,
        },
        populate: [{
          path: field,
          match: {},
          select: null,
          options: {}
        }]
      }))),
      onRun(runQuery(parent)),
      beforeConvert(setData(async req => {
        const instance = getData(req)[0]
        return !instance ? null : (instance[field] || null)
      })),
      onConvert(convertData(helpers.routeConverter(child, converter || {})))
    ].concat(actions || []))
  }
)

const showManyRelated = def('showManyRelated', {}, [T.MongooseModel, T.MongooseModel, $.String, T.RouteConfig, T.Route],
  (parent, child, field, {uri, converter, actions} = {}) => {
    uri = uri || helpers.uri(parent) + '/:id/' + field
    return get(uri, [
      onQuery(setQuery(async req => ({
        type: 'find',
        conditions: {_id: req.params.id},
        projection: '_id',
        options: {
          limit: 1
        },
        populate: [{
          path: field,
          match: {},
          select: null,
          options: {
            skip: getOffset(req),
            limit: getLimit(req),
            sort: getSort(req)
          }
        }]
      }))),
      onRun(runQuery(parent)),
      beforeConvert(setData(async req => {
        const instance = getData(req)[0]
        return !instance ? null : (instance[field] || null)
      })),
      onConvert(convertData(helpers.routeConverter(child, converter || {})))
    ].concat(actions || []))
  }
)

module.exports = {showRelated}
