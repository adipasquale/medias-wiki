const downloadFile = require("../lib/downloadFile.js")

downloadFile(
  "https://raw.githubusercontent.com/adipasquale/Medias_francais/wikidata-2023-07/medias_francais.tsv",
  "11ty_input/_data/entitiesWikidataIds.tsv"
)
