const fs = require('fs')

const { sleep } = require("../lib/utils.js")
const downloadFile = require("../lib/downloadFile.js")
const httpsGetJson = require("../lib/httpsGetJson.js")
const { getAugmentedEntitiesAndRelations } = require('../lib/augmentData.js')


const downloadWikipediaImage = async ({ slug, wikidata }) => {
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
  if (!fs.existsSync(downloadPath))
    downloadFile(imageUrl, downloadPath)
}

(async function () {
  for (const entity of getAugmentedEntitiesAndRelations().entities.filter(e => e.wikidata?.wikipediaUrl)) {
    await downloadWikipediaImage(entity)
    await sleep(1000)
  }
})();
