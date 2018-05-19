const {$, def, S} = require('wajez-utils')
const T = require('../../types')
const helpers = require('../../helpers')
const {post, extend} = require('../basic')
const {onQuery, onRun, onConvert, onReadParams} = require('../../actions')
const {setQuery, runQuery, convertData, setRoute, setModel} = require('../../middlewares')

const add = (model, {converter, uri, actions, relations} = {}) =>
  extend(post(helpers.uri(model), [
    onReadParams(setModel(model.modelName)),
    onReadParams(setRoute('add')),
    onQuery(setQuery(async req => ({
      type: 'create',
      data: req.body,
      relations: helpers.relationsOf(model, relations || [])
    }))),
    onRun(runQuery(model)),
    onConvert(convertData(helpers.routeConverter(model, converter || {})))
  ]), {uri, actions})

module.exports = {add}
