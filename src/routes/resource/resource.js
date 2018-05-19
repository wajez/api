const {$, def, merge} = require('wajez-utils')
const T = require('../../types')
const {inverseRelation} = require('../../helpers')
const {list} = require('./list')
const {add} = require('./add')
const {edit} = require('./edit')
const {show} = require('./show')
const {destroy} = require('./destroy')
const {showRelated} = require('./show-related')

const resource = def('resource', {}, [T.MongooseModel, T.ResourceConfig, $.Array(T.Route)],
  (model, config) => {
    const routes = []

    const defaults = merge({relations: config.relations || []}, config.defaults || {})
    routes.push(list(model, merge(defaults, config.list || {})))
    routes.push(add(model, merge(defaults, config.add || {})))
    routes.push(edit(model, merge(defaults, config.edit || {})))
    routes.push(show(model, merge(defaults, config.show || {})))
    routes.push(destroy(model, merge(defaults, config.destroy || {})))

    config.fields = config.fields || {}
    for(let relation of config.relations) {
      if (relation.target.name === model.modelName)
        relation = inverseRelation(relation)
      if (relation.source.name === model.modelName && relation.source.field) {
        const fieldConfigs = config.fields[relation.source.field] || {}
        routes.push(showRelated(relation, fieldConfigs.show || fieldConfigs.list || {}))
      }
    }

    return routes
  }
)

module.exports = {
  resource: (model, config = {}) => resource(model, config)
}
