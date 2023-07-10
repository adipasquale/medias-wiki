const fs = require('fs')

const wikidataFilenamesWithoutExts =
  fs.readdirSync('11ty_input/img/wikidata')
    .map(filename => filename.replace(/\.[^/.]+$/, ""))

console.log("wikidataFilenamesWithoutExts", wikidataFilenamesWithoutExts.slice(3))

// iterate file names in 11ty_input/img/wikipedia
fs.readdirSync('11ty_input/img/wikipedia')
  .forEach(filename => {
    const filenameWithoutExtension = filename.replace(/\.[^/.]+$/, "")
    if (wikidataFilenamesWithoutExts.includes(filenameWithoutExtension)) {
      console.log(`rm 11ty_input/img/wikipedia/${filename}`)
      fs.unlinkSync(`11ty_input/img/wikipedia/${filename}`)
    }
  })
