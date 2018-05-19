const {$, def, S} = require('wajez-utils')
const T = require('../../types')
const helpers = require('../../helpers')
const {remove, extend} = require('../basic')
const {onQuery, onRun, onConvert, onReadParams} = require('../../actions')
const {setQuery, runQuery, convertData, setModel, setRoute} = require('../../middlewares')
const {merge, applyConverter} = require('wajez-utils')

const destroy = (model, {converter, uri, actions, relations} = {}) =>
  extend(remove(helpers.uri(model) + '/:id', [
    onReadParams(setModel(model.modelName)),
    onReadParams(setRoute('destroy')),
    onQuery(setQuery(async req => ({
      type: 'remove',
      conditions: {_id: req.params.id},
      relations: helpers.relationsOf(model, relations || [])
    }))),
    onRun(runQuery(model)),
    onConvert(convertData(async req => _ => null))
  ]), {uri, actions})

module.exports = {destroy}
