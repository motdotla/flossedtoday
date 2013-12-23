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

var yar_options = {
  cookieOptions: {
    password: c.COOKIE_OPTIONS_PASSWORD,
    isSecure: false
  }
};

var port        = parseInt(process.env.PORT) || 3000;
var Hapi        = require('hapi');
server          = new Hapi.Server(+port, '0.0.0.0', options);
server.pack.allow({ ext: true }).require('yar', yar_options, function (err) { console.log(err); });

var main = {
  index: {
    handler: function () {
      var request = this;
      request.reply.view('index.html');
    }
  },
  dashboard: {
    handler: function () {
      var request   = this;
      var session   = request.session;
      var flosser_session = session.get('flosser');

      if (flosser_session && flosser_session.email) {
        Flosser.findByEmail(flosser_session.email, function(err, flosser) {
          if (err) { console.log(err); }

          // Convert to boolean
          flosser.enabled = (flosser.enabled === "true")
          var context = {
            flosser: flosser
          };

          request.reply.view('dashboard.html', context);
        });
      } else {
        request.reply.redirect("/");
      }
    }
  }
}

var flosser = {
  enable: {
    handler: function () {
      var request         = this;
      var session         = request.session;
      var flosser_session = session.get('flosser');
      var flosser = new Flosser({
        email: flosser_session.email,
        enabled: true
      }); 

      flosser.update(function(err, res) {
        request.reply({success: true});
      });
    }
  },
  disable: {
    handler: function () {
      var request         = this;
      var session         = request.session;
      var flosser_session = session.get('flosser');

      var flosser = new Flosser({
        email: flosser_session.email,
        enabled: false
      }); 

      flosser.update(function(err, res) {
        request.reply({success: true});
      });
    }
  }
}

var inbound = {
  index: {
    handler: function () {
      var request = this;
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
    handler: function() {
      var request = this;
      var session = request.session;
      var email   = request.payload.email;

      var flosser = new Flosser({
        email: email
      }); 

      flosser.create(function(err, res) {
        // login expires 24 hours from now
        session.set('flosser', { email: email });

        request.reply({success: true});
      });
    }
  }
}

server.route([{
  method  : 'GET',
  path    : '/',
  config  : main.index
},
{
  method  : 'GET',
  path    : '/dashboard',
  config  : main.dashboard
},
{
  method  : 'POST',
  path    : '/inbound',
  config  : inbound.index
},
{
  method  : 'POST',
  path    : '/login/success',
  config  : login.success
},
{
  method  : 'GET',
  path    : '/flosser/enable',
  config  : flosser.enable
},
{
  method  : 'GET',
  path    : '/flosser/disable',
  config  : flosser.disable
},
{
  method: 'GET',
  path: '/{path*}',
  handler: {
    directory: { path: './public', listing: false, index: true }
  }
}]);

server.start(function() {
  console.log('FlossedToday.js server started at: ' + server.info.uri);
});
