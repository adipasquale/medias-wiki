const fs = require('fs')
const md5 = require("crypto-js/md5")

const downloadFile = require("../lib/downloadFile.js")
const { getAugmentedEntitiesAndRelations } = require('../lib/augmentData.js')


const downloadWikidataImage = ({ filenameOriginal, filenameEleventy }) => {
  const hash = md5(filenameOriginal).toString()
  const downloadPath = `11ty_input/img/wikidata/${filenameEleventy}`
  if (!fs.existsSync(downloadPath)) {
    downloadFile(
      `https://upload.wikimedia.org/wikipedia/commons/${hash[0]}/${hash.substring(0, 2)}/${filenameOriginal}`,
      `11ty_input/img/wikidata/${filenameEleventy}`
    )
  }
}

getAugmentedEntitiesAndRelations()
  .entities
  .map(e => e.wikidata?.image)
  .filter(i => i)
  .forEach(downloadWikidataImage)

