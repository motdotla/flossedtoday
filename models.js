var c           = require('./constants').constants;
var sanitize    = require('validator').sanitize;
var Validator   = require('validator').Validator;
var redis       = require('redis');

// Libraries
var redis_url   = require("url").parse(c.REDIS_URL);
var db          = redis.createClient(redis_url.port, redis_url.hostname);
if (redis_url.auth) {
  db.auth(redis_url.auth.split(":")[1]); 
}
var sendgrid    = require('sendgrid')(c.SENDGRID_USERNAME, c.SENDGRID_PASSWORD);

// Setup validation
Validator.prototype.error = function (msg) {
  this._errors.push(new Error(msg));
  return this;
}
Validator.prototype.errors = function () {
  return this._errors;
}

// Models
//// App
var Flosser = module.exports.Flosser = function(self){
  var self                = self || 0;
  this._validator         = new Validator();
  this.email              = sanitize(self.email).trim().toLowerCase() || "";
  this.reminder_hour_utc  = self.reminder_hour_utc || c.DEFAULT_REMINDER_HOUR_UTC;
  this.enabled            = sanitize(""+self.enabled || "true").toBoolean();

  return this;
};

Flosser.all = function(fn) {
  db.SMEMBERS("flossers", function(err, emails) {
    if (err) { return fn(err, null); }

    fn(null, emails);
  });
};

Flosser.findByEmail = function(email, fn) {
  db.HGETALL("flossers/"+email, function(err, res) {
    if (err) { return fn(err, null); }

    if (!res) {
      var err = new Error("Flosser not found by that email.");
      return fn(err, res);
    }

    fn(err, res);
  });
};

Flosser.prototype.create = function(fn){
  var _this               = this;
  var key                 = "flossers/"+_this.email;

  this._validator.check(_this.email, "Invalid email.").isEmail();

  var errors = this._validator.errors();
  delete(this._validator);

  if (errors.length) {
    fn(errors, null);
  } else {
    db.SADD("flossers", _this.email); 
    db.HMSET(key, _this, function(err, res) {
      fn(err, _this);
    }); 
  }

  return this;
};

Flosser.prototype.update = function(fn){
  var _this               = this;
  var key                 = "flossers/"+_this.email;

  this._validator.check(_this.enabled, "Enabled must be set to true or false.").isIn([true, false])

  var errors = this._validator.errors();
  delete(this._validator);

  if (errors.length) {
    fn(errors, null);
  } else {
    db.HMSET(key, _this, function(err, res) {
      fn(err, _this);
    });
  }

  return this;
};

//// Reminder
var Reminder = module.exports.Reminder = function(self){
  var self                  = self || 0;
  this._validator           = new Validator();
  this.email                = sanitize(self.email).trim().toLowerCase() || "";

  return this;
};

Reminder.runTask = function(fn) {
  Flosser.all(function(err, emails) {
    if (err) { return fn(err, null); }

    console.log(emails);
    
    if (!emails.length) {
      return fn(null, true);
    }

    //iterate over flossers
    var iterator = 0;
    emails.forEach(function(email) {
      Flosser.findByEmail(email, function(err, flosser) {
        //make sure flosser has enabled reminders
        if (flosser.enabled == "true") {
          var reminder = new Reminder({
            email: email
          }); 
          reminder.create(function(err, res) {
            if (err) { console.log(err); }
            console.log(res);

            iterator = iterator + 1;
            if (iterator >= emails.length) {
              fn(null, true);
            }
          });
        }
      });
    });
  });
};

Reminder.send = function(to, fn) {
  var payload = {
    to:       to,
    replyto:  c.REPLYTO,
    from:     c.FROM,
    subject:  c.SUBJECT,
    text:     c.BODY
  }

  sendgrid.send(payload, function(err, json) {
    if (err) { 
      fn(err, null);
    } else {
      fn(null, json);
    };
  });
};

Reminder.answeredYes = function(email, fn) {
  var current_ms_epoch_time = +new Date;
  var key                   = "flossers/"+email+"/yesses";
  var value                 = current_ms_epoch_time;
  db.ZADD(key, value, value);
  fn(null, true);
};

Reminder.prototype.create = function(fn) {
  var _this                 = this;
  var current_ms_epoch_time = +new Date; 
  var reminders_key         = "flossers/"+_this.email+"/reminders";
  var yesses_key            = "flossers/"+_this.email+"/yesses";
  var value                 = current_ms_epoch_time;
  var x_ms_ago              = current_ms_epoch_time - +c.DELTA_BETWEEN_REMINDERS_IN_MS;
  var twelve_hours_ago      = current_ms_epoch_time - 43200000;

  this._validator.check(_this.email, "Invalid email.").isEmail();

  var errors = this._validator.errors();
  delete(this._validator);

  if (errors.length) {
    return fn(errors, null);
  }

  Flosser.findByEmail(_this.email, function(err, flosser) {
    if (err) { return fn(err, null); };

    var reminder_hour_utc = +flosser.reminder_hour_utc;
    var current_hour_utc  = new Date().getHours();

    // instead of this current, it should check against their normal sending time.
    var difference = current_hour_utc - reminder_hour_utc;
    if (difference >= 0 && difference <= 4) {
      var err = new Error("The time has passed when you can send reminders for today.");
      return fn(err, null);
    }

    // 3 reminders have already been sent over the last 12 hours 
    db.ZRANGEBYSCORE(reminders_key, twelve_hours_ago, "+inf", function(err, res) {
      if (res.length >= 3) {
        var err = new Error("3 reminders have already been sent today.");
        return fn(err, null);
      }
      // an answer of yes already exists within the last 12 hours
      db.ZRANGEBYSCORE(yesses_key, twelve_hours_ago, '+inf', function(err, res) {
        if (res.length) {
          var err = new Error("Flosser already answered yes.");
          return fn(err, null);
        }

        // a recent reminder already exists 
        db.ZRANGEBYSCORE(reminders_key, x_ms_ago, '+inf', function(err, res) {
          if (res.length) {
            var err = new Error("A recent reminder was already sent.");
            return fn(err, null);
          }

          Reminder.send(_this.email, function(err, res) {
            if (err) { return fn(err, null); }

            db.ZADD(reminders_key, value, value);
            fn(null, _this);
          }); 
        });
      });
    }); 
  });
}

module.exports.Flosser    = Flosser;
module.exports.Reminder   = Reminder;
