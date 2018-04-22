const {$, def, S} = require('wajez-utils')
const T = require('../types')
const helpers = require('../helpers')
const {post} = require('../routes')
const {onQuery, onRun, onConvert} = require('../actions')
const {setQuery, runQuery, convertData} = require('../middlewares')

const add = (model, {converter, uri, actions, relations} = {}) =>
  post(uri || helpers.uri(model), [
    onQuery(setQuery(async req => ({
      type: 'create',
      data: req.body,
      relations: helpers.relationsOf(model, relations || [])
    }))),
    onRun(runQuery(model)),
    onConvert(convertData(helpers.routeConverter(model, converter || {})))
  ].concat(actions || []))

module.exports = {add}
