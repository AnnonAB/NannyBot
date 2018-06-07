exports.commands = {

	reload_packages: {
		match:
			[/\/reload-packages/i],

		usage:
			"Haha, no.",

		description:
			"Haha, hot reloads",

		callback:
			function pluginCallback(tgBotObject, msgObject)
			{
				tgBotObject.plugins.reload_packages();
				tgBotObject.sendMessage(msgObject.chat.id, "Done!");
			}
	}

}
