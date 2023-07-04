const fs = require('fs');

const upsertJsonFile = (path, newData) => {
  // if file does not exist
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify(newData))
  } else {
    fs.writeFileSync(
      path,
      JSON.stringify({ ...JSON.parse(fs.readFileSync(path)), ...newData })
    )
  }
}

module.exports = upsertJsonFile
