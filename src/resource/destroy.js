const {$, def, S} = require('wajez-utils')
const T = require('../types')
const helpers = require('../helpers')
const {remove, extend} = require('../routes')
const {onQuery, onRun, onConvert} = require('../actions')
const {setQuery, runQuery, convertData} = require('../middlewares')
const {merge, applyConverter} = require('wajez-utils')

const destroy = (model, {converter, uri, actions, relations} = {}) =>
  extend(remove(helpers.uri(model) + '/:id', [
    onQuery(setQuery(async req => ({
      type: 'remove',
      conditions: {_id: req.params.id},
      relations: helpers.relationsOf(model, relations || [])
    }))),
    onRun(runQuery(model)),
    onConvert(convertData(async req => _ => null))
  ]), {uri, actions})

module.exports = {destroy}
