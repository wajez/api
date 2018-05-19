const {$, def, S} = require('wajez-utils')
const T = require('../../types')
const helpers = require('../../helpers')
const {get, extend} = require('../basic')
const {onQuery, onRun, onConvert, beforeSend, onReadParams} = require('../../actions')
const {setQuery, runQuery, convertData, setData, getData, setModel, setRoute} = require('../../middlewares')
const {merge, applyConverter} = require('wajez-utils')

const show = (model, {converter, uri, actions} = {}) =>
  extend(get(helpers.uri(model) + '/:id', [
    onReadParams(setModel(model.modelName)),
    onReadParams(setRoute('show')),
    onQuery(setQuery(async req => ({
      type: 'find',
      conditions: {_id: req.params.id},
      projection: null,
      options: {
        limit: 1
      },
      populate: []
    }))),
    onRun(runQuery(model)),
    onConvert(convertData(helpers.routeConverter(model, converter || {}))),
    beforeSend(setData(async req => getData(req)[0]))
  ]), {uri, actions})

module.exports = {show}
