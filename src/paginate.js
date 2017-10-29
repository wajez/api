const int = (text, defaultValue) => {
    const value = parseInt(text)
    if (isNaN(value))
        return defaultValue
    return value
}

module.exports = ({offsetParam, limitParam, defaultLimit}, fields) => {
    return (req, res, next) => {
        if (!req.wz)
            req.wz = {}

        req.wz.offset = int(req.query[offsetParam], 0)
        req.wz.limit  = int(req.query[limitParam], defaultLimit)

        fields.forEach(field => {
            field = field + '-'
            req.wz[field + 'offset'] = int(req.query[field + offsetParam], 0)
            req.wz[field + 'limit']  = int(req.query[field + limitParam], defaultLimit)
        })

        next()
    }
}
