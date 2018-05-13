const {$, def, S} = require('wajez-utils')
const T = require('./types')
const {onStart, onReadParams, onSend, inTheEnd} = require('./actions')
const {init, setOffset, setLimit, setSort, sendData, finish} = require('./middlewares')

const defaultActions = [
  onStart(init()),
  onReadParams(setOffset('offset', 0)),
  onReadParams(setLimit('limit', 100)),
  onReadParams(setSort('sort', null)),
  onSend(sendData()),
  inTheEnd(finish())
]

const get = def('get', {}, [$.String, $.Array(T.RouteAction), T.Route],
  (uri, actions) => ({
    uri,
    method: 'get',
    actions: defaultActions.concat(actions)
  })
)

const post = def('post', {}, [$.String, $.Array(T.RouteAction), T.Route],
  (uri, actions) => ({
    uri,
    method: 'post',
    actions: defaultActions.concat(actions)
  })
)

const put = def('put', {}, [$.String, $.Array(T.RouteAction), T.Route],
  (uri, actions) => ({
    uri,
    method: 'put',
    actions: defaultActions.concat(actions)
  })
)

const remove = def('remove', {}, [$.String, $.Array(T.RouteAction), T.Route],
  (uri, actions) => ({
    uri,
    method: 'delete',
    actions: defaultActions.concat(actions)
  })
)

module.exports = {get, post, put, remove}
