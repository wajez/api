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

module.exports = {relationsOf, inverseRelation}
