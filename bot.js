/**** Requires ****/
var TelegramBot = require('node-telegram-bot-api'); //npm module
var swearjar = require('swearjar'); //npm module
var moment = require('moment'); //npm module
var fs = require('fs');

var http = require("http");
var https = require("https");

var t = require('./token.json');
var config = require('./config.json');
/******************/

var bot = new TelegramBot(t.token, {
    polling: true
});

var intervalId = setInterval(timer, 1000);

var commandArray = [],
    functionArray = [],
    dailyScore = [];

var scriptStarted = moment([]);

var years = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0;


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
        writeConf(); //and it doesnt forget either.
    }


});

bot.on('new_chat_participant', function(msg) {
    if (typeof msg.new_chat_member !== "undefined") {
        var lastname = typeof msg.new_chat_member.last_name !== "undefined" ? " " + msg.new_chat_member.last_name : "";
        var messageToSend = "Welcome to the group " + msg.new_chat_member.first_name + lastname + ". Please review our /rules first, have fun :)";

        say(msg, messageToSend);
    }
});

bot.onText(/^\*?[a-zA-Z]{2,}\*?$/, function(msg) {
    var index = commandArray.indexOf(msg.text);
    if (index >= 0) {
        //Function Exists
        functionArray[index](msg);
    }
});

bot.onText(/^sorry\snanny( bot|bot)/i, function(msg) {
    var messages = ["Thats ok little one, I forgive you", "Aww, thank you for apologizing.", "*pats your head* You're forgiven"];

    say(msg, messages[Math.floor(Math.random() * messages.length) - 1]);
})

bot.onText(/^\/([a,r][d,e][d,m]bab)\s([a-z]{1,4})*$/i, function(msg, match) {
    if (typeof msg.reply_to_message !== "undefined") {
        bot.getChatAdministrators(msg.chat.id).then(function(resp) {
            var messageToSend;
            var adminIndex = -1;

            for (var i = 0; i < resp.length; i++) {
                if (resp[i].user.id === msg.from.id) adminIndex = i;
            }

            if (adminIndex > -1) { // person using this command is admin!
                var userToAdd = msg.reply_to_message.from.id;

                var bbIndex = config.BiggestBab.indexOf(userToAdd);
                var sbIndex = config.SmolestBab.indexOf(userToAdd);

                if (match[1].toLowerCase() === "addbab") {
                    messageToSend = "User is already in list.";

                    if (match[2].toLowerCase() === "big" && bbIndex === -1) {
                        config.BiggestBab.push(userToAdd);
                        messageToSend = "Added!";
                    }

                    if (match[2].toLowerCase() === "smol" && sbIndex === -1) {
                        config.SmolestBab.push(userToAdd);
                        messageToSend = "Added!";
                    }
                }

                if (match[1].toLowerCase() === "rembab") {
                    messageToSend = "User is not in list.";

                    if (match[2].toLowerCase() === "big" && bbIndex !== -1) {
                        config.BiggestBab.splice(bbIndex, 1);
                        messageToSend = "Removed!";
                    }

                    if (match[2].toLowerCase() === "smol" && sbIndex !== -1) {
                        config.SmolestBab.splice(sbIndex, 1);
                        messageToSend = "Removed!";
                    }
                }
                writeConf();
                say(msg, messageToSend);
            }
        });
    }
});

