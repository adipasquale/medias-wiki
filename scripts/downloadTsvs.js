const downloadFile = require("../lib/downloadFile.js")

downloadFile(
  "https://raw.githubusercontent.com/adipasquale/Medias_francais/all-patches/medias_francais.tsv",
  "data/entitiesRaw.tsv"
)

downloadFile(
  "https://raw.githubusercontent.com/adipasquale/Medias_francais/all-patches/relations_medias_francais.tsv",
  "data/relationsRaw.tsv"
)

