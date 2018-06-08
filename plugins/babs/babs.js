exports.commands = {
	smolestBab: {
		match:
			[/^\/smolestbab/i],
		usage:
			"/smolestBab in reply to another user",
		description:
			"Checks whether the user is the smolest bab.",
		callback:
			function pluginCallback(bot, msg, cfg)
			{
				var msgToSend;
				if (typeof msg.reply_to_msg !== "undefined") {
					var userID = msg.reply_to_msg.from.id;
					var smol = cfg.Groups[msg.chat.id].Users[userID].Babs.Smolest;

					if (smol) {
						var lastname = typeof msg.reply_to_msg.from.last_name !== "undefined" ? " " + msg.reply_to_msg.from.last_name : "";

						msgToSend = "🍼🍼🍼 *" + msg.reply_to_msg.from.first_name + lastname + "* is the smoooooolllest~~~ bab! 🍼🍼🍼";
					}
				}
				bot.sendmsg(msg.chat.id, msgToSend);
			}
	},

	cutestBab: {
		match:
			[/^\/cutestbab/i],
		usage:
			"/cutestbab by itself or in reply to another user",
		description:
			"Who's the cutest bab... You are :333",
		context: //all, group, pm
			"all",
		permissions: //all, normal, restricted, admin, none
			"all",
		callback:
			function pluginCallback(bot, msg)
			{
				var msgToSend;
				if (typeof msg.reply_to_msg !== "undefined") {
					var lastname = typeof msg.reply_to_msg.from.last_name !== "undefined" ? " " + msg.reply_to_msg.from.last_name : "";
			
					msgToSend = "*" + msg.reply_to_msg.from.first_name + lastname + "* is the cutest bab! Everyone run over and give " + msg.reply_to_msg.from.first_name + lastname + " your biggest tightest group hug!";
				} else {
					var lastname = typeof msg.from.last_name !== "undefined" ? " " + msg.from.last_name : "";
			
					msgToSend = "* Aww, " + msg.from.first_name + lastname + "*. Of course you're a cutie, you're the cutest and cuddliest bab speaking to me right now!";
				}
				bot.sendmsg(msg.chat.id, msgToSend);
			}
	},

	biggestBab: {
		match:
			[/^\/biggestbab/i],
		usage:
			"/biggestbab by itself or in reply to another user",
		description:
			"Nannybot watches all the little ones, of course she know who the biggest bab is",
		context:
			"all",
		permissions:
			"all",
		callback:
			function pluginCallback(bot, msg, cfg) {
				if (typeof msg.reply_to_msg !== "undefined") { // is a reply
					var userID = msg.reply_to_msg.from.id;
					var isabab = cfg.Groups[msg.chat.id].Users[userID].Babs.Biggest;
			
					if (isabab) {
						var lastname = typeof msg.reply_to_msg.from.last_name !== "undefined" ? " " + msg.reply_to_msg.from.last_name : "";
						msgToSend = "*" + msg.reply_to_msg.from.first_name + lastname + "* is the biggest bab!";
						bot.sendmsg(msg.chat.id, msgToSend);
					}
				} else {
					while (randomUser.Babs.Biggest != true) {
						userList = Object.keys(cfg.Groups[msg.chat.id].Users);
						randomUserID = userList[Math.floor(Math.random() * userList.length)];
					}
					console.log("RandomUserID: %s", randomUserID);
			
					bot.getChatMember(msg.chat.id, randomUserID).then(
						function reply(resp) {
							var lastname = typeof resp.user.last_name !== "undefined" ? " " + resp.user.last_name : "";
			
							msgToSend = "*" + resp.user.first_name + lastname + "* is the biggest bab!";
							bot.sendmsg(msg.chat.id, msgToSend);
						},
						function reply(resp) {
							msgToSend = "I don't know who the biggest bab is, you're all such big babs!";
							bot.sendmsg(msg.chat.id, msgToSend);
						}
					);
				}
			}
	},

	adminBabs: {
		match:
			[/^\/([a,r][d,e][d,m]bab)\s([a-z]{1,4})*$/i],
		usage:
			"/addbab (big|smol) | /rembab (big|smol)",
		description:
			"Adds and removes babs from /the list/",
		context:
			"all",
		permissions:
			"admin",
		callback:
			function pluginCallback(bot, msg, cfg) {
				if (typeof msg.reply_to_msg !== "undefined") {
					bot.getChatAdministrators(msg.chat.id).then(function reply(resp) {
						var msgToSend = "Something went wrong with my memory banks, Unable to process command";
						var adminIndex = -1;
			
						for (var i = 0; i < resp.length; i++) {
							if (resp[i].user.id === msg.from.id) adminIndex = i;
						}
			
						if (adminIndex > -1) { // person using this command is admin!
							var userToAdd = msg.reply_to_msg.from.id;
							var key;
							var babBool;
							
							babBool = match[1].toLowerCase() === "addbab" ? true : match[1].toLowerCase() === "rembab" ? false : undefined;
							
							if (typeof babBool !== "undefined") {
								if (match[2].toLowerCase() === "big") key = "Biggest";
								if (match[2].toLowerCase() === "smol") key = "Smolest";
				
								if (cfg.Groups[msg.chat.id].Users[userToAdd].Babs[key] !== babBool) {
									cfg.Groups[msg.chat.id].Users[userToAdd].Babs[key] = babBool;

									msgToSend = babBool ? "Added!" : "Removed!";
								}
								else {
									var lastname = typeof resp.user.last_name !== "undefined" ? " " + resp.user.last_name : "";

									msgToSend = babBool ? resp.user.first_name + lastname + " is already one of the " + key.toLowerCase() + " babs!"
														: resp.user.first_name + lastname + " was never one of the " + key.toLowerCase() + " babs!";
								}
							}
							bot.sendmsg(msg.chat.id, msgToSend);
						}
					});
				}
			}
	}
};


bot.onText(/^\/biggestkid\S*$/i, function message(msg) {
    say(msg, "_looks around_\nI dunno little one, I dont see any big kids around here.");
});