const { chromium, devices } = require('playwright')
const Discord = require('discord.js')
const hook = new Discord.WebhookClient('798215273566961684', '74HAO5JM_-iemuP3V9qOm0KA7ZexM_fVL0UY-kWK-oQFF-oC-NT2Cv0T56RK8jtSaW1a') //partwatch
const fs = require('fs')
fs.writeFileSync('out.txt', "TimeStamp,URL\n")
const device_names = [
    "Nexus 5",
    "Nexus 5X",
    "Nexus 6P",
    "Nexus 7",
    "Pixel 2",
    "Pixel 2 XL",
    "iPhone 11 Pro Max",
    "iPhone 11 Pro",
    "iPhone 11",
    "iPhone XR",
    "iPhone X",
    "iPhone SE",
    "iPhone 8 Plus",
    "iPhone 8"
]

const part_state = []

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

async function bulkNEGPU(page) {
    await page.goto("https://www.newegg.com/p/pl?N=100007709%20601357247%20601359511%20601303642&PageSize=96&t=1610638291136")
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
    return (res)
}

async function bulkNECPU(page) {
    await page.goto("https://www.newegg.com/p/pl?N=100007671%20601359163%20601301117%20601301376")
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
    return (res)
}

async function bulkMCGPU(page) {
    await page.goto("https://www.microcenter.com/search/search_results.aspx?Ntk=all&sortby=match&N=4294966937+4294808774+4294808505+4294808485+4294808442&myStore=false")
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
            res.push({
                url: product.children[0].children[1].href,
                price: price,
                status: !product.innerText.includes("SOLD OUT")
            })
        })
        return (res)
    })
    return (res)
}

async function bulkMCCPU(page) {
    await page.goto("https://www.microcenter.com/search/search_results.aspx?Ntk=all&sortby=match&N=4294966995+4294819840+4294810695+4294814572+4294814254+4294808559&myStore=false")
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
            res.push({
                url: product.children[0].children[1].href,
                price: price,
                status: !product.innerText.includes("SOLD OUT")
            })
        })
        return (res)
    })
    return (res)
}

async function bulkBBGPU(page) {
    await page.goto("https://www.bestbuy.com/site/computer-cards-components/video-graphics-cards/abcat0507002.c?id=abcat0507002&qp=gpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~AMD%20Radeon%20RX%206800%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~AMD%20Radeon%20RX%206800%20XT%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~AMD%20Radeon%20RX%206900%20XT%5Egpusv_facet%3DGraphics%20Processing%20Unit%20(GPU)~NVIDIA%20GeForce%20RTX%203080")
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
            var status = true
            if (products[i].innerText.includes("Sold Out")) {
                status = false
            } else if (products[i].innerText.includes("Coming Soon")) {
                status = false
            }
            res.push({
                url: headers[i].children[0].href,
                price: price,
                status: status
            })
        }
        return (res)
    })
    return (res)
}

async function bulkBBCPU(page) {
    await page.goto("https://www.bestbuy.com/site/promo/amd-ryzen-5000")
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
            var status = true
            if (products[i].innerText.includes("Sold Out")) {
                status = false
            } else if (products[i].innerText.includes("Coming Soon")) {
                status = false
            }
            res.push({
                url: headers[i].children[0].href,
                price: price,
                status: status
            })
        }
        return (res)
    })
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
        let out_str = ""
        if(part_state.length > 0){
            out_str += "Parts People Looking for Found!\n"
        }
        part_state.forEach(part => {
            out_str += `${part.url} for $${part.price}\n`
        })

        if (out_stock.length > 0) {
            out_str += "\nTheses are now out of stock! :(\n"
            out_stock.forEach(out => {
                out_str += `${out}\n`
            })
        }
        console.log(out_str)
        hook.send(out_str)
    }
}


(async () => {
    let loop_counter = 0
    while (true) {
        loop_counter += 1
        const browser = await chromium.launch({
            headless: true
        })
        const device_name = device_names[Math.floor(Math.random() * device_names.length)]
        const context = await browser.newContext({
            ...devices[device_name],
        })
        const page = await context.newPage()

        var res = []

        try { res = res.concat(await bulkBBCPU(page)) } catch (e) { console.log(e) }
        try { res = res.concat(await bulkNEGPU(page)) } catch (e) { console.log(e) }
        try { res = res.concat(await bulkNECPU(page)) } catch (e) { console.log(e) }
        try { res = res.concat(await bulkMCGPU(page)) } catch (e) { console.log(e) }
        try { res = res.concat(await bulkMCCPU(page)) } catch (e) { console.log(e) }
        try { res = res.concat(await bulkBBGPU(page)) } catch (e) { console.log(e) }

        res.forEach(part => {
            if (part.status) {
                fs.appendFileSync('out.txt', `${new Date()},${part.url}\n`)
            }
        })

        updateParts(res)
        //Slloooowwww Down
        await page.waitForTimeout(10000)
        await page.close()
        await context.close()
        await browser.close()
        console.log(loop_counter, res.length)
    }
    hook.destroy()
})()