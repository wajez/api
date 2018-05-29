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
    try {
      req.wz[name] = validate(req.query[queryName])
    } catch (err) {
      req.wz[name] = defaultValue
    }
    next()
  }
)

const setRoute = def('setRoute', {}, [$.String, T.Middleware],
  name => (req, res, next) => {
    req.wz.route = name
    next()
  }
)

const getRoute = getParam('route')

const setModel = def('setModel', {}, [$.String, T.Middleware],
  name => (req, res, next) => {
    req.wz.model = name
    next()
  }
)

const getModel = getParam('model')

const setRelated = def('setRelated', {}, [$.String, T.Middleware],
  name => (req, res, next) => {
    req.wz.related = name
    next()
  }
)

const getRelated = getParam('related')

const setQuery = def('setQuery', {}, [$.Any, T.Middleware],
  queryGetter => async (req, res, next) => {
    try {
      req.wz.query = await queryGetter(req)
      next()
    } catch (err) {
      next(err)
    }
  }
)

const getQuery = getParam('query')

const runQuery = def('run', {}, [T.MongooseModel, T.Middleware],
  model => async (req, res, next) => {
    try {
      req.wz.data = await applyQuery(getQuery(req), model)
      next()
    } catch (err) {
      next(err)
    }
  }
)

const setData = def('setData', {}, [$.Any, T.Middleware],
  dataGetter => async (req, res, next) => {
    try {
      req.wz.data = await dataGetter(req)
      next()
    } catch (err) {
      next(err)
    }
  }
)

const getData = getParam('data')

const convertData = def('convertData', {}, [$.AnyFunction, T.Middleware],
  converterGetter => async (req, res, next) => {
    try {
      const data = getData(req)
      if (data == null)
        return next()
      const fn = await converterGetter(req)
      req.wz.data = fn(data)
      next()
    } catch (err) {
      next(err)
    }
  }
)

const setHeader = def('setHeader', {}, [$.String, $.AnyFunction, T.Middleware],
  (headerName, valueGetter) => async (req, res, next) => {
    try {
      res.set(headerName, await valueGetter(req))
      next()
    } catch (err) {
      next(err)
    }
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
  setRoute,
  getRoute,
  setModel,
  getModel,
  setRelated,
  getRelated,
  setQuery,
  getQuery,
  runQuery,
  setData,
  getData,
  convertData,
  setHeader,
  sendData,
  finish
}
