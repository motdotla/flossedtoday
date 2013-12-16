# Flossed Today

![](https://raw.github.com/scottmotte/flossedtoday/master/flossedtoday.png)

Have you flossed today? This application will help remind you. It uses SendGrid's APIs ([mail](http://sendgrid.com/docs/API_Reference/Web_API/mail.html) and [inbound parse](http://sendgrid.com/docs/API_Reference/Webhooks/parse.html)) to make it happen.

## Usage

Setup your .env file.

```
cp .env.example .env
```

Edit the `.env` file with your credentials.

Start the server and [ngrok](https://ngrok.com/).

```
node app.js
ngrok 3000
```

Setup [SendGrid's Parse API](http://sendgrid.com/developer/reply). It will look something like the following. The `flossedtoday.bymail.in` should be the same value you set in the `REPLYTO` environment variable.

![](https://raw.github.com/scottmotte/flossedtoday/master/inbound-setup-example.png)

For example, you could use `yourusername.bymail.in`.

Visit [localhost:3000](http://localhost:3000) and sign up with your email.

The last step is to run `task.js`.

```
node ./task.js
```

This will send you an email if the time is 16 UTC hour. If you want to change to your current UTC hour, change the `DEFAULT_REMINDER_HOUR_UTC` in the `.env` file. 

## Installation

```
git clone https://github.com/scottmotte/flossedtoday
cd flossedtoday
heroku create
heroku addons:add scheduler
heroku addons:add sendgrid
heroku addons:add redistogo
heroku config:set REPLYTO=inbound@yoursendgridusername.bymail.in
git push heroku master
```

Then setup heroku scheduler to run once every hour like the following:

![](https://raw.github.com/scottmotte/flossedtoday/master/heroku-scheduler-example.png)

Then setup the SendGrid parse API to use the inbound@yoursendgridusername.bymail.in you setup as the REPLYTO.

Type the following to get your sendgrid username and password. 

```
heroku config
```

Then go to <http://sendgrid.com/login>. After logging in with those credentials, visit the [parse settings](http://sendgrid.com/developer/reply). Set those up like the following, but with your inbound email and url of the app.

![](https://raw.github.com/scottmotte/flossedtoday/master/inbound-setup-example.png)


You'r done. Now go and signup and tell others to signup. They will start receiving email messages asking if they flossed today or not. If they reply yes then the reminders will stop. Otherwise, they will be reminded up to 3 more times that day.

