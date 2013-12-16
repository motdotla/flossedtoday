#!/usr/bin/env node

var c           = require('./constants').constants;
var models      = require('./models');
var Flosser     = models.Flosser;
var Reminder    = models.Reminder;

Reminder.runTask(function(err, res) {
  if (err) { console.log(err); }

  console.log(res);

  process.exit();
});

