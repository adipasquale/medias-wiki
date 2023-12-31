const { readTsv } = require("../lib/readTsv.js")
const httpsGetJson = require("../lib/httpsGetJson.js")
const upsertJsonFile = require("../lib/upsertJsonFile.js")

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// get all keys from data/wikidata.json
const existingWikidataIds = Object.keys(require("../data/wikidata.json"))

async function main() {
  const wikidataIds = readTsv("data/entitiesRaw.tsv")
    .map(r => r.wikidataId)
    .filter(id => id)
  for (const wikidataId of wikidataIds) {
    if (existingWikidataIds.includes(wikidataId)) continue

    const data = await httpsGetJson(`https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`)
    upsertJsonFile("data/wikidata.json", data.entities)
    console.log(`wrote ${wikidataId} to data/wikidata.json`)
    await delay(1000)
  }
}

main()
