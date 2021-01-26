# PartMan
This project aims to make it easy to run your own, customized, efficient, and simple bot to find parts for computers.

Right now the project is limited to scraping on the following websites:

* Best buy
* Newegg
* Microcenter

## Getting started

### Requirements

* [Nodejs 14+](https://nodejs.org/en/download/)
* A Chromium based browser (New Microsoft Edge or Chrome)
* A [Discord Webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

1. Clone the repository  ``` git clone https://github.com/RobViren/PartMan.git```  or download the source
2. Install nodejs dependencies ``` npm i ```
3. Copy and paste your [Discord webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) into the **discord.txt** file replacing the current one
4. Edit the **urls.json** file to customize your search
5. Run the bot with ``` npm run start```

## Customizing your search

Editing the urls.json file changes what parts the bot is looking for. It is as simple as going to the relevant site (Best Buy, NewEgg, Microcenter) and performing a search. Here is an example for a search for an rtx 3080 within a price range at newegg.

![](images\screen.png)

Copy the URL in your browser and paste that into the urls.json file. This search created this URL https://www.newegg.com/p/pl?d=rtx+3080&N=4023 .Ensure you use proper quotes and commas or the program will not work. 

## What does this do?

This applications runs an instance of the browser to search the url provided in urls.json and checks to see if an item is in stock. A counter runs on the command line and counts the number of requests being made. So that is how you can tell the program is working. When the bot finds a part it will send the result to your discord webhook.

This does not mine crypto in the background, leak personal information, or assist me in any way other than being an interesting side project. The actual source file is not that big, and the project depends on very little.

## Any Downsides?

The websites could make breaking changes at any moment. They could decide to rate limit or **block IP addresses**, so use at your own discretion. By releasing this I am opening up everyone doing this, but It may as well level the playing field. 

MIT LICENSE