const express    = require('express')
    , mongoose   = require('mongoose')
    , {resource} = require('../../../src/')
    , User       = require('./user')

const config = {
    interface: 'mongoose',
    database: `mongodb://localhost/wajez-api`,
    mapper: mongoose
}

const app = express()

app.use('/api', resource(config, User))

module.exports = app
