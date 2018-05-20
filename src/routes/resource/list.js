const {$, def, S} = require('wajez-utils')
const T = require('../../types')
const helpers = require('../../helpers')
const {get, extend} = require('../basic')
const {onQuery, onRun, onConvert, onReadParams, beforeQuery} = require('../../actions')
const {merge, applyConverter} = require('wajez-utils')
const {
  setQuery, runQuery, convertData, setRoute,
  getOffset, getLimit, getSort, setModel, getWhere
} = require('../../middlewares')

const list = (model, {converter, uri, actions} = {}) =>
  extend(get(helpers.uri(model), [
    onReadParams(setModel(model.modelName)),
    onReadParams(setRoute('list')),
    onQuery(setQuery(async req => ({
      type: 'find',
      conditions: getWhere(req) || {},
      projection: null,
      options: {
        skip: getOffset(req),
        limit: getLimit(req),
        sort: getSort(req),
      },
      populate: []
    }))),
    onRun(runQuery(model)),
    onConvert(convertData(helpers.routeConverter(model, converter || {})))
  ]), {uri, actions})

module.exports = {list}
