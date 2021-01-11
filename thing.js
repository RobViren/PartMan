const { chromium, devices } = require('playwright');
const iPhone11 = devices['iPhone 11 Pro'];
const fs = require('fs')
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"))

async function checkBH(url) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...iPhone11,
    locale: 'en-US'
  });
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForTimeout(5000)
  const dimensions = await page.evaluate(() => {
    return {
      data: document.querySelector('#cart-call-to-action')
    }
  });

  await browser.close();

  return (dimensions);
}

async function checkMC(url) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...iPhone11,
    locale: 'en-US'
  });
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForSelector('.inventoryCnt')
  const res = await page.evaluate(() => {
    return {
      data: document.querySelector('.inventoryCnt').innerText,
    }
  });

  await browser.close();
  res.url = url;
  return (res);
}

(async () => {
  let futs = []
  //let res = await checkMC(config.MC[1])
  config.MC.forEach(url => {
    futs.push(checkMC(url))
  })
  const res = await Promise.all(futs)
  console.log(res);
})();