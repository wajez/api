const {$, def, S} = require('wajez-utils')
const T = require('../types')
const helpers = require('../helpers')
const {get} = require('../routes')
const {onQuery, onRun, onConvert} = require('../actions')
const {merge, applyConverter} = require('wajez-utils')
const {
  setQuery, runQuery, convertData,
  getOffset, getLimit, getSort
} = require('../middlewares')

const list = (model, {converter, uri, actions} = {}) =>
  get(uri || helpers.uri(model), [
    onQuery(setQuery(async req => ({
      type: 'find',
      conditions: {},
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
  ].concat(actions || []))

module.exports = {list}
