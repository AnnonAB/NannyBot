var https = require("https");

exports.commands = {

	googleSearch: {
		match:
			[/\/google (.+)/i],

		usage:
			"/google What is the date today?",

		description:
			"Searches google and returns the first three links found",

		callback:
			function pluginCallback(tgBotObject, msgObject)
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
						tgBotObject.sendMessage(msgObject.chat.id, response);
					}
				}

				// Setup Async HTTP Request
				var body = "";

				var settings = {
					hostname: "www.google.com.au",
					port: 443,
					path: "/search?hl=en&output=search&q=" + encodeURIComponent(msgObject.text.indexOf(" ") + 1),
					headers: {
						"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36"
					}
				};

				// Async handler
				var httpObject = https.request(settings,
					function httpResult(res)
					{
						res.on("data", (chunk) => { body += chunk; });
						res.on("end", () => { callback(body); });
					}
				);

				// Initiate async request
				httpObject.end();
			}
	}

};
