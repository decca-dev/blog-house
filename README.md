# Blog House
Inspired by Doge House. Taking blogs to the moon 🚀 🌕

# Contribution guide:

1. Fork the repository
2. Clone it to your development environnement
3. Make a .env file with the following key value pairs:

```
PORT=server-port

MONGO_URI=mongo-connection-string

JWT_KEY=anything

JWT_RESET_KEY=anything

EMAIL=gmail-email-adress

PASSWORD=gmail-password

URL=http://localhost:PORT
```

**Note:** Since we're using nodemailer for sending the verification email to registered users, we would recommend that you make a new gmail account, put the credentials in the .env file, then, in your account check the [Allow less secure apps to access account](https://myaccount.google.com/lesssecureapps) option, by default this settings is off and you simply turn it on. Also you need to make sure that 2 factor authentication for the account is disabled.

*That's why we recommend making a new account*

4. run `npm install`
5. run `node .` and your app should be on.

# Todo

- [  ] API
- [  ] Feed (tracking what followed users did)
- [  ] Reputation leaderboard
- [  ] Post of the day