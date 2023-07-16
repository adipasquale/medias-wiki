const fs = require('fs')

const { sleep, getEntityDirectory } = require("../lib/utils.js")
const downloadFile = require("../lib/downloadFile.js")
const httpsGetJson = require("../lib/httpsGetJson.js")
const matter = require('gray-matter')
const { getAugmentedEntitiesAndRelations } = require('../lib/augmentData.js')


const downloadWikipediaImage = async ({ slug, wikidata, overwrite }) => {
  const { wikipediaUrl } = wikidata
  console.log(wikipediaUrl)
  const title = wikipediaUrl.split('/').pop()
  const url = `http://fr.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=300`
  const data = await httpsGetJson(url)
  if (!data.query.pages)
    return console.log("no pages in JSON")

  const page = Object.values(data.query.pages)[0]
  const imageUrl = page?.thumbnail?.source
  if (!imageUrl)
    return console.log("no thumbnail in JSON")

  const ext = imageUrl.split('.').pop()
  const downloadPath = `11ty_input/img/wikipedia/${slug}.${ext}`
  if (fs.existsSync(downloadPath) && !overwrite) return

  downloadFile(imageUrl, downloadPath)
}

// get cli arg boolean overwrite
const overwrite = process.argv.slice(2).includes('--overwrite');

(async function () {
  for (const entity of getAugmentedEntitiesAndRelations().entities.filter(e => e.wikidata?.wikipediaUrl)) {

    // read frontmatter data from matching md file

    const dir = getEntityDirectory(entity)
    if (!dir) continue

    const { data } = matter.read(`11ty_input/${dir}/${entity.slug}.md`)
    if (data.imagePath && !overwrite) continue

    await downloadWikipediaImage({ ...entity, overwrite })
    await sleep(1000)
  }
})();
