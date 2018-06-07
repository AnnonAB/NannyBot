exports.commands = {

	smolestbab: {
		match:
			[/^\/smolestbab\S*$/i],

		usage:
			"/smolestBab in reply to another user",

		description:
			"Checks whether the user is the smolest bab.",

		callback:
			function pluginCallback(tgBotObject, msgObject)
			{
        var messageToSend;
        if (typeof msgObject.reply_to_message !== "undefined") {
            var userID = msgObject.reply_to_message.from.id;
            var index = config.SmolestBab.indexOf(userID);

            if (index >= 0) {
                var lastname = typeof msgObject.reply_to_message.from.last_name !== "undefined" ? " " + msgObject.reply_to_message.from.last_name : "";

                messageToSend = "🍼🍼🍼 *" + msgObject.reply_to_message.from.first_name + lastname + "* is the smoooooolllest~~~ bab! 🍼🍼🍼";
            }
        }
        tgBotObject.sendMessage(msgObject.chat.id, messageToSend);
			}
	}
};
