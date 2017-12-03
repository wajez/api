const R = require('ramda')
    , express  = require('express')
    , mongoose = require('mongoose')
    , resource = require('./resource')
    , bodyParser = require('body-parser')
    , authenticate = require('./auth')
    , corsMiddleware = require('cors')
    , defaultErrorHandler = require('./error-handler')

const connect = database => {
    mongoose.Promise = global.Promise
    mongoose.connect(database, {
        useMongoClient: true
    })
    const db = mongoose.connection
}

const defaultPagination = () => ({
    offsetParam: 'offset',
    limitParam: 'limit',
    defaultLimit: 50
})

const api = ({database, bodyLimit, pagination, errorHandler, auth, cors} = {}) => {
    if (! database)
        throw Error(`Wajez API: 'database' is missing`)
    bodyLimit = bodyLimit || '50mb'
    errorHandler = errorHandler || defaultErrorHandler
    pagination = R.merge(defaultPagination(), pagination || {})

    connect(database)
    const app = express()

    app.use(bodyParser.urlencoded({limit: bodyLimit, extended: true}))
    app.use(bodyParser.json({limit: bodyLimit}))

    if (cors !== false) {
        app.use(corsMiddleware(cors))
        app.options('*', corsMiddleware(cors))
    }
    if (auth)
        authenticate(app, R.merge({errorHandler}, auth))

    app.resource = (Model, params) =>
        app.use(resource(Model, R.mergeDeepRight({errorHandler, pagination}, params)))
    app.handleErrors = () => app.use(errorHandler)
    return app
}

api.mongoose = mongoose
api.express  = express
api.resource = resource

module.exports = api
