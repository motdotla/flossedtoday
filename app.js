var dotenv      = require('dotenv');
dotenv.load();

var e           = module.exports;
e.ENV           = process.env.NODE_ENV || 'development';

var models      = require('./models');
var Reminder    = models.Reminder;

var port        = parseInt(process.env.PORT) || 3000;
var Hapi        = require('hapi');
server          = new Hapi.Server(+port, '0.0.0.0', { cors: true });

var home = {
  index: {
    handler: function (request) {
      Reminder.answeredYes('scott.motte@sendgrid.com', function(err, res) {
        request.reply({success: true}); 
      });
    }
  }
}

var inbound = {
  index: {
    handler: function (request) {
      // This is where the reply should happen
      request.reply({success: true}); 
    }
  }
}

server.route({
  method  : 'GET',
  path    : '/',
  config  : home.index
});

server.route({
  method  : 'POST',
  path    : '/inbound',
  config  : inbound.index
});

server.start(function() {
  console.log('FlossedToday.js server started at: ' + server.info.uri);
});
