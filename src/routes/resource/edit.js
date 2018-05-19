const {$, def, S} = require('wajez-utils')
const T = require('../../types')
const helpers = require('../../helpers')
const {put, extend} = require('../basic')
const {onQuery, onRun, onConvert, onReadParams} = require('../../actions')
const {setQuery, runQuery, convertData, setModel, setRoute} = require('../../middlewares')
const {merge, applyConverter} = require('wajez-utils')

const edit = (model, {converter, uri, actions, relations} = {}) =>
  extend(put(helpers.uri(model) + '/:id', [
    onReadParams(setModel(model.modelName)),
    onReadParams(setRoute('edit')),
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
