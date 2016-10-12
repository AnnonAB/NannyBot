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

    if (typeof msg.reply_to_message !== "undefined") {
      console.log(msg.reply_to_message.from);

      var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";
      bot.sendMessage(fromId, "*" + msg.reply_to_message.from.first_name + lastname + "* is the cutest bab!", {parse_mode:"Markdown"});
    }
    else {
      console.log(msg.from);

      var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";
      bot.sendMessage(fromId, "*" + msg.from.first_name + lastname + "* is the cutest bab!", {parse_mode:"Markdown"}                     );
    }
  }
);
