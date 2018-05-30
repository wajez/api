const {$, def, S} = require('wajez-utils')
const T = require('../../types')
const helpers = require('../../helpers')
const {get, extend} = require('../basic')
const {
  onQuery, onRun, onConvert, onReadParams, beforeQuery, beforeSend
} = require('../../actions')
const {merge, applyConverter} = require('wajez-utils')
const {
  setQuery, runQuery, convertData, setRoute, setHeader,
  getOffset, getLimit, getSort, setModel, getWhere
} = require('../../middlewares')
const {applyQuery} = require('../../query')

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
    beforeSend(setHeader('Content-Total', async req =>
      applyQuery({
        type: 'count',
        conditions: getWhere(req) || {}
      }, model)
    )),
    beforeSend(setHeader('access-control-expose-headers', async () => 'Content-Total')),
    onConvert(convertData(helpers.routeConverter(model, converter || {})))
  ]), {uri, actions})

module.exports = {list}
