const {$, def, S, I} = require('wajez-utils')
const T = require('../types')
const {applyQuery} = require('../query')

const _init = (req, res, next) => {
  req.wz = {}
  next()
}
const init = def('init', {}, [T.Middleware],
  () => _init
)

const getParam = def('getParam', {}, [$.String, T.Request, $.Any],
  (field, req) => {
    const value = (req.wz || {})[field]
    if (value === undefined)
      return null
    return value
  }
)

const setParam = def('setParam', {}, [$.String, $.AnyFunction, $.String, $.Any, T.Middleware],
  (name, validate, queryName, defaultValue) => (req, res, next) => {
    req.wz[name] = validate(req.query[queryName] || defaultValue)
    next()
  }
)

const setQuery = def('setQuery', {}, [$.Any, T.Middleware],
  queryGetter => (req, res, next) => {
    queryGetter(req)
    .then(q => {
      req.wz.query = q
      next()
    })
    .catch(err => next(err))
  }
)

const getQuery = getParam('query')

const runQuery = def('run', {}, [T.MongooseModel, T.Middleware],
  model => (req, res, next) => {
    applyQuery(getQuery(req), model)
    .then(data => {
      req.wz.data = data
      next()
    })
    .catch(err => next(err))
  }
)

const setData = def('setData', {}, [$.Any, T.Middleware],
  dataGetter => (req, res, next) => {
    dataGetter(req)
    .then(data => {
      req.wz.data = data
      next()
    })
    .catch(err => next(err))
  }
)

const getData = getParam('data')

const convertData = def('convert', {}, [$.AnyFunction, T.Middleware],
  converterGetter => (req, res, next) => {
    converterGetter(req)
    .then(fn => {
      const data = getData(req)
      if (data == null)
        return next()
      req.wz.data = fn(data)
      next()
    })
    .catch(err => next(err))
  }
)

const _sendData = (req, res, next) => {
  res.json(getData(req))
  next()
}
const sendData = def('sendData', {}, [T.Middleware],
  () => _sendData
)

const _finish = (req, res, next) => {}
const finish = def('finish', {}, [T.Middleware],
  () => _finish
)

module.exports = {
  init,
  getParam,
  setParam,
  setQuery,
  getQuery,
  runQuery,
  setData,
  getData,
  convertData,
  sendData,
  finish
}
