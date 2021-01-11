const Discord = require('discord.js');
const hook = new Discord.WebhookClient('798026827549245451', 'Z7sIu660utEK3NiOHwU9pUj30o_j9rZT3FwfPxunS9Gsw05acN2SHtkGZwOpaFG_Zj9o');

const thing = "https://discord.com/api/webhooks/798026827549245451/Z7sIu660utEK3NiOHwU9pUj30o_j9rZT3FwfPxunS9Gsw05acN2SHtkGZwOpaFG_Zj9o"
// const client = new Discord.Client();

// client.on('ready', () => {
//   console.log(`Logged in as ${client.user.tag}!`);
// });

// client.on('message', msg => {
//   if (msg.content === 'ping') {
//     msg.reply('Pong!');
//   }
// });

// client.login('Nzk4MDIxNzE3NDU2NDUzNjc0.X_u9ow.ZABHrV4uy4xC8ZRkMHaD9af5t0w');
hook.send("Hello There")
hook.destroy()