var TelegramBot = require('node-telegram-bot-api');

var c = require('./token.json');
var bot = new TelegramBot(c.token, {polling: true});



bot.onText(/\/biggestbab/,
  function (msg) {
    var fromId = msg.chat.id;
    bot.sendMessage(fromId,"Reece is the biggest bab!");
  }
);

bot.onText(/\/cutestbab/,
  function (msg) {
    var fromId = msg.chat.id;
    bot.sendMessage(fromId,"Matty is the cutest bab!");
  }
);
