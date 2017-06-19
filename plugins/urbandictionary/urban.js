var http = require("http");

exports.commands = {
	
	reload_packages: {
		match:
			[/\/(urban|udefine) (.+)/i],
		
		usage:
			"/urban furry",
			
		description:
			"Returns the urbandictionary definition of the term you submit",
			
		callback:
			function(tgBotObject, msgObject)
			{
				// Handler for HTTP response
				function callback(body)
				{
					var jResult = JSON.parse(body);
					
					if(jResult.list.length == 0)
					{
						tgBotObject.sendMessage(msgObject.chat.id, "Fluff! It seems that term hasn't been defined.");
					}
					else
					{
						tgBotObject.sendMessage(msgObject.chat.id, jResult.list[0].definition);
					}
				}
				
				// Async call urbandictionary.com
				var body = "";
				
				var settings = {
					hostname: "api.urbandictionary.com",
					port: 80,
					path: "/v0/define?term=" + encodeURIComponent(msgObject.text.substr(msgObject.text.indexOf(" ") + 1))
				};
				
				var httpObject = http.request(settings,
					function(res)
					{
						res.on("data", (chunk) => { body += chunk; });
						res.on("end", () => { callback(body); });
					}
				);
				
				httpObject.end();
			}
	}
	
}