#!/usr/bin/env node
var dotenv      = require('dotenv');
dotenv.load();

var e           = module.exports;
e.ENV           = process.env.NODE_ENV || 'development';

var models      = require('./models');
var Flosser     = models.Flosser;
var Reminder    = models.Reminder;

var email       = "scott.motte@sendgrid.com";
var flosser = new Flosser({
  email: email,
  reminder_hour_utc: 15
}); 
flosser.create(function(err, res) {
  if (err) { console.log(err); }

  var reminder = new Reminder({
    email: res.email
  }); 
  reminder.create(function(err, res) {
    if (err) { console.log(err); }
    console.log(res);
  });
});


