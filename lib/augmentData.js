const { groupBy, indexBy, flatten } = require('./utils.js')
const slugify = require("@11ty/eleventy/src/Filters/Slugify.js")

const { readTsv } = require('./readTsv.js')
const parseWikidata = require('./parseWikidata.js')

const getGraphPosition = (entity, relationsOrigineIds, relationsCibleIds) => {
  if (!relationsOrigineIds.has(entity.id) && !relationsCibleIds.has(entity.id))
    return "absent"
  else if (!relationsCibleIds.has(entity.id))
    return "root"
  else if (!relationsOrigineIds.has(entity.id))
    return "leaf"
  else return "intermediate"
}

const unknownCibles = new Set()

const augmentRelation = (relation, entitiesRaw) => {
  const origineEntity = entitiesRaw.find(e => e.id === relation.id)
  if (!origineEntity) {
    console.log(`Unknown origine ${relation.origine} - id ${relation.id}`)
    return null
  }
  const cibleEntity = entitiesRaw.find(e => e.nom === relation.cible)
  if (!cibleEntity) {
    if (!unknownCibles.has(relation.cible)) {
      unknownCibles.add(relation.cible)
      console.log(`Unknown cible ${relation.cible}`)
    }
    return null
  }
  const valeurRaw = relation.valeur
  const [valeurMinimum, parsedValeur] = valeurRaw.startsWith('>') ? [true, parseInt(valeurRaw.substr(1))] : [false, parseInt(valeurRaw, 10)]
  let typeRelation
  if (!isNaN(parsedValeur)) {
    typeRelation = "possède"
    valeur = parsedValeur
  }
  else if (["participe", "contrôle"].includes(valeurRaw)) {
    typeRelation = valeurRaw
    valeur = 100
  }
  else throw new Error(`Unknown valeur ${valeurRaw}`)
  return {
    ...relation,
    cibleId: cibleEntity.id,
    cibleSlug: `${slugify(relation.cible)}-${cibleEntity.id}`,
    typeRelation,
    valeur,
    valeurMinimum,
    origine: origineEntity.nom, // normalise les noms d'entités d’origine
    origineSlug: `${slugify(origineEntity.nom)}-${origineEntity.id}`
  }
}

const getIncomingRelations = ({ entity, relationsByCibleId, entitiesById, previousRelation = null, merge = false }) =>
  flatten(
    (relationsByCibleId[entity.id] || [])
      .map(relation => merge ? mergeConsecutiveRelations({ relation, previousRelation }) : relation)
      .map(relation => expandIncomingRelation({ relation, relationsByCibleId, entitiesById, merge }))
  )

const getOutgoingRelations = ({ entity, relationsByOrigineId, entitiesById, previousRelation = null, merge = false }) =>
  flatten(
    (relationsByOrigineId[entity.id] || [])
      .map(relation => merge ? mergeConsecutiveRelations({ relation, previousRelation }) : relation)
      .map(relation => expandOutgoingRelation({ relation, relationsByOrigineId, entitiesById, merge }))
  )


const expandIncomingRelation = ({ relation, relationsByCibleId, entitiesById, merge }) => {
  const origineEntity = entitiesById[relation.id]
  if (origineEntity.graphPosition == "root")
    return relation
  else {
    const expandedRelations = getIncomingRelations({ entity: origineEntity, relationsByCibleId, entitiesById, previousRelation: relation, merge })
    return merge ? expandedRelations : [relation, ...expandedRelations]
  }
}

const expandOutgoingRelation = ({ relation, relationsByOrigineId, entitiesById, merge }) => {
  const cibleEntity = entitiesById[relation.cibleId]
  if (cibleEntity.graphPosition == "leaf")
    return relation
  else {
    const expandedRelations = getOutgoingRelations({ entity: cibleEntity, relationsByOrigineId, entitiesById, previousRelation: relation, merge })
    return merge ? expandedRelations : [relation, ...expandedRelations]
  }
}

