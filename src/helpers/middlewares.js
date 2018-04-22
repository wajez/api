const {$, def, S} = require('wajez-utils')
const T = require('../types')

const middlewares = def('middlewares', {}, [T.Route, $.Array(T.Middleware)],
  S.pipe([
    S.prop('actions'),
    S.sortBy(S.prop('step')),
    S.map(S.prop('middleware'))
  ])
)

module.exports = {middlewares}