bot.onText(/^\/rules\s*((\d{1,2})(.*))*/i, function(msg, match) {
    var messageToSend = "";

    if (typeof match[2] === "undefined") {
        for (var i = 0; i < config.groupRules.length; i++) {
            messageToSend += "*" + (i + 1) + ".* " + config.groupRules[i] + "\n";
        }
        say(msg, messageToSend);
    } else {
        var ruleIndex = match[2] - 1;

        if (match[3] === "") {
            if (match[2] <= config.groupRules.length) {
                messageToSend = "*" + match[2] + ".* " + config.groupRules[ruleIndex]
            } else {
                messageToSend = "Rule *" + match[2] + "* doesn't exist."
            }
            say(msg, messageToSend);
        } else {
            bot.getChatAdministrators(msg.chat.id).then(function(resp) {
                var adminIndex = -1;

                for (var i = 0; i < resp.length; i++) {
                    if (resp[i].user.id === msg.from.id) adminIndex = i;
                }

                if (adminIndex !== -1) {
                    if (match[3].substring(1).toLowerCase() === "delete") {
                        config.groupRules.splice(ruleIndex, 1);
                        messageToSend = "Removed rule *" + match[2] + "*.";
                    } else {
                        if (match[2] <= config.groupRules.length) {
                            config.groupRules[ruleIndex] = match[3].substring(1);
                            messageToSend = "Rule *" + match[2] + "* has been updated.";
                        } else {
                            config.groupRules.push(match[3].substring(1));
                            messageToSend = "Rule *" + config.groupRules.length + "* has been added.";
                        }
                    }
                    writeConf();
                    say(msg, messageToSend);
                }
            });
        }
    }
});

bot.onText(/^\/givestar\S*$/i, function(msg) {
    if (typeof msg.reply_to_message !== "undefined") {
        if (msg.from.id !== msg.reply_to_message.from.id) {
            var messageToSend;

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
                messageToSend = "🌟 Yaay~~ " + msg.reply_to_message.from.first_name + toLastname + " Got a Gold Star! 🌟";
            } else {
                if (dailyScore[dailyScoreIndex].starsToGive > 0) {
                    dailyScore[dailyScoreIndex].starsToGive--;

                    if (scoreRecordIndex === -1) { //record of the receiver
                        config.scoreRecords.push(new userScoreObj(msg.reply_to_message.from.id, moment([]), 0, 1));
                    } else {
                        config.scoreRecords[scoreRecordIndex].starScore++;
                    }
                    messageToSend = "🌟 Yaay~~ " + msg.reply_to_message.from.first_name + toLastname + " Got a Gold Star! 🌟";
                } else {
                    messageToSend = "Sorry " + msg.from.first_name + fromLastname + ", You have given out all your stars for today.";
                }
            }
            writeConf();
            say(msg, messageToSend);
        }
    }
});

