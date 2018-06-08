
bot.onText(/(.+)/, function message(msg, match) {
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


bot.onText(/^\/score\S*$/i, function message(msg) {
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