# FlossedToday

Have you flossed today? This application will help remind you. It uses SendGrid's APIs to make it happen.

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







