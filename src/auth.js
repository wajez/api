const R = require('ramda')
    , jwt = require('jsonwebtoken')
    , expressJWT = require('express-jwt')

const defaultResponses = () => ({
    accessDenied: {error: 'Unauthorized Access'},
    wrongCredits: {error: 'Wrong Credentials'},
    internalError: {error: 'Internal Server Error'}
})

const auth = (app, {secret, Model, fields, responses, route, ignore} = {}) => {
    responses = R.merge(defaultResponses(), responses || {})
    route = route || '/auth'
    ignore = ignore || []

    app.use(expressJWT({secret}).unless({path: ignore}))

    app.use(function (err, req, res, next) {
        if (err.name === 'UnauthorizedError')
            return res.status(401).json(responses.accessDenied)
        next()
    })

    app.use((req, res, next) => {
        if (req.user) {
            Model.findOne({_id: req.user.id})
            .then(user => {
                if (user === null)
                    return res.status(401).json(responses.accessDenied)
                req.user = user
                next()
            })
        } else
            next()
    })

    app.post(route, (req, res) => {
        const filter = {}
        for(let i = 0; i < fields.length; i ++) {
            if (!req.body[fields[i]])
                return res.status(401).json(responses.wrongCredits)
            filter[fields[i]] = req.body[fields[i]]
        }
        Model.findOne(filter)
        .then(user => {
            if (null === user)
                return res.status(401).json(responses.wrongCredits)
            const token = jwt.sign({id: user.id}, secret)
            res.json({token})
        })
        .catch(err => {
            console.error(err)
            res.status(500).json(responses.internalError)
        })
    })
}

module.exports = auth
