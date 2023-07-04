const fs = require('fs')
const md5 = require("crypto-js/md5")

const downloadFile = require("../lib/downloadFile.js")
const { getAugmentedEntitiesAndRelations } = require('../lib/augmentData.js')



const downloadWikipediaImage = ({ slug, wikidata }) => {
  const { wikipediaUrl } = wikidata
  console.log(wikipediaUrl)
  const title = wikipediaUrl.split('/').pop()
  const url = `http://fr.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=500`
  console.log(url)

  // const downloadPath = `11ty_input/img/wikipedia/${slug}`
  // if (!fs.existsSync(downloadPath)) {
  //   downloadFile(
  //     `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.substring(0, 2)}/${filenameOriginal}`,
  //     `11ty_input/img/wikidata/${filenameEleventy}`
  //   )
  // }
}

// http://en.wikipedia.org/w/api.php?action=query&titles=Al-Farabi&prop=pageimages&format=json&pithumbsize=100

const sleep = (milliseconds) => { return new Promise(resolve => setTimeout(resolve, milliseconds)) }

(async function () {
  for (const entity of getAugmentedEntitiesAndRelations().entities.filter(e => e.wikidata?.wikipediaUrl)) {
    downloadWikipediaImage(entity)
    await sleep(500)
  }
})();
