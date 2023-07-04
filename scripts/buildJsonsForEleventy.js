const fs = require('fs')

const { getAugmentedEntitiesAndRelations } = require('../lib/augmentData.js')

const entities = getAugmentedEntitiesAndRelations().entities

const writeJsonFile = (path, entity) => {
  fs.writeFileSync(path, JSON.stringify(entity, null, 2))
  console.log(`Created ${path}`)
}

entities
  .filter(e => ['1', '2'].includes(e.typeCode))
  .filter(e => e.graphPosition == "root")
  .forEach(entity => {
    writeJsonFile(`11ty_input/proprietaires/${entity.slug}.json`, entity)
  })

entities
  .filter(e => ['3'].includes(e.typeCode))
  .filter(e => e.graphPosition == "leaf")
  .forEach(entity => {
    writeJsonFile(`11ty_input/medias/${entity.slug}.json`, entity)
  })
