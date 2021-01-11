const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fetch = require('node-fetch');

// fetch("https://store.asus.com/us/item/202012AM160000002").then(res => {
//     res.text().then(text => {
//         console.log(text)
//         const res = new JSDOM(text.toString())
//         console.log(res.window.document.body)
//     })
// })

const dom = new JSDOM(``, {
    url: "https://example.org/",
    referrer: "https://example.com/",
    contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000
  });

  console.log(dom.window.document.body);