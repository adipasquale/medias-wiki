const fs = require('fs')
const path = require('node:path')
const matter = require('gray-matter')

const { getAugmentedEntitiesAndRelations } = require('../lib/augmentData.js')
const httpsGetJson = require('../lib/httpsGetJson.js')
const { sleep } = require('../lib/utils.js')

// is cli arg --overwrite present?
const overwrite = process.argv.slice(2).includes('--overwrite')

const { entities } = getAugmentedEntitiesAndRelations()

async function run() {
  for (const { slug, graphPosition, wikidata, typeCode } of entities) {
    let dir;
    if (graphPosition == "root" && ["1", "2"].includes(typeCode)) dir = "proprietaires"
    else if (graphPosition == "leaf" && typeCode == "3") dir = "medias"
    if (!dir) continue

    const markdownPath = `11ty_input/${dir}/${slug}.md`
    const parsed = matter.read(markdownPath)
    if (parsed.content.trim() && !overwrite) {
      console.log("markdown content already exists")
      continue
    }

    const { wikipediaUrl } = wikidata || {}
    if (!wikipediaUrl) {
      console.log("no wikipediaUrl in entity")
      continue
    }

    const title = wikipediaUrl.split('/').pop()
    const url = `http://fr.wikipedia.org/w/api.php?action=query&titles=${title}&prop=extracts&exintro&explaintext&redirects=1&format=json`
    const data = await httpsGetJson(url)
    if (!data.query.pages) {
      console.log("no pages in JSON")
      continue
    }

    const { extract } = Object.values(data.query.pages)[0] || {}
    if (!extract?.trim()) {
      console.log("no extract in wikipedia JSON")
      continue
    }

    console.log(`writing extract '${extract.slice(0, 20)}...' in markdown file ${markdownPath}`)
    fs.writeFileSync(markdownPath, matter.stringify(`\n${extract}`, parsed.data))
    await sleep(500)
  }
}
run()
