const fs = require('fs');
const https = require('https');

const downloadFile = (url, path) => {
  console.log(`Downloading file: ${url}`)
  // https get with specific user agent

  // parse url
  const urlObj = new URL(url)

  https.get(
    {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'MediasFrancaisBot/0.0.1 (https://github.com/adipasquale/medias_proprietaires; adrien@dipasquale.fr) https'
      }
    },
    (res) => {
      if (res.statusCode !== 200) {
        console.error(`Failed to download file: ${res.statusCode} ${res.statusMessage}`);
        return;
      }
      const writeStream = fs.createWriteStream(path)
      res.pipe(writeStream)
      writeStream.on('finish', () => {
        writeStream.close()
        console.log(`File ${path} downloaded!`)
      })
    }).on('error', (err) => {
      console.error(`Failed to download file: ${err.message}`);
    })
}

module.exports = downloadFile;
