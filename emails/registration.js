const keys = require('../keys')

module.exports = function (email) {
  return {

    "sender": { "email": "pavelsergienko7@gmail.com", "name": "Pavel Sergienko" },
    "subject": "Account has been created",
    "htmlContent": `<!DOCTYPE html><html><body><h1>Welcome to our shop</h1>
    <p>You've successfully created an account with email => ${email}</p>
    <hr><a href="${keys.BASE_URL}" target="_blank">Courses shop</a></a></body></html>`,
    "params": {
      "greeting": "This is the default greeting",
      "headline": "This is the default headline"
    },
    "messageVersions": [
      //Definition for Message Version 1 
      {
        "to": [
          {
            "email": email,
          },
        ],
      },
    ]

  }
}