bot.onText(/^\/stars\S*$/i, function(msg) {
    var messageToSend;

    if (typeof msg.reply_to_message !== "undefined") {
        var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";
        var scoreRecordIndex = arrayObjectIndexOf(config.scoreRecords, msg.reply_to_message.from.id, "userID");

        if (scoreRecordIndex !== -1) {
            if (config.scoreRecords[scoreRecordIndex].starScore > 0) {
                messageToSend = "🌟 " + msg.reply_to_message.from.first_name + lastname + " has received " + config.scoreRecords[scoreRecordIndex].starScore + " Gold Stars! 🌟";
            } else {
                messageToSend = msg.reply_to_message.from.first_name + lastname + " has never received a gold star :(";
            }
        } else {
            config.scoreRecords.push(new userScoreObj(msg.reply_to_message.from.id, moment([]), 0, 0));
            messageToSend = msg.reply_to_message.from.first_name + lastname + " has never received a gold star :(";
            writeConf();
        }
    } else {
        var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";
        var scoreRecordIndex = arrayObjectIndexOf(config.scoreRecords, msg.from.id, "userID");

        if (scoreRecordIndex !== -1) {
            if (config.scoreRecords[scoreRecordIndex].starScore > 0) {
                messageToSend = "🌟 " + msg.from.first_name + lastname + ", you have received " + config.scoreRecords[scoreRecordIndex].starScore + " Gold Stars! 🌟";
            } else {
                messageToSend = "Sorry, " + msg.from.first_name + lastname + " you have never received a gold star :(";
            }
        } else {
            config.scoreRecords.push(new userScoreObj(msg.from.id, moment([]), 0, 0));
            messageToSend = "Sorry, " + msg.from.first_name + lastname + " you have never received a gold star :(";
            writeConf();
        }
    }
    say(msg, messageToSend);
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
            if (dailyScore[dailyScoreIndex].pmScore !== 0) {
                messageToSend = "*" + msg.reply_to_message.from.first_name + lastname + "* has been very naughty and used bad language today. Their daily score is *" + dailyScore[dailyScoreIndex].pmScore + "*";
            } else {
                messageToSend = "*" + msg.reply_to_message.from.first_name + lastname + "* has been good. They have not used any naughty language today.";
            }
        }

    } else {
        var scoreRecordIndex = arrayObjectIndexOf(config.scoreRecords, msg.from.id, "userID");
        var dailyScoreIndex = arrayObjectIndexOf(dailyScore, msg.from.id, "userID");
        var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";

        if (dailyScoreIndex === -1) {
            if (scoreRecordIndex === -1) {
                messageToSend = "*Amazing!* " + msg.from.first_name + lastname + " I have never heard you swear before. You get the biggest _hugs_ for being sooo good.";
            } else {
                if (config.scoreRecords[scoreRecordIndex].pmScore > 0) {
                    messageToSend = "*_Wow!_* " + msg.from.first_name + lastname + " you're a good and well behaved bab. I haven't caught any naughty words coming from your mouth today. ";
                    messageToSend += "But I have caught you swearing in the past.\n\nYour total score is *" + config.scoreRecords[scoreRecordIndex].pmScore + "*.\n\nKeep up the good work!";
                } else {
                    messageToSend = "*Amazing!* " + msg.from.first_name + lastname + " I have never heard you swear before. You get the biggest _hugs_ for being sooo good.";
                }
            }
        } else {
            if (dailyScore[dailyScoreIndex].pmScore > 0) {
                messageToSend = "*" + msg.from.first_name + lastname + "*, you're such a pottymouth!\n\nYour current score for today is *" + dailyScore[dailyScoreIndex].pmScore;
                messageToSend += "*.\nYour total score is *" + config.scoreRecords[scoreRecordIndex].pmScore + "*.\n\nI last caught you saying:\n" + dailyScore[dailyScoreIndex].lastMessage + "\n";
            } else {
                if (config.scoreRecords[scoreRecordIndex].pmScore > 0) {
                    messageToSend = "*_Wow!_* " + msg.from.first_name + lastname + " you're a good and well behaved bab. I haven't caught any naughty words coming from your mouth today. ";
                    messageToSend += "But I have caught you swearing in the past.\n\nYour total score is *" + config.scoreRecords[scoreRecordIndex].pmScore + "*.\n\nKeep up the good work!";
                } else {
                    messageToSend = "*Amazing!* " + msg.from.first_name + lastname + " I have never heard you swear before. You get the biggest _hugs_ for being sooo good.";
                }
            }
        }
    }
    say(msg, messageToSend);
});

bot.onText(/^\/biggestkid\S*$/i, function(msg) {
    say(msg, "_looks around_\nI dunno little one, I dont see any big kids around here.");
});

bot.onText(/^\/cutestbab\S*$/i, function(msg) {
    var messageToSend;
    if (typeof msg.reply_to_message !== "undefined") {
        var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";

        messageToSend = "*" + msg.reply_to_message.from.first_name + lastname + "* is the cutest bab!";
    } else {
        var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";

        messageToSend = "*" + msg.from.first_name + lastname + "* is the cutest bab!";
    }
    say(msg, messageToSend);
});

bot.onText(/^\/biggestbab\S*$/i, function(msg) {
    var messageToSend;

    if (typeof msg.reply_to_message !== "undefined") {
        var userID = msg.reply_to_message.from.id;
        var index = config.BiggestBab.indexOf(userID);

        if (index >= 0) {
            var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";
            messageToSend = "*" + msg.reply_to_message.from.first_name + lastname + "* is the biggest bab!";
        }
    } else {
        var randomUserId = config.BiggestBab[Math.floor(Math.random() * config.BiggestBab.length) - 1];

        console.log("RandomUserID: %s", randomUserId);

        bot.getChatMember(msg.chat.id, randomUserId).then(
            function(resp) {
                var lastname = typeof resp.user.last_name !== "undefined" ? " " + resp.user.last_name : "";

                messageToSend = "*" + resp.user.first_name + lastname + "* is the biggest bab!";
                say(msg, messageToSend);
            },
            function(resp) {
                messageToSend = "I don't know who the biggest bab is, you're all such big babs!";
                say(msg, messageToSend);
            }
        );
        //messageToSend = "I cant decide who the biggest bab is, you all deserve that crown.";
    }
    say(msg, messageToSend);
});

