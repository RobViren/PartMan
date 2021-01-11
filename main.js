const https = require('https')
const fs = require('fs')
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const config = JSON.parse(fs.readFileSync("config.json", "utf-8"))

async function checkBH(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.0.0; SM-G930F Build/R16NW; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36"
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
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.0.0; SM-G930F Build/R16NW; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36"
        }
    })
    let text = await res.text()
    if(text.search(" in stock</span>") != -1) {
        return(url)
    } else {
        return("OUT")
    }
}

async function checkNE(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.0.0; SM-G930F Build/R16NW; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36"
        }
    })
    let text = await res.text()
    if (text.search('"StockMsg":"In stock') != -1) {
        return (url)
    }else {
        return("OUT")
    }
}

(async () => {
    let futs = []
    // config.BH.forEach(url => {
    //     futs.push(checkBH(url))
    // })
    config.MC.forEach(url => {
        futs.push(checkMC(url))
    })
    config.NE.forEach(url => {
        futs.push(checkNE(url))
    })
    const res = await Promise.all(futs)
    console.log(res)
})();