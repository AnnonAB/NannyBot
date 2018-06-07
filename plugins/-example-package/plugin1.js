exports.commands = {

	_some_identifier: { //change me
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
	}
};