bot.onText(/^\/smolestbab\S*$/i, function(msg) {
    var messageToSend;
    if (typeof msg.reply_to_message !== "undefined") {
        var userID = msg.reply_to_message.from.id;
        var index = config.SmolestBab.indexOf(userID);

        if (index >= 0) {
            var lastname = typeof msg.reply_to_message.from.last_name !== "undefined" ? " " + msg.reply_to_message.from.last_name : "";

            messageToSend = "🍼🍼🍼 *" + msg.reply_to_message.from.first_name + lastname + "* is the smoooooolllest~~~ bab! 🍼🍼🍼";
        }
    }
    say(msg, messageToSend);
});



// Google command
//  Searches google and returns the first three links found
//  Command usage: /google {search query}
bot.onText(/\/google (.+)/i,
	function(msgObject)
	{
		// Parse Google's HTML
		function callback(body)
		{
			var strpos = 0, response = "";

			// Prepare up to three links
			//  I'd use regex, but cba with drama
			for(var i = 1; i < 4; i++)
			{
				var subStart = body.indexOf('<h3 class="r"><a href="', strpos);

				if(subStart === -1)
					break;

				subStart += 23;
				strpos = body.indexOf('"', subStart);

				if(strpos === -1)
					break;

				response += i.toString() + ": " + body.substr(subStart, strpos - subStart) + "\r\n";
			}

			// Send googled links
			if(response)
			{
				bot.sendMessage(msgObject.chat.id, response);
			}
		}

		// Setup Async HTTP Request
		var body = "";

		var settings = {
			hostname: "www.google.com.au",
			port: 443,
			path: "/search?hl=en&output=search&q=" + encodeURIComponent(msgObject.text.substr(9)),
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36"
			}
		};

		// Async handler
		var httpObject = https.request(settings,
			function(res)
			{
				res.on("data", (chunk) => { body += chunk; });
				res.on("end", () => { callback(body); });
			}
		);

		// Initiate async request
		httpObject.end();
	}
);


// 8Ball Command
bot.onText(/\/8ball (.+)/i,
	function(msgObject)
	{
		var responseList = [
			"It is certain", "It is decidedly so", "Without a doubt", "Yes definitely",
			"You may rely on it", "As I see it, yes", "Most likely", "Outlook good",
			"Yes", "Signs point to yes", "Reply hazy try again", "Ask again later",
			"Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Don't count on it",
			"My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];

		var randomChoice = responseList[Math.floor(Math.random() * responseList.length)];

		say(msgObject, randomChoice);
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
        function(x) {
            return primer(x[field])
        } :
        function(x) {
            return x[field]
        };

    reverse = !reverse ? 1 : -1;

    return function(a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}

//wrapper for sendMessage
function say(msgObj, message) {
    if (typeof message !== "undefined") {

        var replyID = typeof msgObj.reply_to_message !== "undefined" ? " for UID " + msgObj.reply_to_message.from.id : "";
        console.log("Received command in group %s from %s (UID: %s)%s", msgObj.chat.title, msgObj.from.username, msgObj.from.id, replyID);
        bot.sendMessage(msgObj.chat.id, message, {
            parse_mode: "Markdown"
        });
    }
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

function writeConf() {
    fs.writeFile('./config.json', JSON.stringify(config, null, '\t'), 'utf8');
}


function timer() {
    seconds++;
    if (seconds > 59) {
        seconds = 0;
        minutes++;
    }
    if (minutes > 59) {
        minutes = 0;
        writeConf(); //write out config once an hour
        hours++;
    }
    if (hours > 23) {
        hours = 0;
        days++;
        dailyScore = []; //resets the daily score array.
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
