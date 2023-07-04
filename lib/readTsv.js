const fs = require('fs');
const { parse } = require('csv-parse/sync')

const parseTsvOptions = {
  columns: true,
  skip_empty_lines: true,
  delimiter: '\t',
  relax_column_count: true
}

const readTsv = (path) => parse(fs.readFileSync(path), parseTsvOptions)

module.exports = { readTsv, parseTsvOptions };
