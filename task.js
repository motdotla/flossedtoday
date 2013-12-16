#!/usr/bin/env node

var c           = require('./constants').constants;
var models      = require('./models');
var Flosser     = models.Flosser;
var Reminder    = models.Reminder;

var email       = c.TO;
var flosser = new Flosser({
  email: email,
  reminder_hour_utc: 15
}); 
flosser.create(function(err, res) {
  if (err) { console.log(err); }
  console.log(res);

  var reminder = new Reminder({
    email: res.email
  }); 
  reminder.create(function(err, res) {
    if (err) { console.log(err); }
    console.log(res);

    process.exit();
  });
});


