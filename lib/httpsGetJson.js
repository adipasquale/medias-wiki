const https = require('https');

const httpsGetJson = async (url, callback) => {
  return new Promise((resolve, reject) => {
    console.log(`reading JSON from: ${url}...`)
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
          console.error(`got http status code ${res.statusCode} ${res.statusMessage}`);
          return;
        }
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        }).on('end', () => {
          resolve(JSON.parse(data))
        })
      }).on('error', (err) => {
        console.error(`Failed to read JSON from : ${err.message}`);
        reject(err)
      })
  })
}

module.exports = httpsGetJson;
