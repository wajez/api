const {assert} = require('chai')
const {runMiddlewares} = require('../../utils')
const mws = require('../../../src/middlewares')

describe('Unit > Middlewares > Basic Middlewares', () => {

  it('init', async () => {
    const {init} = mws
    const {req, res} = await runMiddlewares([
      init()
    ], {}, {})
    assert.deepEqual(req.wz, {})
  })

  it('getParam', async () => {
    const {getParam} = mws
    const req = {
      wz: {
        foo: 123
      }
    }
    assert.equal(getParam('foo', req), 123)
    assert.equal(getParam('bar', req), null)
  })

  it('setParam', async () => {
    const {setParam} = mws
    const asInt = x => {
      x = parseInt(x)
      if (isNaN(x))
        throw 'Not a number!'
      return x
    }
    const {req, res} = await runMiddlewares([
      setParam('foo', asInt, 'foo', 100),
      setParam('bar', asInt, 'bar', 100),
      setParam('baz', asInt, 'baz', 100)
    ], {wz: {}, query: {foo: '123', bar: 'not-a-number'}}, {})
    assert.deepEqual(req.wz, {foo: 123, bar: 100, baz: 100})
  })

  it('setRoute & getRoute', async () => {
    const {setRoute, getRoute} = mws
    const {req, res} = await runMiddlewares([
      setRoute('my-custom-route')
    ], {wz: {}}, {})
    assert.equal(getRoute(req), 'my-custom-route')
    assert.equal(getRoute({}), null)
  })

  it('setModel & getModel', async () => {
    const {setModel, getModel} = mws
    const {req, res} = await runMiddlewares([
      setModel('m')
    ], {wz: {}}, {})
    assert.equal(getModel(req), 'm')
    assert.equal(getModel({}), null)
  })

  it('setRelated & getRelated', async () => {
    const {setRelated, getRelated} = mws
    const {req, res} = await runMiddlewares([
      setRelated('child')
    ], {wz: {}}, {})
    assert.equal(getRelated(req), 'child')
    assert.equal(getRelated({}), null)
  })

})
