const {$, def, S} = require('wajez-utils')
const T = require('../types')

const middlewares = def('middlewares', {}, [T.Route, $.Array(T.Middleware)],
  S.pipe([
    S.prop('actions'),
    S.sortBy(S.prop('step')),
    S.chain(S.prop('middlewares'))
  ])
)

const mergeMiddlewares = def('mergeMiddlewares', {}, [$.Array(T.Middleware), T.Middleware],
  middlewares => (req, res, next) => {
    if (middlewares.length === 0)
      return next()

    middlewares[0](req, res, error => {
      if (error)
        return next(error)
      else
        return mergeMiddlewares(middlewares.slice(1))(req, res, next)
    })
  }
)

module.exports = {middlewares, mergeMiddlewares}
