const Crawler = require('crawler');
const companies = require('./companies');
const seed = 'rcrwireless.com';
const fs = require('fs');
const crawled = { [seed]: true };
const found = {};
let count = 0

const crawler = new Crawler({
  callback: (_error, { $ }, done) => {
    if ($) {
      console.log($('title').text());
      companies.forEach(company => {
        const numFound = ($('body').text().match(new RegExp(company, 'g')) || []).length;
        if (numFound) {
          if (!found[company]) found[company] = numFound;
          else found[company] += numFound;
        }
      })
      
      $('a[href]:not(.share-icon)').get().forEach(element => {
        if (element.attribs.href.includes(seed)) {
          let url = element.attribs.href;
          // console.log(url)
          if (!crawled[url] && count < 1000) {
            count++;
            crawled[url] = true;
            crawler.queue(url);
          }
        }
      });
    }
    console.log(crawler.queueSize)
    if (crawler.queueSize === 1) {
      fs.writeFileSync('found.json', JSON.stringify(found, null, 2));
      fs.writeFileSync('crawled.json', JSON.stringify(crawled, null, 2));
    }
    done();
  }
});

crawler.queue(`https://${seed}`);
