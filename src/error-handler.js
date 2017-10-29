module.exports = (err, req, res, next) => {
    switch (err.name) {
        case 'ValidationError':
            return res.status(400).json({error: err.message})
        case 'UnauthorizedError':
            return res.status(401).json({error: 'Access Denied'})
        case 'WrongCredentialsError':
            return res.status(401).json({error: 'Wrong Credentials'})
    }
    console.error(err)
    res.status(500).json({error: 'Unknkown Error'})
}
