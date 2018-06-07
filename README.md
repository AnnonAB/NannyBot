# NannyBot
NannyBot for Telegram


# Introduction
NannyBot is a bot for our ABDL telegram group. Written in node.js with help of
the node-telegram-bot-api NPM module.

She currently keeps track of gold stars, keeps score of babs who use naughty
words, whos the biggest, smallest and cutest babs, whos the biggest kid,
welcomes new users and serves up the rules.

She also provides the standard bot functions; a magic 8 ball, google search and
urban dictionary lookup.

She has a basic plugin interface with hot reload so you can add new components
on the fly.


# To Do
‣ Move all functions over to the plugin interface
‣ Make her portable so she can be reused in multiple groups without conflict
‣ Set up user access levels
‣ Provide Admin commands for enabling/disabling & restricting individual plugins


# Credits
NannyBot is a collaborative effort from the users in our group, for privacy
reasons, they won't be listed here. Thanks to everyone for putting up with
the spam during testing.

Thanks to the respective authors for the following NPM Modules:
‣ https://github.com/yagop/node-telegram-bot-api for the Telegram bot API module
‣ https://github.com/john-brock/SwearJar for the SwearJar module to keep track
   of users profanity score.
‣ https://github.com/jprichardson/node-google for the Google HTTP search result
   parser.
‣ https://momentjs.com for the date/time math module (currently unused)
