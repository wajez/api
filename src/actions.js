const {$, def, S} = require('wajez-utils')
const T = require('./types')

const Steps = {
  onStart: 1,
  onReadParams: 2,
  beforeQuery: 3,
  onQuery: 4,
  beforeRun: 5,
  onRun: 6,
  beforeConvert: 7,
  onConvert: 8,
  beforeSend: 9,
  onSend: 10,
  afterSend: 11,
  inTheEnd: 12
}

const empty = S.K((req, res, next) => next())

const action = def('action', {}, [$.Number, $.Any, T.RouteAction],
  (step, mws) => ({
    step,
    middlewares: mws.constructor === Array ? mws : [mws]
  })
)

const onStart       = action(Steps.onStart)
const onReadParams   = action(Steps.onReadParams)
const beforeQuery   = action(Steps.beforeQuery)
const onQuery       = action(Steps.onQuery)
const beforeRun     = action(Steps.beforeRun)
const onRun         = action(Steps.onRun)
const beforeConvert = action(Steps.beforeConvert)
const onConvert     = action(Steps.onConvert)
const beforeSend    = action(Steps.beforeSend)
const onSend        = action(Steps.onSend)
const afterSend     = action(Steps.afterSend)
const inTheEnd      = action(Steps.inTheEnd)

module.exports = {
  action,
  onStart,
  onReadParams,
  beforeQuery,
  onQuery,
  beforeRun,
  onRun,
  beforeConvert,
  onConvert,
  beforeSend,
  onSend,
  afterSend,
  inTheEnd,
  Steps
}
