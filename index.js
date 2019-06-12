
const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const ses = new AWS.SES({
  region: process.env.REGION
});

app.get('/', (req, res) => {
  res.send('emaiLess');
});

app.post('/send-email', (req, res) => {
  const { templateName, sendTo, data } = req.body;

  const params = {
    Template: templateName,
    Destination: {
      ToAddresses: sendTo
    },
    ReplyToAddresses: [process.env.EMAIL_REPLYTO],
    Source: process.env.EMAIL_SENDER,
    TemplateData: JSON.stringify(data)
  };

  ses.sendTemplatedEmail(params, (err, data) => {
    if (err) res.send(err);
    else res.send(200);
  });

});

app.post('/add-template', (req, res) => {
  const { templateName, subject, body } = req.body

  var params = {
    Template: {
      TemplateName: templateName,
      HtmlPart: body,
      TextPart: body,
      SubjectPart: subject
    }
  }

  ses.createTemplate(params, (err, data) => {
    if (err) res.send(err);
    else res.send(200);
  })
})

app.post('/rm-template', (req, res) => {
  const { templateName } = req.body

  var params = {
    TemplateName: templateName
  }

  ses.deleteTemplate(params, (err, data) => {
    if (err) res.send(err);
    else res.send(200);
  })
})

module.exports.handler = serverless(app);