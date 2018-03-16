const R = require('ramda')
    , {Rules, generate} = require('wajez-api-test')

module.exports = (Model, count = 1, transform = null) => {
    let generated = R.range(0, count).map(() => generate(Rules.model(Model)))
    if (transform)
        generated = generated.map(transform)
    return Model.insertMany(generated)
}
