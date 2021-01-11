const https = require('https')
const fs = require('fs')
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Discord = require('discord.js');
const hook = new Discord.WebhookClient('798026827549245451', 'Z7sIu660utEK3NiOHwU9pUj30o_j9rZT3FwfPxunS9Gsw05acN2SHtkGZwOpaFG_Zj9o');

const config = JSON.parse(fs.readFileSync("config.json", "utf-8"))
const UA = "Mozilla/5.0 (Linux; Android 8.0.0; SM-G930F Build/R16NW; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36"

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
        return (url)
    } else {
        return ("OUT")
    }
}

async function checkNE(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": UA
        }
    })
    let text = await res.text()
    if (text.search('"StockMsg":"In stock') != -1) {
        return (url)
    } else {
        return ("OUT")
    }
}

function checkAll() {
    (async () => {
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

        tests.push(checkNE(config.TEST[0]))
        tests.push(checkMC(config.TEST[1]))

        const res = await Promise.all(futs)
        const tres = await Promise.all(tests)

        found_parts = []
        res.forEach(part => {
            if(part !== "OUT") {
                found_parts.push(part)
            }
        })

        if(found_parts.length !== 0) {
            hook.send("Parts someone looking for found!\n" + found_parts.toString())
        } else {
            console.log("Nothing Found")
        }

        if(tres[0] !== 'https://www.newegg.com/corsair-16gb-288-pin-ddr4-sdram/p/N82E16820233859' ){
            console.log("New Egg Error")
        }
        if(tres[1] !== 'https://www.microcenter.com/product/481738/gskill-ripjaws-v-16gb-(2-x-8gb)-ddr4-3200-pc4-25600-cl16-dual-channel-desktop-memory-kit-f4-3200c16d-16gvkb---black' ){
            console.log("Microcenter Error")
        }
    })();
}

function main() {
    setInterval(checkAll,10000)
}


main()
hook.destroy()