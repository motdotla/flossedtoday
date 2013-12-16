var c           = require('./constants').constants;
var models      = require('./models');
var Flosser     = models.Flosser;
var Reminder    = models.Reminder;

var options = {
  views: {
    path: 'views',
    engines: { html: 'handlebars' }
  },
  cors: true
};

var port        = parseInt(process.env.PORT) || 3000;
var Hapi        = require('hapi');
server          = new Hapi.Server(+port, '0.0.0.0', options);

var main = {
  index: {
    handler: function (request) {
      request.reply.view('index.html');
    }
  },
  dashboard: {
    handler: function (request) {
      request.reply.view('dashboard.html');
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

var login = {
  success: {
    handler: function(request) {
      var email = request.payload.email;
      console.log(email);

      var flosser = new Flosser({
        email: email
      }); 

      flosser.create(function(err, res) {
        request.reply({success: true});
      });
    }
  }
}

server.route({
  method  : 'GET',
  path    : '/',
  config  : main.index
});

server.route({
  method  : 'GET',
  path    : '/dashboard',
  config  : main.dashboard
});

server.route({
  method  : 'POST',
  path    : '/inbound',
  config  : inbound.index
});

server.route({
  method  : 'POST',
  path    : '/login/success',
  config  : login.success
});

server.route({
  method: 'GET',
  path: '/{path*}',
  handler: {
    directory: { path: './public', listing: false, index: true }
  }
});

server.start(function() {
  console.log('FlossedToday.js server started at: ' + server.info.uri);
});
