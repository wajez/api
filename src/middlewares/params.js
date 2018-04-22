const {$, def, S, I} = require('wajez-utils')
const T = require('../types')
const {getParam, setParam} = require('./basic')

const setOffset = setParam('offset', _ => parseInt(_))
const getOffset = getParam('offset')

const setLimit = setParam('limit', _ => parseInt(_))
const getLimit = getParam('limit')

const setSort = setParam('sort', I)
const getSort = getParam('sort')

module.exports = {
  setOffset,
  getOffset,
  setLimit,
  getLimit,
  setSort,
  getSort,
}
