import express from 'express'
import nodemailer from 'nodemailer'
import { getMaxListeners } from 'cluster'

const app = express()
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: `hidetama1986`,
    pass: `opensesamee2`
  }
})

app.get('/mail', async (req, res) => {
  const result = await transport.sendMail({
    from: 'maka1986@wp.pl',
    to: 'contact@mikerock.pl',
    subject: 'Nodemailer test',
    html: '<p>Hi from nodemailer</p>'
  })
  res.send(`Mail sent to contact@mikerock.pl with ${JSON.stringify(result)}`)
})
/**
 * RETURNS
 * {"accepted":["contact@mikerock.pl"],"rejected":[],"envelopeTime":383,"messageTi
 * me":963,"messageSize":279,"response":"250 2.0.0 OK 1544221210 10sm817720lff.62 - gsmtp","envelope":{"from":"maka1986@
 * wp.pl","to":["contact@mikerock.pl"]},"messageId":"<02913402-e939-47e0-a879-461e91e1b2bb@wp.pl>"}%
 */
app.listen(3000, () => {
  console.log(`Server listening on port 3000`)
})
