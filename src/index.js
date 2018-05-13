const {oneOne, oneMany, manyOne, manyMany} = require('wajez-utils')
const actions = require('./actions')
const mws = require('./middlewares')
const resource = require('./resource')
const router = require('./router')
const routes = require('./routes')

module.exports = {
  oneOne, oneMany, manyOne, manyMany,
  ...router,
  ...actions,
  ...mws,
  ...resource,
  ...routes,
}
