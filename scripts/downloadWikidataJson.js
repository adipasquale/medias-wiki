const { readTsv } = require("../lib/readTsv.js")
const httpsGetJson = require("../lib/httpsGetJson.js")
const upsertJsonFile = require("../lib/upsertJsonFile.js")

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  const wikidataIds = readTsv("11ty_input/_data/entitiesWikidataIds.tsv")
    .map(r => r.wikidata_id)
    .filter(id => id)
  for (const wikidataId of wikidataIds) {
    const data = await httpsGetJson(`https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`)
    upsertJsonFile("11ty_input/_data/wikidata.json", data.entities)
    console.log(`wrote ${wikidataId} to 11ty_input/_data/wikidata.json`)
    await delay(1000)
  }
}

main()
