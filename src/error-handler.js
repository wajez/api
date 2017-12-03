module.exports = (err, req, res, next) => {
    console.error(err.name)
    switch (err.name) {
        case 'ValidationError':
            return res.status(400).json({error: err.message})
        case 'UnauthorizedError':
            return res.status(401).json({error: 'Access Denied'})
        case 'WrongCredentialsError':
            return res.status(401).json({error: 'Wrong Credentials'})
    }
    res.status(500).json({error: 'Unknkown Error'})
}
