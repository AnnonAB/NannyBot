exports.commands = {
	
	some_identifier: {
		match:
			[/\/say/i],
		
		usage:
			"Usage Example",
			
		description:
			"Description",
			
		callback:
			function(tgBotObject, msgObject)
			{
				tgBotObject.sendMessage(msgObject.chat.id, msgObject.text.substr(msgObject.text.indexOf(" ") + 1));
			}
	},
	
	
	reload_packages: {
		match:
			[/\/reload-packages/i],
		
		usage:
			"Usage Example",
			
		description:
			"Description",
			
		callback:
			function(tgBotObject, msgObject)
			{
				tgBotObject.plugins.reload_packages();
				tgBotObject.sendMessage(msgObject.chat.id, "Done!");
			}
	}
	
}