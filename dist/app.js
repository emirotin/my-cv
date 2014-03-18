require('coffee-script/register')
server = require("./server.coffee");
config = require("./config");
server.startServer(config, function(){});
