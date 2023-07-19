const nunjucks = require('nunjucks')
const fs = require('fs')
const path = require('path')

const { groupBy, getEntityDirectory } = require("../lib/utils.js")
const { getAugmentedEntitiesAndRelations } = require('../lib/augmentData.js')

const env = nunjucks.configure(path.join(__dirname))
const template = env.getTemplate('relationsGraph.dot.njk')

const buildDotAndSvgFiles = ({ entities, relations, dotPath, svgPath }) => {
  const entitiesByGraphPosition = groupBy(entities, "graphPosition")
  fs.writeFileSync(dotPath, template.render({ entitiesByGraphPosition, relations }))
  console.log(`Created ${dotPath}`)
  // render dot file to svg by calling shell
  const cmd = `dot -Tsvg ${dotPath} -o ${svgPath}`
  const execSync = require('child_process').execSync(cmd)
  console.log(`Created ${svgPath}`)
}

const { entities: allEntities, relations: allRelations } = getAugmentedEntitiesAndRelations()

buildDotAndSvgFiles({
  entities: allEntities,
  relations: allRelations,
  dotPath: "11ty_input/assets/allRelationsGraph.dot",
  svgPath: "11ty_input/img/graphs/allRelationsGraph.svg",
})

// allEntities.forEach(entity => {
//   const { allRelationsEntities, allRelations, slug } = entity

//   const dotPath = `11ty_input/assets/${slug}-relations-graph.dot`
//   const svgPath = `11ty_input/img/graphs/${slug}-relations-graph.svg`

//   if (!getEntityDirectory(entity)) {
//     if (fs.existsSync(dotPath)) fs.unlinkSync(dotPath)
//     if (fs.existsSync(svgPath)) fs.unlinkSync(svgPath)
//     return
//   }

//   buildDotAndSvgFiles({
//     entities: allRelationsEntities,
//     relations: allRelations,
//     dotPath, svgPath
//   })
// })
