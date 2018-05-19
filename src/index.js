const {oneOne, oneMany, manyOne, manyMany} = require('wajez-utils')

const actions = require('./actions')
const mws = require('./middlewares')
const routes = require('./routes')
const router = require('./router')

module.exports = {
  oneOne, oneMany, manyOne, manyMany,
  ...actions,
  ...mws,
  ...routes,
  ...router,
}
