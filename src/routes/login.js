const jwt = require('jsonwebtoken')
const {$, def, S} = require('wajez-utils')
const T = require('../types')
const helpers = require('../helpers')
const {post, extend} = require('./basic')
const {onQuery, onRun, beforeQuery, beforeSend, onReadParams} = require('../actions')
const {setQuery, runQuery, getData, setData, setRoute, setModel} = require('../middlewares')

const hasField = def('hasFields', {}, [$.String, T.Middleware],
  field => (req, res, next) => {
    if (!req.body || !req.body[field])
      next({name: 'WrongCredentialsError'})
    next()
  }
)

const login = (secret, model, fields, {uri, actions} = {}) =>
  extend(post('/login', [
    onReadParams(setModel(model.modelName)),
    onReadParams(setRoute('login')),
    beforeQuery(fields.map(field => hasField(field))),
    onQuery(setQuery(async req => ({
      type: 'find',
      conditions: req.body,
      projection: null,
      options: {
        limit: 1
      },
      populate: []
    }))),
    onRun(runQuery(model)),
    beforeSend([
      (req, res, next) => {
        const item = getData(req)[0]
        if (!item)
          return next({name: 'WrongCredentialsError'})
        next()
      },
      setData(async req => ({token: jwt.sign({id: getData(req)[0].id}, secret)}))
    ])
  ]), {uri, actions})

module.exports = {login}
