const https = require('https')
const fs = require('fs')
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Discord = require('discord.js');

//const hook = new Discord.WebhookClient('798026827549245451', 'Z7sIu660utEK3NiOHwU9pUj30o_j9rZT3FwfPxunS9Gsw05acN2SHtkGZwOpaFG_Zj9o');
const hook = new Discord.WebhookClient('798215273566961684', '74HAO5JM_-iemuP3V9qOm0KA7ZexM_fVL0UY-kWK-oQFF-oC-NT2Cv0T56RK8jtSaW1a'); //partwatch
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"))
const UA = "Mozilla/5.0 (Linux; Android 8.0.0; SM-G930F Build/R16NW; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36"
const part_state = []

async function checkBH(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": UA
        }
    })
    let text = await res.text()
    const dom = new JSDOM(text);
    console.log(dom.window.document.querySelector("p").textContent)
    return text.search("Add To Cart</span>")
}

async function checkMC(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": UA
        }
    })
    let text = await res.text()
    if (text.search(" in stock</span>") != -1) {
        return ({
            url: url,
            state: "IN STOCK"
        })
    } else {
        return ({
            url: url,
            state: "OUT"
        })
    }
}

async function checkNE(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": UA
        }
    })
    let text = await res.text()
    if (text.search('<strong>OUT OF STOCK.</strong>') == -1) {
        return ({
            url: url,
            state: "IN STOCK"
        })
    } else {
        return ({
            url: url,
            state: "OUT"
        })
    }
}

async function checkBB(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": UA
        }
    })
    let text = await res.text()
    if (text.search('<strong>Sold Out</strong>') == -1) {
        return ({
            url: url,
            state: "IN STOCK"
        })
    } else {
        return ({
            url: url,
            state: "OUT"
        })
    }
}

async function checkEV(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": UA
        }
    })
    let text = await res.text()
    if (text.search('</i>Out of Stock') == -1) {
        return ({
            url: url,
            state: "IN STOCK"
        })
    } else {
        return ({
            url: url,
            state: "OUT"
        })
    }
}

async function checkAS(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": UA
        }
    })
    let text = await res.text()
    if (text.search('"saleqty":0') == -1) {
        return ({
            url: url,
            state: "IN STOCK"
        })
    } else {
        return ({
            url: url,
            state: "OUT"
        })
    }
}

function checkAll() {
    (async () => {
        console.log(new Date()," Checking Again...")
        let futs = []
        let tests = []
        // config.BH.forEach(url => {
        //     futs.push(checkBH(url))
        // })
        config.MC.forEach(url => {
            futs.push(checkMC(url))
        })
        config.NE.forEach(url => {
            futs.push(checkNE(url))
        })
        config.BB.forEach(url => {
            futs.push(checkBB(url))
        })
        config.EV.forEach(url => {
            futs.push(checkEV(url))
        })
        config.AS.forEach(url => { 
            futs.push(checkAS(url))
        })  

        //Confirm I can read
        tests.push(checkNE(config.TEST[0]))
        tests.push(checkMC(config.TEST[1]))
        tests.push(checkBB(config.TEST[2]))
        tests.push(checkEV(config.TEST[3]))
        tests.push(checkEV(config.TEST[4]))

        const res = await Promise.all(futs)
        const tres = await Promise.all(tests)

        let needs_update = false
        let out_of_stock = []

        res.forEach(part => {
            let stock_change = stockUpdate(part)
            if (stock_change == "NO CHANGE") {
                //Do nothing
            } else if (stock_change == "IN STOCK") {
                //Send Message
                needs_update = true
            } else {
                //Something is out of stock
                needs_update = true
                out_of_stock.push(stock_change)
            }
        })

        if (needs_update) {
            let out_str = ""
            //In stock message
            if (part_state.length > 0) {
                out_str = "Parts someone looking for found!\n"
                part_state.forEach(part => {
                    out_str += `${part}\n`
                })
            }

            //Out of stock message
            if (out_of_stock.length > 0) {
                out_str += "\nSome items are now out of stock :( \n"
                out_of_stock.forEach(part => {
                    out_str += `${part}\n`
                })
            }
            console.log(out_str)
            hook.send(out_str)
        }

        if (tres[0].url !== config.TEST[0]) {
            console.log("New Egg Issue")
        }
        if (tres[1].url !== config.TEST[1]) {
            console.log("MicroCenter Issue")
        }
        if (tres[2].url !== config.TEST[2]) {
            console.log("BestBuy Issue")
        }
        if (tres[3].url !== config.TEST[3]) {
            console.log("EV Issue")
        }
        if (tres[4].url !== config.TEST[4]) {
            console.log("Asus Issue")
        }
    })();
}

//True if stock updated
function stockUpdate(new_part) {
    //Check to see if we need to remove a part or add one
    for (let i = 0; i < part_state.length; i++) {
        if (part_state[i] == new_part.url) {
            if (new_part.state == "OUT") {
                const index = part_state.indexOf(new_part.url);
                part_state.splice(index, 1);
                return new_part.url
            } else {
                return "NO CHANGE"
            }
        }
    }
    //Add parts that are not in the list
    if (new_part.state == "OUT") {
        return "NO CHANGE"
    } else {
        part_state.push(new_part.url)
        return "IN STOCK"
    }
}

checkAll()
setInterval(checkAll, 60000)


// checkAS("https://store.asus.com/us/item/202009AM150000004").then(res => {
//     console.log(res)
// })
//hook.destroy()