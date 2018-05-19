const expressJWT = require('express-jwt')
const {$, def, S, I} = require('wajez-utils')
const T = require('../types')
const {mergeMiddlewares} = require('../helpers')

const auth = def('auth', {}, [$.Object, T.MongooseModel, T.Middleware],
  (opts, model) => mergeMiddlewares([
    expressJWT(opts),
    (req, res, next) => {
      const prop = opts.requestProperty || 'user'
      model.findOne({_id: req[prop].id})
      .then(item => {
        if (!item)
          return next({name: 'UnauthorizedError'})
        req[prop] = item
        next()
      })
      .catch(next)
    }
  ])
)

module.exports = {auth}
