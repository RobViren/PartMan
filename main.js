const https = require('https')
const fs = require('fs')
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Discord = require('discord.js');

//const hook = new Discord.WebhookClient('798026827549245451', 'Z7sIu660utEK3NiOHwU9pUj30o_j9rZT3FwfPxunS9Gsw05acN2SHtkGZwOpaFG_Zj9o');
const hook = new Discord.WebhookClient('798045727371821066', 'ozQCKS8wQaIgsyp3NfFndTIcjKnVHzq7xx4pNsSAjra5t7RQ1mXek4UKrZdOQwdGKblW');

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
    if (text.search('<strong>OUT OF STOCK.</strong>') == -1) {
        return (url)
    } else {
        return ("OUT")
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
        return (url)
    } else {
        return ("OUT")
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
        return (url)
    } else {
        return ("OUT")
    }
}

async function checkAS(url) {
    let res = await fetch(url, {
        headers: {
            "User-Agent": UA
        }
    })
    let text = await res.text()
    if (text.search('</i>Out of Stock') == -1) {
        return (url)
    } else {
        return ("OUT")
    }
}
function checkAll() {
    (async () => {
        console.log("Checking Again...")
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

        tests.push(checkNE(config.TEST[0]))
        tests.push(checkMC(config.TEST[1]))
        tests.push(checkBB(config.TEST[2]))
        tests.push(checkEV(config.TEST[3]))

        const res = await Promise.all(futs)
        const tres = await Promise.all(tests)

        found_parts = []
        res.forEach(part => {
            if (part !== "OUT") {
                found_parts.push(part)
            }
        })

        if (found_parts.length !== 0) {
            console.log("Parts someone looking for found!\n" + found_parts.toString())
            hook.send("Parts someone looking for found!\n" + found_parts.toString())
        } else {
            console.log("Nothing Found")
        }

        if(tres[0] !== config.TEST[0]) {
            console.log("New Egg Issue")
        }
        if(tres[1] !== config.TEST[1]) {
            console.log("MicroCenter Issue")
        }
        if(tres[2] !== config.TEST[2]) {
            console.log("BestBuy Issue")
        }
        if(tres[3] !== config.TEST[3]) {
            console.log("EV Issue")
        }
    })();
}

setInterval(checkAll,60000)
//hook.destroy()