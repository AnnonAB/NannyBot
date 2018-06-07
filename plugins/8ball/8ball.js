exports.commands = {

	magic8ball: {
		match:
			[/\/8ball (.+)/i],

		usage:
			"/8ball Your Question",

		description:
			"Magic 8 Ball!",

		callback:
			function pluginCallback(tgBotObject, msgObject)
			{
				var responseList = [
					"It is certain", "It is decidedly so", "Without a doubt", "Yes definitely",
					"You may rely on it", "As I see it, yes", "Most likely", "Outlook good",
					"Yes", "Signs point to yes", "Reply hazy try again", "Ask again later",
					"Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Don't count on it",
					"My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];

				var randomChoice = responseList[Math.floor(Math.random() * responseList.length)];

				tgBotObject.sendMessage(msgObject.chat.id, randomChoice);
			}
	}
};
