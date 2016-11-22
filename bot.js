/**** Requires ****/
var TelegramBot = require('node-telegram-bot-api'); //npm module
var swearjar = require('swearjar'); //npm module
var moment = require('moment'); //npm module
var fs = require('fs');
var t = require('./token.json');
var config = require('./config.json');
/******************/

var bot = new TelegramBot(t.token, {polling: true});
var intervalId = setInterval(timer, 1000);

var commandArray = [];
var functionArray = [];
var dailyScore = [];
var scriptStarted = moment([]);

var years = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0;


if (typeof config.scoreRecords === 'undefined') {
    config.scoreRecords = [];
}

function testFunc(msg) {
    bot.sendMessage(msg.chat.id, "Success", {
        parse_mode: "Markdown"
    });
}

// the bot hears all!
bot.onText(/(.+)/, function(msg, match) {
    var score = swearjar.scorecard(match[0]);
    var sum = 0;

    for (i in score) {
        if (score.hasOwnProperty(i)) {
            sum += score[i];
        }
    }

    if (sum > 0) {
        var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";
        var scoreRecordIndex = arrayObjectIndexOf(config.scoreRecords, msg.from.id, "userID");
        var dailyScoreIndex = arrayObjectIndexOf(dailyScore, msg.from.id, "userID");

        if (scoreRecordIndex === -1) {
            config.scoreRecords.push(new userScoreObj(msg.from.id, moment([]), sum, 0));
            dailyScore.push(new dailyScoreObj(msg.from.id, msg.from.first_name, lastname, sum, 0, match[0], 3));
        } else {
            config.scoreRecords[scoreRecordIndex].pmScore += sum;
            config.scoreRecords[scoreRecordIndex].lastDate = moment([]);
            if (dailyScoreIndex === -1) {
                dailyScore.push(new dailyScoreObj(msg.from.id, msg.from.first_name, lastname, sum, 0, match[0], 3));
            } else {
                dailyScore[dailyScoreIndex].pmScore += sum;
                dailyScore[dailyScoreIndex].lastMessage = match[0];
            }
        }
        fs.writeFile('./config.json', JSON.stringify(config), 'utf8'); //and it doesnt forget either.
    }
});

bot.onText(/^\*?[a-zA-Z]{2,}\*?$/, function(msg) {
    var index = commandArray.indexOf(msg.text);
    if (index >= 0) {
        //Function Exists
        functionArray[index](msg);
    }
});

bot.onText(/^\/givestar\S*$/i, function(msg) {
    if (typeof msg.reply_to_message !== "undefined") {
        var fromLastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";
        var toLastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";

        var dailyScoreIndex = arrayObjectIndexOf(dailyScore, msg.from.id, "userID");
        var scoreRecordIndex = arrayObjectIndexOf(config.scoreRecords, msg.reply_to_message.from.id, "userID");

        if (dailyScoreIndex === -1) { //dailyrecord of the sender
            dailyScore.push(new dailyScoreObj(msg.from.id, msg.from.first_name, fromLastname, 0, 0, "", 2));

            if (scoreRecordIndex === -1) { //record of the receiver
                config.scoreRecords.push(new userScoreObj(msg.reply_to_message.from.id, moment([]), 0, 1));
            } else {
                config.scoreRecords[scoreRecordIndex].starScore++;
            }

            say(msg, "🌟 Yaay~~ " + msg.reply_to_message.from.first_name + toLastname + " Got a Gold Star! 🌟");
        } else {
            if (dailyScore[dailyScoreIndex].starsToGive > 0) {
                dailyScore[dailyScoreIndex].starsToGive--;

                if (scoreRecordIndex === -1) { //record of the receiver
                    config.scoreRecords.push(new userScoreObj(msg.reply_to_message.from.id, moment([]), 0, 1));
                } else {
                    config.scoreRecords[scoreRecordIndex].starScore++;
                }
                say(msg, "🌟 Yaay~~ " + msg.reply_to_message.from.first_name + toLastname + " Got a Gold Star! 🌟");
            } else {
                say(msg, "Sorry " + msg.from.first_name + fromLastname + ", You have given out all your stars for today.");
            }
        }
        fs.writeFile('./config.json', JSON.stringify(config), 'utf8');
    }
});

bot.onText(/^\/stars\S*$/i, function(msg) {
    if (typeof msg.reply_to_message !== "undefined") {
        var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";
        var scoreRecordIndex = arrayObjectIndexOf(config.scoreRecords, msg.reply_to_message.from.id, "userID");

        if (scoreRecordIndex !== -1) {
            if (config.scoreRecords[scoreRecordIndex].starScore > 0) {
                say(msg, "🌟 " + msg.reply_to_message.from.first_name + lastname + " has received " + config.scoreRecords[scoreRecordIndex].starScore + " Gold Stars! 🌟");
            } else {
                say(msg, msg.reply_to_message.from.first_name + lastname + " has never received a gold star :(");
            }
        } else {
            config.scoreRecords.push(new userScoreObj(msg.reply_to_message.from.id, moment([]), 0, 0));
            say(msg, msg.reply_to_message.from.first_name + lastname + " has never received a gold star :(");
            fs.writeFile('./config.json', JSON.stringify(config), 'utf8');
        }
    }
});


bot.onText(/^\/uptime\S*$/i, function(msg) {
    say(msg, "Since my Last Restart I have Been active for:```\n\n" + years + " Years\n" + weeks + " Weeks\n" + days + " Days\n" + hours + " Hours\n" + minutes + " Minutes\n" + seconds + " Seconds```");
});

