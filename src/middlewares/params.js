const {$, def, S, I} = require('wajez-utils')
const T = require('../types')
const {getParam, setParam} = require('./basic')

const integer = x => {
  x = parseInt(x)
  if (isNaN(x))
    throw {name: 'IncorrectQueryParameter'}
  return x
}

const json = x => {
  try {
    x = JSON.parse(x)
  } catch (err) {
    throw {name: 'IncorrectQueryParameter'}
  }
  return x
}

const setOffset = setParam('offset', integer)
const getOffset = getParam('offset')

const setLimit = setParam('limit', integer)
const getLimit = getParam('limit')

const setSort = setParam('sort', I)
const getSort = getParam('sort')

const setWhere = setParam('where', json)
const getWhere = getParam('where')

module.exports = {
  setOffset,
  getOffset,
  setLimit,
  getLimit,
  setSort,
  getSort,
  setWhere,
  getWhere,
}