const mergeConsecutiveRelations = ({ relation, previousRelation }) => {
  if (!previousRelation) return relation
  const valeur = relation.valeur * previousRelation.valeur / 100
  const valeurMinimum = relation.valeurMinimum || previousRelation.valeurMinimum
  const typeRelations = new Set([relation.typeRelation, previousRelation.typeRelation])
  const typeRelation = (
    typeRelations.has("participe") ? "participe" : (
      typeRelations.has("contrôle") ? "contrôle" : "possède"
    )
  )
  return { ...relation, valeur, valeurMinimum, typeRelation, indirecte: true }
}

const mergeParallelRelations = relations => {
  const relationsByIdsPairs = groupBy(relations.map(r => ({ ...r, idsPair: `${r.id}-${r.cibleId}` })), "idsPair")
  return Object.values(relationsByIdsPairs).map(relations => {
    const valeur = relations.map(r => r.valeur).reduce((partialSum, a) => partialSum + a, 0)
    const valeurMinimum = relations.some(r => r.valeurMinimum)
    const typeRelations = new Set(relations.map(r => r.typeRelation))
    if (typeRelations.length > 1) throw new Error(`Incompatible typeRelations ${typeRelations}`)
    return { ...relations[0], valeur, valeurMinimum }
  })
}

const getAllRelations = ({ entity, relationsByOrigineId, relationsByCibleId, entitiesById }) =>
  flatten([
    getIncomingRelations({ entity, relationsByCibleId, entitiesById }),
    getOutgoingRelations({ entity, relationsByOrigineId, entitiesById })
  ])

const getUniqueEntitiesFromRelations = ({ relations, entitiesById }) => {
  const entities = new Set()
  for (const relation of relations) {
    const origineEntity = entitiesById[relation.id]
    if (!entities.has(origineEntity)) entities.add(origineEntity)
    const cibleEntity = entitiesById[relation.cibleId]
    if (!entities.has(cibleEntity)) entities.add(cibleEntity)
  }
  return Array.from(entities)
}


const augmentEntitiesAndRelations = ({ entitiesRaw, relationsRaw, entitiesWikidataIds, wikidata }) => {
  const relations = relationsRaw.map(r => augmentRelation(r, entitiesRaw)).filter(r => r)
  const relationsByOrigineId = groupBy(relations, 'id')
  const relationsOrigineIds = new Set(Object.keys(relationsByOrigineId))
  const relationsByCibleId = groupBy(relations, 'cibleId')
  const relationsCibleIds = new Set(Object.keys(relationsByCibleId))
  let entities = entitiesRaw.map(entityRaw => ({
    ...entityRaw,
    graphPosition: getGraphPosition(entityRaw, relationsOrigineIds, relationsCibleIds),
    slug: `${slugify(entityRaw.nom)}-${entityRaw.id}`,
    ...parseWikidata({ entityRaw, wikidata, entitiesWikidataIds })
  })).sort((a, b) => a.nom.localeCompare(b.nom))

  const entitiesById = indexBy(entities, 'id')
  entities = entities.map(entity => ({
    ...entity,
    incomingRelations: mergeParallelRelations(getIncomingRelations({ entity, relationsByCibleId, entitiesById, merge: true })),
    outgoingRelations: mergeParallelRelations(getOutgoingRelations({ entity, relationsByOrigineId, entitiesById, merge: true })),
    allRelations: getAllRelations({ entity, relationsByOrigineId, relationsByCibleId, entitiesById })
  }))

  entities = entities.map(entity => ({
    ...entity,
    allRelationsEntities: getUniqueEntitiesFromRelations({ relations: entity.allRelations, entitiesById })
  }))

  return { entities, relations }
}

const getAugmentedEntitiesAndRelations = () =>
  augmentEntitiesAndRelations({
    entitiesRaw: readTsv("data/entitiesRaw.tsv"),
    relationsRaw: readTsv("data/relationsRaw.tsv"),
    entitiesWikidataIds: readTsv("data/entitiesWikidataIds.tsv"),
    wikidata: JSON.parse(require('fs').readFileSync("data/wikidata.json"))
  })

module.exports = { augmentEntitiesAndRelations, getAugmentedEntitiesAndRelations }