bot.onText(/^\/score\S*$/i, function(msg) {
    var messageToSend;

    if (typeof msg.reply_to_message !== "undefined") {
        var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";

        var dailyScoreIndex = arrayObjectIndexOf(dailyScore, msg.reply_to_message.from.id, "userID");

        if (dailyScoreIndex === -1) {
            messageToSend = "*" + msg.reply_to_message.from.first_name + lastname + "* has been good. They have not used any naughty language today.";
        } else {
            messageToSend = "*" + msg.reply_to_message.from.first_name + lastname + "* has been very naughty and used bad language today. Their daily score is *" + dailyScore[dailyScoreIndex].pmScore + "*";
        }

    } else {
        var scoreRecordIndex = arrayObjectIndexOf(config.scoreRecords, msg.from.id, "userID");
        var dailyScoreIndex = arrayObjectIndexOf(dailyScore, msg.from.id, "userID");
        var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";

        if (dailyScoreIndex === -1) {
            if (scoreRecordIndex === -1) {
                messageToSend = "*Amazing!* " + msg.from.first_name + lastname + " I have never heard you swear before. You get the biggest _hugs_ for being sooo good.";
            } else {
                messageToSend = "*_Wow!_* " + msg.from.first_name + lastname + " you're a good and well behaved bab. I haven't caught any naughty words coming from your mouth today. ";
                messageToSend += "But I have caught you swearing in the past.\n\nYour total score is *" + config.scoreRecords[scoreRecordIndex].pmScore + "*.\n\nKeep up the good work!";
            }
        } else {
            messageToSend = "*" + msg.from.first_name + lastname + "*, you're such a pottymouth!\n\nYour current score for today is *" + dailyScore[dailyScoreIndex].pmScore;
            messageToSend += "*.\nYour total score is *" + config.scoreRecords[scoreRecordIndex].pmScore + "*.\n\nI last caught you saying:\n" + dailyScore[dailyScoreIndex].lastMessage + "\n";
        }
    }
    say(msg, messageToSend);
});

bot.onText(/^\/biggestkid\S*$/i, function(msg) {
    say(msg, "_looks around_\nI dunno little one, I dont see any big kids around here.");
});

bot.onText(/^\/cutestbab\S*$/i, function(msg) {
    if (typeof msg.reply_to_message !== "undefined") {
        console.log(msg.reply_to_message.from);

        var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";
        say(msg, "*" + msg.reply_to_message.from.first_name + lastname + "* is the cutest bab!");
    } else {
        console.log(msg.from);

        var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";
        say(msg, "*" + msg.from.first_name + lastname + "* is the cutest bab!");
    }
});

bot.onText(/^\/biggestbab\S*$/i, function(msg) {
        if (typeof msg.reply_to_message !== "undefined") {
            var userID = msg.reply_to_message.from.id;
            console.log("UserID: %s", userID);

            var index = config.BiggestBab.indexOf(userID);
            console.log("index: %s", index);

            if (index >= 0) {
                var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";
                say(msg, "*" + msg.reply_to_message.from.first_name + lastname + "* is the biggest bab!");
            }
            console.log(msg.reply_to_message.from);
        } else {
            var randomUserId = config.BiggestBab[Math.floor(Math.random() * config.BiggestBab.length) + 0];
            console.log("RandomUserID: %s", randomUserId);
            say(msg, "*Matty* is the biggest bab!");
        }
    }
);


/************ Various Funcitons *************/

// returns the index of an object in an array by a search of one of the objects properties.
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for (var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

// sorts an array of objects by a specific property.
var sort_by = function(field, reverse, primer) {
   var key = primer ?
       function(x) {return primer(x[field])} :
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     }
}

//wrapper for sendMessage
function say(msgObj, message) {
    console.log("Received command from: %s:%s", msgObj.chat.title, msgObj.from.username);
    bot.sendMessage(msgObj.chat.id, message, {parse_mode: "Markdown"});
}

//prototype for userScore object
function userScoreObj(userID, lastDate, pmScore, starScore) {
    this.userID = userID;
    this.lastDate = lastDate;
    this.pmScore = pmScore;
    this.starScore = starScore;
}

function dailyScoreObj(userID, firstName, lastName, pmScore, starScore, lastMessage, starsToGive) {
    this.userID = userID;
    this.firstname = firstName;
    this.lastName = lastName;
    this.pmScore = pmScore;
    this.starScore = starScore;
    this.lastMessage = lastMessage;
    this.starsToGive = starsToGive;
}

function addFunctionListener(command, functionName) // Example: addFunctionListener("/uptime", uptime);
{
    commandArray.push(command);
    functionArray.push(functionName);
    console.log("Added Function: " + functionName + " to Bot Database");
}

function timer() {
    seconds++;
    if (seconds > 59) {
        seconds = 0;
        minutes++;
    }
    if (minutes > 59) {
        minutes = 0;
        fs.writeFile('./config.json', JSON.stringify(config), 'utf8'); //write out config once an hour
        hours++;
    }
    if (hours > 23) {
        hours = 0;
        days++;
        dailyScore = null; //resets the daily score array.
    }
    if (days > 6) {
        days = 0;
        weeks++;
    }
    if (weeks > 51) {
        weeks = 0;
        years++;
    }
}


addFunctionListener("/testFunc", testFunc);
