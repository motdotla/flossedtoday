var c           = require('./constants').constants;
var models      = require('./models');
var Reminder    = models.Reminder;

var port        = parseInt(process.env.PORT) || 3000;
var Hapi        = require('hapi');
server          = new Hapi.Server(+port, '0.0.0.0', { cors: true });

var home = {
  index: {
    handler: function (request) {
      request.reply({success: true, message: 'You are using FlossedToday. See README for instructions.'}); 
    }
  }
}

var inbound = {
  index: {
    handler: function (request) {
      var payload = request.payload;

      console.log(payload);

      if (payload.envelope) { envelope  = JSON.parse(payload.envelope) }; 

      var reply_html = payload.html.replace(c.BODY, "").toLowerCase();

      if (reply_html.indexOf("yes") >= 0) {
        Reminder.answeredYes(envelope.from, function(err, res) {
          request.reply({success: true}); 
        });
      } else {
        console.log("Reply did not include 'Yes'");

        request.reply({success: true});
      }
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
