const { webkit, devices } = require('playwright');
const Discord = require('discord.js');
const fs = require('fs');
const { PassThrough } = require('stream');

const hook = new Discord.WebhookClient('798215273566961684', '74HAO5JM_-iemuP3V9qOm0KA7ZexM_fVL0UY-kWK-oQFF-oC-NT2Cv0T56RK8jtSaW1a'); //partwatch
const price_regex = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/
const urls = JSON.parse(fs.readFileSync("urls.json", "utf-8"))
const part_state = []

async function checkNE(url, page) {
    await page.goto(url);
    await page.waitForSelector('.dialog-open')
    await page.waitForSelector('.price-current')
    const res = await page.evaluate(() => {
        return {
            status: document.querySelector('.dialog-open').innerText,
            price: document.querySelector('.price-current').innerText
        }
    });

    //KeyCheck
    if (res.status == "OUT OF STOCK.") {
        res.status = false
    } else {
        res.status = true
    }
    res.price = parseFloat(price_regex.exec(res.price)[0].replace(',', ""))
    return (res)
}

async function checkMC(url, page) {
    await page.goto(url);
    await page.waitForSelector('.inventoryCnt')
    await page.waitForSelector('#pricing')
    const res = await page.evaluate(() => {
        return {
            status: document.querySelector('.inventoryCnt').innerText,
            price: document.querySelector('#pricing').innerText
        }
    });

    //KeyCheck
    if (res.status == "SOLD OUT") {
        res.status = false
    } else {
        res.status = true
    }
    res.price = parseFloat(price_regex.exec(res.price)[0].replace(',', ""))
    return (res)
}

async function checkBB(url, page) {
    await page.goto(url);
    await page.waitForSelector('.fulfillment-add-to-cart-button')
    await page.waitForSelector('.priceView-hero-price')
    const res = await page.evaluate(() => {
        return {
            status: document.querySelector('.fulfillment-add-to-cart-button').innerText,
            price: document.querySelector('.priceView-hero-price').innerText
        }
    });


    //KeyCheck
    if (res.status.includes("Sold Out")) {
        res.status = false
    } else {
        res.status = true
    }
    res.price = parseFloat(price_regex.exec(res.price)[0].replace(',', ""))
    return (res)
}

async function checkEV(url, page) {
    await page.goto(url);
    await page.waitForSelector(".product-top")

    const res = await page.evaluate(() => {

        if (document.querySelector('#LFrame_pnlOutOfStock')) {
            return {
                status: false,
                price: document.querySelector("#LFrame_spanFinalPrice").innerText
            }
        } else {
            return {
                status: true,
                price: document.querySelector("#LFrame_spanFinalPrice").innerText
            }
        }
    });

    res.price = parseFloat(price_regex.exec(res.price)[0].replace(',', ""))
    return (res)
}

async function checkAS(url, page) {
    await page.goto(url);
    const res = await page.evaluate(() => {
        return {
            status: document.querySelector('#off_sale').innerText,
            price: document.querySelector('.price').innerText
        }
    });

    //KeyCheck
    if (res.status.includes("Sold Out")) {
        res.status = false
    } else {
        res.status = true
    }
    res.price = parseFloat(price_regex.exec(res.price)[0].replace(',', ""))
    return (res)
}

async function checkBH(url, page) {
    await page.goto(url);
    await page.waitForSelector('.user-interaction')

    const res = await page.evaluate(() => {
        return {
            status: document.querySelector('.user-interaction').innerText,
            price: document.querySelector('.price-container').textContent
        }
    });

    //KeyCheck
    if (res.status.includes("Notify When In Stock")) {
        res.status = false
    } else {
        res.status = true
    }
    res.price = parseFloat(price_regex.exec(res.price)[0].replace(',', ""))
    return (res)
}

function updateParts(new_part) {
    //Remove if it is in the list but 
    var part_change = { change: false }
    for (let i = 0; i < part_state.length; i++) {
        if (part_state[i].url == new_part.url) {
            if (!new_part.status) {
                part_state.splice(i, 1)
                triggerUpdate(new_part.url)
            }
        }
    }

    if (new_part.status) {
        part_state.push(new_part)
        triggerUpdate()
    }
}

function triggerUpdate(url) {
    if (url) {
        hook.send(`${url} is now out of stock :(`)
    } else {
        let out_str = ""
        out_str = "Parts someone looking for found!\n"
        part_state.forEach(part => {
            out_str += `${part.url} for **$${part.price}**\n`
        })
        hook.send(out_str)
    }
}

(async () => {
    const browser = await webkit.launch({
        headless: true
    });
    const context = await browser.newContext({
        ...devices['iPhone 11'],
    });

    // Open new page
    const page = await context.newPage();
    while (true) {
        var url = urls[Math.floor(Math.random() * urls.length)];
        var res

        try {
            if (url.includes("www.bhphotovideo.com")) {
                res = await checkBH(url, page)
            } else if (url.includes("www.microcenter.com")) {
                res = await checkMC(url, page)
            } else if (url.includes("www.newegg.com")) {
                res = await checkNE(url, page)
            } else if (url.includes("www.bestbuy.com")) {
                res = await checkBB(url, page)
            } else if (url.includes("www.evga.com")) {
                res = await checkEV(url, page)
            } else if (url.includes("store.asus.com")) {
                res = await checkAS(url, page)
            }
            console.log(res)
            res.url = url
            updateParts(new Date(),res)
            //Slloooowwww Down
        } catch (e) {
            console.log(`Error with ${url}: ${e}`)
        }
        page.waitForTimeout(10000)
    }
    await page.close();
    await context.close();
    await browser.close();
    hook.destroy()
})();