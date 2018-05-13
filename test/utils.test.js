const assert = require('chai').assert
const utils = require('./utils')

describe('Test Utils', () => {
  describe('runMiddlewares', () => {
    const {runMiddlewares} = utils

    it('returns the same req and res if no middlewares', async () => {
      assert.deepEqual(await runMiddlewares([], {foo: 1}, {bar: 2}), {
        req: {foo: 1},
        res: {bar: 2},
      })
    })

    it('runs a single middleware', async () => {
      const mw = (req, res, next) => {
        req.foo = 1
        res.bar = 2
        next()
      }
      assert.deepEqual(await runMiddlewares([mw], {}, {}), {
        req: {foo: 1},
        res: {bar: 2}
      })
    })

    it('runs two middlewares', async () => {
      const mw = (req, res, next) => {
        req.foo = 1
        res.bar = 2
        next()
      }
      const mw2 = (req, res, next) => {
        req.foo = 3
        res.baz = 4
        next()
      }
      assert.deepEqual(await runMiddlewares([mw, mw2], {}, {}), {
        req: {foo: 3},
        res: {bar: 2, baz: 4}
      })
    })
  })
})
