const config = require('./config.json');
const slack = require('slack-node');
const request = require('request');
const fs = require('fs');

const exportEmoji = (name, url) =>
  new Promise((resolve, reject) => {
    request.get(url)
      .on('response', (res) => {
        res.pause();
        resolve(res);
      })
      .on('error', (err) => {
        reject(err);
      });
  })
  .then((res) => {
    res.pipe(fs.createWriteStream(`emoji/${name}.png`));
  });

new slack(config.apiToken).api('emoji.list', (err, res) => {
  (async () => {
    if (err) throw new Error(err);
    const target = Object.entries(res.emoji).filter(arr => arr[1].startsWith('http'));
    await Promise.all(target.map(arr => exportEmoji(...arr)));
  })().catch((result) => {
    console.error(result);
  });
});
