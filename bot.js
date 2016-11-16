/**** NPM Module declerations ****/

var TelegramBot = require('node-telegram-bot-api');
var swearjar = require('swearjar');
var moment = require('moment');
var fs = require('fs');
/*********************************/

var t = require('./token.json');
var config = require('./config.json');

fs.writeFile('./config.json', JSON.stringify(config), 'utf8'); //write out config once an hour

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

var commandArray = [];
var functionArray = [];
var dailyScore = [];
var scriptStarted = moment([]);

if (typeof config.scoreRecords === 'undefined') {
    config.scoreRecords = [];
}

function userScore(userID, score, lastMessage, lastDate) {
    this.userID = userID;
    this.score = score;
    this.lastMessage = lastMessage;
}

function addFunctionListener(command, functionName) // Example: addFunctionListener("/uptime", uptime);
{
    commandArray.push(command);
    functionArray.push(functionName);
    console.log("Added Function: " + functionName + " to Bot Database");
}


/***** uptime *****/



var intervalId = setInterval(timer, 1000); //Runs Every Second
var years = 0;
var weeks = 0;
var days = 0;
var hours = 0;
var minutes = 0;
var seconds = 0;

function timer() {
    seconds++;
    if (seconds > 59) { seconds = 0; minutes++; }
    if (minutes > 59) {
        minutes = 0;
        fs.writeFile('./config.json', JSON.stringify(config), 'utf8'); //write out config once an hour
        hours++;
    }
    if (hours > 23) { hours = 0; days++; dailyScore = null;}
    if (days > 6) { days = 0; weeks++; }
    if (weeks > 51) { weeks = 0; years++; }
}


bot.onText(/\/uptime/, function(msg) {

    console.log("Recieved command from: %s:%s", msg.chat.title, msg.from.username);
    var fromId = msg.chat.id;
    bot.sendMessage(fromId, "Since my Last Restart I have Been active for: \n ```" + years + " Years\n" + weeks + " Weeks\n" + days + " Days\n" + hours + " Hours\n" + minutes + " Minutes\n" + seconds + " Seconds```", {
        parse_mode: "Markdown"
    });
});

/******************/


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

bot.onText(/\/myscore/, function(msg) {
        console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);
        var fromId = msg.chat.id;
        var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";

        var scoreRecordIndex = arrayObjectIndexOf(config.scoreRecords, config.scoreRecords.userID, msg.from.id);
        var dailyScoreIndex = arrayObjectIndexOf(dailyScore, dailyScore.userID, msg.from.id);

        var messageToSend;

        if (dailyScoreIndex === -1) {
            if (scoreRecordIndex === -1) {
                messageToSend = "*Amazing!* " + msg.from.first_name + lastname +  " I have never heard you swear before. You get the biggest _hugs_ for being sooo good.";
            } else {
                messageToSend = "*_Wow!_* " + msg.from.first_name + lastname +  " you're a good and well behaved bab. I haven't caught any naughty words coming from your mouth today. ";
                messageToSend += "But I have caught you swearing in the past.\n\nYour total score is *" + config.scoreRecords[scoreRecordIndex].score + "*.\n\nKeep up the good work!";
            }
        }
        else {
            messageToSend = "*" + msg.from.first_name + lastname + "*, you're such a pottymouth!\n\nYour current score for today is *" + dailyScore[dailyScoreIndex].score;
            messageToSend += "*.\nYour total score is *" + config.scoreRecords[scoreRecordIndex].score + "*.\nI last caught you saying:\n" + dailyScore[dailyScoreIndex].lastMessage;
        }
        bot.sendMessage(fromId, messageToSend, { parse_mode: "Markdown"});
    }
);

bot.onText(/\/biggestboy/, function(msg) {
        console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);
        var fromId = msg.chat.id;
        bot.sendMessage(fromId, "_looks around_\nI dunno little one, I dont see any big kids around here.", {
            parse_mode: "Markdown"
        });
    }
);

bot.onText(/\/cutestbab/, function(msg) {
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
            var randomUserId = config.BiggestBab[Math.floor(Math.random() * config.BiggestBab.length) + 0];

            console.log("RandomUserID: %s", randomUserId);

            //bot.getChatMember(fromId, randomUserId);


            console.log("Received command from: %s:%s", msg.chat.title, msg.from.username);
            var fromId = msg.chat.id;
            bot.sendMessage(fromId, "*Matty* is the biggest bab!", {
                parse_mode: "Markdown"
            });
        }
    }
);

bot.onText(/(.+)/, function(msg, match) {
    var score = swearjar.scorecard(match[0]);
    var sum = 0;

    for (i in score) {
        if (score.hasOwnProperty(i)) {
            sum += score[i];
        }
    }

    if (sum > 0) {
        var found = false;
        var scoreRecordIndex = arrayObjectIndexOf(config.scoreRecords, config.scoreRecords.userID, msg.from.id);
        var dailyScoreIndex = arrayObjectIndexOf(dailyScore, dailyScore.userID, msg.from.id);

        if (scoreRecordIndex === -1) {
            config.scoreRecords.push(new userScore(msg.from.id, sum, match[0]));
            dailyScore.push(new userScore(msg.from.id, sum, match[0]));
            console.log("%s swore for the very first time!\ncurrent score: %s\nlast message was %s", msg.from.username, config.scoreRecords[config.scoreRecords.length - 1].score, config.scoreRecords[config.scoreRecords.length - 1].lastMessage);
        } else {
            config.scoreRecords[scoreRecordIndex].score += sum;
            if (dailyScoreIndex === -1) {
                dailyScore.push(new userScore(msg.from.id, sum, match[0]));
                console.log("%s swore for the first time today!\ncurrent score: %s\ntotal score: %s\nlast message was:\n%s", msg.from.username, dailyScore[dailyScore.length - 1].score, config.scoreRecords[scoreRecordIndex].score, dailyScore[dailyScore.length - 1].lastMessage);
            } else {
                dailyScore[dailyScoreIndex].score += sum;
                dailyScore[dailyScoreIndex].lastMessage = match[0];

                console.log("%s swore again today!\ncurrent score: %s\ntotal score: %s\nlast message was:\n%s", msg.from.username, dailyScore[dailyScoreIndex].score, config.scoreRecords[scoreRecordIndex].score, dailyScore[dailyScoreIndex].lastMessage);
            }
        }
        fs.writeFile('./config.json', JSON.stringify(config), 'utf8'); //write out config once an hour
    }
});

function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}


addFunctionListener("/testFunc", testFunc);
