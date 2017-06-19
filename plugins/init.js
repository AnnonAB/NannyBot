// Imports
var fs = require("fs"),
	path = require("path");


// Definitions
var bot = null;
var plugin_dir = "plugins";
var plugin_list = [];


// Return a list of directories under @param srcpath
function listSubfolders(srcpath)
{
	return fs.readdirSync(srcpath).filter(
		function(file)
		{
			return fs.statSync(path.join(srcpath, file)).isDirectory();
		}
	);
}


// Return a list of files under @param srcpath
function listFiles(srcpath)
{
	return fs.readdirSync(srcpath).filter(
		function(file)
		{
			return fs.statSync(path.join(srcpath, file)).isFile();
		}
	);
}


// Iterate over packages under plugins/
function reload_packages()
{
	plugin_list = [];
	var plugin_package_list = listSubfolders(plugin_dir);
	
	for(var i in plugin_package_list)
	{
		iter_plugins(plugin_package_list[i]);
	}
}

exports.reload_packages = reload_packages;


// Iterate over plugins under plugins/@param
function iter_plugins(package_folder)
{
	var plugin_file_list = listFiles(plugin_dir + "/" + package_folder);
	
	for(var i in plugin_file_list)
	{
		import_plugin(package_folder, plugin_file_list[i]);
	}
}


// Import plugin files under package_list/file
function import_plugin(package_folder, plugin_file)
{
	try
	{
		delete require.cache[require.resolve("./" + package_folder + "/" + plugin_file)];
		var plugin = require("./" + package_folder + "/" + plugin_file);
		
		for(var i in plugin.commands)
		{
			plugin_list.push(plugin.commands[i]);
		}
	}
	catch(err)
	{
		console.log(err);
	}
}


// Handle a message
function handle_message(msgObject)
{
	for(var plugIndex in plugin_list)
	{
		var plugin = plugin_list[plugIndex];
		
		for(var regexIndex in plugin.match)
		{
			if(msgObject.text.match(plugin.match[regexIndex]))
			{
				plugin.callback(bot, msgObject);
			}
		}
	}
}


// Init
exports.init = function(tgBotObject)
{
	bot = tgBotObject;
	reload_packages();
	tgBotObject.onText(/.*/, handle_message);
}