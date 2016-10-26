var TelegramBot = require('node-telegram-bot-api');

var t = require('./token.json');
var config = require('./config.json');

var bot = new TelegramBot(t.token, {
    polling: true
});

var fs = require("fs");

/*function read(f) {
  return fs.readFileSync(f).toString();
}
function include(f) {
  eval.apply(global, [read(f)]);
}*/

//include('functions.js');

var years = 0;
var months = 0;
var weeks = 0;
var days = 0;
var hours = 0;
var minutes = 0;
var seconds = 0;



var commandArray = [];
var functionArray = [];

function addFunctionListener(command, functionName) // Example: addFunctionListener("/uptime", uptime);
{

    commandArray.push(command);
    functionArray.push(functionName);
    console.log("Added Function: " + functionName + " to Bot Database");

}





function timer() {

    seconds += 1;
    if (seconds > 59) {

        seconds = 0;
        minutes += 1;

    }

    if (minutes > 59) {

        minutes = 0;
        hours += 1;

    }
    if (hours > 23) {

        hours = 0;
        days += 1;

    }

    if (days > 6) {

        days = 0;
        weeks += 1;

    }

    if (weeks > 3) {

        weeks = 0;
        months += 1;

    }
    if (months > 11) {

        months = 0;
        years += 1;

    }


}

function testFunc(msg) {

    bot.sendMessage(msg.chat.id, "Success", {
        parse_mode: "Markdown"
    });

}


bot.onText(/^\*?[a-zA-Z]{2,}\*?$/, function(msg) {

    var index = commandArray.indexOf(msg.text);
    if (index >= 0) {
        //Function Exists
        functionArray[index](msg);
    }


});


bot.onText(/\/uptime/, function(msg) {
    console.log("Recieved command from: %s:%s", msg.chat.title, msg.from.username);
    var fromId = msg.chat.id;
    bot.sendMessage(fromId, "Since my Last Restart I have Been active for: \n ```" + years + " Years\n" + months + " Months\n" + weeks + " Weeks\n" + days + " Days\n" + hours + " Hours\n" + minutes + " Minutes\n" + seconds + " Seconds```", {
        parse_mode: "Markdown"
    });

});
/*
bot.onText(/\/biggestbab/,
    function(msg) {
        console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);
        var fromId = msg.chat.id;
        bot.sendMessage(fromId, "*Matty* is the biggest bab!", {
            parse_mode: "Markdown"
        });
    }
);
*/

bot.onText(/\/biggestboy/,
    function(msg) {
        console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);
        var fromId = msg.chat.id;
        bot.sendMessage(fromId, "_looks around_\nI dunno little one, I dont see any big kids around here.", {
            parse_mode: "Markdown"
        });
    }
);

bot.onText(/\/oneandonlybigboy/,
    function(msg) {
        console.log("Received command from: %s:%s", msg.chat.title, msg.from.username)
        var fromId = msg.chat.id;
        bot.sendMessage(fromId, "*Elliot* is a coding troll who thinks he is a big boy", {
            parse_mode: "Markdown"
        });
    }
);


bot.onText(/\/cutestbab/,
    function(msg) {
        console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);

        var fromId = msg.chat.id;

        if (typeof msg.reply_to_message !== "undefined") {
            console.log(msg.reply_to_message.from);

            var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";
            bot.sendMessage(fromId, "*" + msg.reply_to_message.from.first_name + lastname + "* is the cutest bab!", {
                parse_mode: "Markdown"
            });
        } else {
            console.log(msg.from);

            var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";
            bot.sendMessage(fromId, "*" + msg.from.first_name + lastname + "* is the cutest bab!", {
                parse_mode: "Markdown"
            });
        }
    }
);

bot.onText(/\/biggestbab/,
    function(msg) {
        console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);

        var fromId = msg.chat.id;

        if (typeof msg.reply_to_message !== "undefined") {
            var userID = msg.reply_to_message.from.id;
            console.log("UserID: %s", userID);

            var index = config.BiggestBab.indexOf(userID);
            console.log("index: %s", index);

            if (index >= 0) {
                var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";
                bot.sendMessage(fromId, "*" + msg.reply_to_message.from.first_name + lastname + "* is the biggest bab!", {
                    parse_mode: "Markdown"
                });
            }
            console.log(msg.reply_to_message.from);
        } else {
            console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);
            var fromId = msg.chat.id;
            bot.sendMessage(fromId, "*Matty* is the biggest bab!", {
                parse_mode: "Markdown"
            });
        }
    }
);

var intervalId = setInterval(timer, 1000); //Runs Every Second
addFunctionListener("/testFunc", testFunc);
