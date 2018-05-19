const {assert} = require('chai')
const {Steps, beforeRun} = require('../src')
const {middlewares} = require('../src/helpers')

const runMiddlewares = async (middlewares, req, res) => {
  if (middlewares.length === 0)
    return {req, res}
  return new Promise((resolve, reject) => {
    middlewares[0](req, res, error =>
      error ? resolve({error})
      : resolve(runMiddlewares(middlewares.slice(1), req, res))
    )
  })
}

const assertRoute = async (route, {method, uri, req, query, dbData, sentData, error}) => {
  req = req || {}
  req.params = req.params || {}
  req.query = req.query || {}
  assert.equal(route.method, method)
  assert.equal(route.uri, uri)

  route.actions = route.actions
    .filter(_ => _.step < Steps.onSend)
    .concat([
      beforeRun((req, res, next) => {
        if (query)
          assert.deepEqual(req.wz.query, query)
        req.wz.query = {
          type: 'mock',
          data: dbData || []
        }
        next()
      })
    ])

  const result = await runMiddlewares(middlewares(route), req, {})

  if (error) {
    assert.deepEqual(result.error, error)
  } else {
    assert.isUndefined(result.error)
    if (sentData)
      assert.deepEqual(result.req.wz.data, sentData)
  }

  return result
}

module.exports = {runMiddlewares, assertRoute}
