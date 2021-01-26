//Native
const fs = require('fs')
const path = require('path')
const process = require('process')

//Playwright
const { chromium, devices } = require('playwright-core');
const chrome_path = `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`
const edge_path = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

//Discord
const Discord = require('discord.js');
const { request } = require('http');
const dkey = fs.readFileSync(path.join(__dirname,"discord.txt"), "utf-8").replace("https://discord.com/api/webhooks/", "")
const dkey1 = dkey.substring(0, dkey.indexOf('/'))
const dkey2 = dkey.substring(dkey.indexOf('/') + 1)
const hook = new Discord.WebhookClient(dkey1, dkey2)

//Config
const urls = JSON.parse(fs.readFileSync(path.join(__dirname,"urls.json"), "utf-8"))

//Store Part Status
let part_state = []

//Runtime Object
async function init() {
  let browser
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: chrome_path
    })
  } catch (e) {
    browser = await chromium.launch({
      headless: true,
      executablePath: edge_path
    })
  }
  const context = await browser.newContext({
    ...devices["iPhone 11"],
  })
  const page = await context.newPage()

  this.browser = browser
  this.page = page
  this.context = context
  this.close = async () => {
    await this.context.close()
    await this.browser.close()
  }
  this.processURL = processURL

  return this
}

async function processURL(url) {
  let store = getStore(url)
  let res = await store.check(this.page)
  updateParts(res)
}

function getStore(url) {
  this.url = url
  if (url.includes("microcenter.com")) {
    this.check = microcenterCheck
  } else if (url.includes("bestbuy.com")) {
    this.check = bestbuyCheck
  } else if (url.includes("newegg.com")) {
    this.check = neweggCheck
  }
  return this
}

async function scrollPageToBottom(page) {
  const res = await page.evaluate(async () => {
    const getScrollHeight = (element) => {
      if (!element) return 0

      const { scrollHeight, offsetHeight, clientHeight } = element
      return Math.max(scrollHeight, offsetHeight, clientHeight)
    }

    const position = await new Promise((resolve) => {
      let count = 0
      const intervalId = setInterval(() => {
        const { body } = document
        const availableScrollHeight = getScrollHeight(body)

        window.scrollBy(0, 250)
        count += 250

        if (count >= availableScrollHeight) {
          clearInterval(intervalId)
          resolve(count)
        }
      }, 100)
    })
    return position
  })
}

async function microcenterCheck(page) {
  await page.goto(this.url)
  await scrollPageToBottom(page)
  const res = await page.evaluate(() => {
    const price_regex = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/
    let res = []
    let products = document.querySelectorAll('.product_wrapper')
    products.forEach(product => {
      var price = "N/A"

      if (price_regex.exec(product.innerText)) {
        price = parseFloat(price_regex.exec(product.innerText)[0].replace(',', ""))
      }
      let status = false
      if (product.innerText.includes("IN STOCK")) {
        status = true
      }
      res.push({
        url: product.children[0].children[1].href,
        price: price,
        status: status,
      })
    })
    return (res)
  })
  for (let i = 0; i < res.length; i++) {
    if (typeof res[i].url === 'undefined' || typeof res[i].price === 'undefined') {
      res.splice(i, 1)
      i = i - 1
    }
  }
  return (res)
}

async function bestbuyCheck(page) {
  await page.goto(this.url)
  await scrollPageToBottom(page)
  const res = await page.evaluate(() => {
    const price_regex = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/
    let res = []
    var headers = document.querySelectorAll('.sku-header')
    var products = document.querySelectorAll('.sku-item')
    for (var i = 0; i < products.length; i++) {
      var price = "N/A"

      if (price_regex.exec(products[i].innerText)) {
        price = parseFloat(price_regex.exec(products[i].innerText)[0].replace(',', ""))
      }
      var status = false
      if (products[i].innerText.includes("Add to")) {
        status = true
      }
      res.push({
        url: headers[i].children[0].href,
        price: price,
        status: status
      })
    }
    return (res)
  })
  for (let i = 0; i < res.length; i++) {
    if (typeof res[i].url === 'undefined' || typeof res[i].price === 'undefined') {
      res.splice(i, 1)
      i = i - 1
    }
  }
  return (res)
}

async function neweggCheck(page) {
  await page.goto(this.url)
  await scrollPageToBottom(page)
  const res = await page.evaluate(() => {
    const price_regex = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/
    let res = []
    let products = document.querySelectorAll('.item-container')
    products.forEach(product => {
      var price = "N/A"
      if (price_regex.exec(product.innerText)) {
        price = parseFloat(price_regex.exec(product.innerText)[0].replace(',', ""))
      }
      res.push({
        url: product.href,
        price: price,
        status: !product.innerText.includes("OUT OF STOCK")
      })
    })
    return (res)
  })
  for (let i = 0; i < res.length; i++) {
    if (typeof res[i].url === 'undefined' || typeof res[i].price === 'undefined') {
      res.splice(i, 1)
      i = i - 1
    }
  }
  return (res)
}

function updateParts(res) {
  var out_stock = []
  var send_alert = false
  // Iterate to check to see if part needs to be removed
  res.forEach(new_part => {
    if (new_part.url) {
      for (var i = 0; i < part_state.length; i++) {
        if (new_part.url == part_state[i].url) {
          //Need to remove
          if (!new_part.status) {
            out_stock.push(new_part.url)
            part_state.splice(i, 1)
            send_alert = true
          }
        }
      }
    }
  })

  // Iterate to check for part already there
  res.forEach(new_part => {
    if (new_part.url) {
      var needs_update = true
      for (var i = 0; i < part_state.length; i++) {
        if (new_part.url == part_state[i].url) {
          //Already there
          if (new_part.status) {
            needs_update = false
          }
        }
      }
      // New Part that is not currently on list
      if (needs_update) {
        if (new_part.status) {
          part_state.push(new_part)
          send_alert = true
        }
      }
    }
  })

  if (send_alert) {
    let in_stock_message = { embeds: [{ title: "In Stock", fields: [] }] }
    let out_stock_message = { embeds: [{ title: "Out of Stock", fields: [] }] }
    let in_stock_fileds = 0
    let out_stock_fields = 0

    part_state.forEach((part) => {
      in_stock_message.embeds[in_stock_fileds].fields.push({
        name: `$${part.price}`,
        value: `${part.url}`,
        inline: true
      })
      if (in_stock_message.embeds[in_stock_fileds].fields.length >= 25) {
        in_stock_message.embeds.push({ title: "More In Stock", fields: [] })
        in_stock_fileds++
      }
    })

    out_stock.forEach((part) => {
      out_stock_message.embeds[out_stock_fields].fields.push({
        name: `Out of Stock`,
        value: `${part}`,
        inline: true
      })
      if (out_stock_message.embeds.length >= 25) {
        out_stock_message.embeds.push({ title: "More Out of Stock", fields: [] })
        out_stock_fields++
      }
    })

    if (in_stock_message.embeds[0].fields.length > 0) {
      hook.send(in_stock_message)
    }
    if (out_stock_message.embeds[0].fields.length > 0) {
      hook.send(out_stock_message)
    }
  }
}

(async () => {
  let request_count = 0
  //-----------------------------------------------------------
  while (true) {
    for (let i = 0; i < urls.length; i++) {
      request_count++
      let runtime = await init()
      try {
        await runtime.processURL(urls[i])
      } catch (e) {
        console.log(e)
      }
      console.log(request_count)
      await runtime.close()
    }
  }
  hook.close()
  //-----------------------------------------------------------
})()