const {$, def, S} = require('wajez-utils')
const T = require('../types')
const helpers = require('../helpers')
const {remove} = require('../routes')
const {onQuery, onRun, onConvert} = require('../actions')
const {setQuery, runQuery, convertData} = require('../middlewares')
const {merge, applyConverter} = require('wajez-utils')

const destroy = (model, {converter, uri, actions, relations} = {}) =>
  remove(uri || helpers.uri(model) + '/:id', [
    onQuery(setQuery(async req => ({
      type: 'remove',
      conditions: {_id: req.params.id},
      relations: helpers.relationsOf(model, relations || [])
    }))),
    onRun(runQuery(model)),
    onConvert(convertData(async req => _ => null))
  ].concat(actions || []))

module.exports = {destroy}
