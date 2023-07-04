const fs = require('fs')

const { getAugmentedEntitiesAndRelations } = require('../lib/augmentData.js')

const entities = getAugmentedEntitiesAndRelations().entities

const writeMdFile = (path) => {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, "")
    console.log(`Created ${path}`)
  }
}

entities
  .filter(e => ['1', '2'].includes(e.typeCode))
  .filter(e => e.graphPosition == "root")
  .forEach(e => writeMdFile(`11ty_input/proprietaires/${e.slug}.md`))

entities
  .filter(e => ['3'].includes(e.typeCode))
  .filter(e => e.graphPosition == "leaf")
  .forEach(e => writeMdFile(`11ty_input/medias/${e.slug}.md`))
