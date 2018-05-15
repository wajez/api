const {$, def, S} = require('wajez-utils')
const T = require('../types')
const helpers = require('../helpers')
const {put, extend} = require('../routes')
const {onQuery, onRun, onConvert} = require('../actions')
const {setQuery, runQuery, convertData} = require('../middlewares')
const {merge, applyConverter} = require('wajez-utils')

const edit = (model, {converter, uri, actions, relations} = {}) =>
  extend(put(helpers.uri(model) + '/:id', [
    onQuery(setQuery(async req => ({
      type: 'update',
      conditions: {_id: req.params.id},
      data: req.body,
      relations: helpers.relationsOf(model, relations || [])
    }))),
    onRun(runQuery(model)),
    onConvert(convertData(helpers.routeConverter(model, converter || {})))
  ]), {uri, actions})

module.exports = {edit}
