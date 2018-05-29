const mongoose = require('mongoose')
const {$, def, S, model, merge} = require('wajez-utils')
const T = require('../../types')
const helpers = require('../../helpers')
const {get, extend} = require('../basic')
const {applyQuery} = require('../../query')
const {onQuery, onRun, beforeConvert, onConvert, onReadParams} = require('../../actions')
const {
  setQuery, runQuery, convertData, setData, setModel, getWhere, getQuery,
  setRoute, setRelated, getData, getOffset, getLimit, getSort, setHeader
} = require('../../middlewares')

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
  (parent, child, field, {uri, converter, actions} = {}) =>
    extend(get(helpers.uri(parent) + '/:id/' + field, [
      onReadParams(setModel(parent.modelName)),
      onReadParams(setRelated(child.modelName)),
      onReadParams(setRoute('show-one-related')),
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
    ]), {uri, actions})
)

const showManyRelated = def('showManyRelated', {}, [T.MongooseModel, T.MongooseModel, $.String, T.RouteConfig, T.Route],
  (parent, child, field, {uri, converter, actions} = {}) =>
    extend(get(helpers.uri(parent) + '/:id/' + field, [
      onReadParams(setModel(parent.modelName)),
      onReadParams(setRelated(child.modelName)),
      onReadParams(setRoute('show-many-related')),
      onQuery(setQuery(async req => {
        const [parentItem] = await applyQuery({
          type: 'find',
          conditions: {_id: req.params.id},
          projection: '_id ' + field,
          options: { limit: 1 },
          populate: []
        }, parent)
        if (!parentItem)
          return {type: 'mock', data: []}
        return {
          type: 'find',
          conditions: merge(getWhere(req) || {}, {_id: {$in: parentItem[field]}}),
          projection: null,
          options: {
            skip: getOffset(req),
            limit: getLimit(req),
            sort: getSort(req)
          },
          populate: []
        }
      })),
      onRun(runQuery(child)),
      onRun(setHeader('Content-Total', async req => {
        const query = getQuery(req)
        return applyQuery({
          type: 'count',
          conditions: query.conditions
        }, child)
      })),
      onConvert(convertData(helpers.routeConverter(child, converter || {})))
    ]), {uri, actions})
)

module.exports = {showRelated}
