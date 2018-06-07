exports.commands = {

	sorrynannybot: {
		match:
			[/^sorry\snanny( bot|bot)/i],

		usage:
			"Say sorry to nannybot",

		description:
			"Nannybot forgives you",

		callback:
			function pluginCallback(tgBotObject, msgObject)
			{
				var messages = ["Thats ok little one, I forgive you", "Aww, thank you for apologizing.", "*pats your head* You're forgiven"];

				tgBotObject.sendMessage(msgObject.chat.id, messages[Math.floor(Math.random() * messages.length)]);
			}
	}
};
