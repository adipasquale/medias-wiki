const slugify = require("@11ty/eleventy/src/Filters/Slugify.js")

const parseWikidata = ({ entityRaw, wikidata, entitiesWikidataIds }) => {
  const wikidataId = entitiesWikidataIds.find(w => w.id === entityRaw.id)?.wikidata_id
  if (!wikidataId) return {}

  const wikidataRaw = wikidata[wikidataId]
  let attributes = {
    id: wikidataRaw.id,
    wikipediaUrl: wikidataRaw.sitelinks?.frwiki?.url,
    ...parseImage({ wikidataRaw, entityRaw }),
  }

  return { wikidata: attributes }
}

const parseImage = ({ wikidataRaw, entityRaw }) => {
  for (const { attributeName, claimId } of ([
    { attributeName: "logo", claimId: "P154" },
    { attributeName: "image", claimId: "P18" }
  ])) {
    const claim = wikidataRaw.claims[claimId]
    if (claim)
      return {
        image: {
          typeImage: attributeName,
          ...parseImageClaim({ claim, entityRaw })
        }
      }
  }
}

const parseImageClaim = ({ claim, entityRaw }) => {
  const { nom, id } = entityRaw
  const slug = slugify(`${nom}-${id}`)
  const filenameOriginal = claim[0].mainsnak.datavalue.value.replace(/ /g, "_")
  const ext = filenameOriginal.split(".").pop()
  const filenameEleventy = `${slug}.${ext}`

  return { filenameOriginal, filenameEleventy }
}

module.exports = parseWikidata
