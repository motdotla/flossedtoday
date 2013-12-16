// Constants
var DATABASE_URL            = process.env.DATABASE_URL; 
var FROM                    = process.env.FROM || "hi@flossedtoday.com";
var SUBJECT                 = process.env.SUBJECT || "Have you flossed today?";
var BODY                    = process.env.BODY || "Have you flossed today? Please reply yes or no.";
var SENDGRID_USERNAME       = process.env.SENDGRID_USERNAME;
var SENDGRID_PASSWORD       = process.env.SENDGRID_PASSWORD;
var REDIS_URL               = process.env.REDIS_URL || process.env.REDISTOGO_URL || "redis://localhost:6379";
var DELTA_BETWEEN_REMINDERS_IN_MS = process.env.DELTA_BETWEEN_REMINDERS_IN_MS || 3600000;
var DEFAULT_REMINDER_HOUR_UTC     = process.env.DEFAULT_REMINDER_HOUR_UTC || 16;

var constants = {
  DATABASE_URL:                   DATABASE_URL,
  FROM:                           FROM,
  SUBJECT:                        SUBJECT,
  BODY:                           BODY,
  SENDGRID_USERNAME:              SENDGRID_USERNAME,
  SENDGRID_PASSWORD:              SENDGRID_PASSWORD,
  REDIS_URL:                      REDIS_URL,
  DELTA_BETWEEN_REMINDERS_IN_MS:  DELTA_BETWEEN_REMINDERS_IN_MS,
  DEFAULT_REMINDER_HOUR_UTC:      DEFAULT_REMINDER_HOUR_UTC
}

module.exports.constants = constants;
