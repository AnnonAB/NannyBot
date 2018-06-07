exports.commands = {

	some_identifier: {
		match:
			[/\/say/i],

		usage:
			"Usage Example",

		description:
			"Description",

		callback:
			function pluginCallback(tgBotObject, msgObject)
			{
				tgBotObject.sendMessage(msgObject.chat.id, msgObject.text.substr(msgObject.text.indexOf(" ") + 1));
			}
	},	
}
