const keys = require('../keys')

module.exports = function (email, token) {
  return {

    sender: { "email": "pavelsergienko7@gmail.com", "name": "Pavel Sergienko" },
    subject: "Access recovery",
    htmlContent: `<!DOCTYPE html><html><body><h1>Have you forgotten your password?</h1>
    <p>If not, please ignore this email</p>
    <p>Otherwise follow the link below...</p>
    <p><a href="${keys.BASE_URL}/auth/password/${token}">Restore access</a></p>
    <hr><a href="${keys.BASE_URL}" target="_blank">Courses shop</a></a></body></html>`,
    params: {
      greeting: "This is the default greeting",
      headline: "This is the default headline"
    },
    messageVersions: [
      //Definition for Message Version 1 
      {
        to: [
          {
            email: email,
          },
        ],
      },
    ]
  }
}