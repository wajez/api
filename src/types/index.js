const meta     = require('./meta')
const express  = require('./express')
const query    = require('./query')
const resource = require('./resource')
const route    = require('./route')

const utilsTypes = require('wajez-utils/src/types')

module.exports = {
  ...utilsTypes,
  ...meta,
  ...express,
  ...query,
  ...resource,
  ...route,
}
