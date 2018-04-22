const {$, def, model} = require('wajez-utils')
const T = require('../types')

const inverseRelation = def('inverseRelation', {}, [T.Relation, T.Relation],
  ({type, source, target}) => ({
    type: (
      (type === 'one-many') ? 'many-one' :
      (type === 'many-one') ? 'one-many' :
      type
    ),
    source: target,
    target: source
  })
)

const relationsOf = def('relationsOf', {}, [T.MongooseModel, $.Array(T.Relation), $.Array(T.Relation)],
  (model, relations) => {
    const name = model.modelName
    return relations.filter(({source, target}) => source.name === name || target.name === name)
      .map(relation => (relation.source.name === name) ? relation : inverseRelation(relation))
      .filter(({source}) => source.field)
  }
)

const getRelatedFields = def('getRelatedFields', {}, [T.MongooseModel, $.Array($.String)],
  parent => {
    const {fields} = model(parent)
    return Object.keys(fields).filter(key => {
      const {type, schema} = fields[key]
      return type === 'reference' || (type === 'array' && schema.type === 'reference')
    })
  }
)

const getRelatedArrayFields = def('getRelatedFields', {}, [T.MongooseModel, $.Array($.String)],
  parent => {
    const {fields} = model(parent)
    return Object.keys(fields).filter(key => {
      const {type, schema} = fields[key]
      return type === 'array' && schema.type === 'reference'
    })
  }
)

module.exports = {relationsOf, getRelatedFields, getRelatedArrayFields, inverseRelation}
