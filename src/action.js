const make = ({method, route, beforeQuery, query, beforeJson, json, beforeSend, send, errorHandler} = {}) => ({
    route, method, query, json, errorHandler,
    beforeQuery: beforeQuery || (() => null),
    beforeJson: beforeJson || (data => data),
    beforeSend: beforeSend || (data => data),
    send: send || ((data, res) => res.json(data))
})

const action = (app, params) => {
    const {method, route, beforeQuery, query, beforeJson, json, beforeSend, send, errorHandler} = make(params)
    app[method](route, (req, res) => {
        Promise.resolve(beforeQuery(req, res))
        .then(() => res.headersSent ? null : query(req))
        .then(data => res.headersSent ? null : beforeJson(data, req, res))
        .then(data => res.headersSent ? null : json(data))
        .then(data => res.headersSent ? null : beforeSend(data, req, res))
        .then(data => res.headersSent ? null : send(data, res))
        .catch(err => errorHandler(err, req, res))
    })
}

module.exports = action
