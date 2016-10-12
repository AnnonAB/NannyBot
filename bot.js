var TelegramBot = require('node-telegram-bot-api');

var t = require('./token.json');
var bot = new TelegramBot(t.token, {polling: true});

var config = require('./config.json');



bot.onText(/\/biggestbab/,
  function (msg) {
    console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);
    var fromId = msg.chat.id;
    bot.sendMessage(fromId, "*Matty* is the biggest bab!", {parse_mode:"Markdown"});
  }
);

bot.onText(/\/biggestboy/,
  function (msg) {
    console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);
    var fromId = msg.chat.id;
    bot.sendMessage(fromId, "_looks around_ I dunno little one, I dont see any big kids around here.", {parse_mode:"Markdown"});
  }
);

bot.onText(/\/cutestbab/,
  function (msg) {
    console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);
    var fromId = msg.chat.id;
    bot.sendMessage(fromId, "*" + msg.from.first_name + " " + msg.from.last_name + "* is the cutest bab!", {parse_mode:"Markdown"});
  }
);
