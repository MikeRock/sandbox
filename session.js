import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
const app = express()

app.set('x-powered-by', false)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'qweqwr',
    name: 'sessionID',
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 10000
    },
    saveUninitialized: false,
    resave: false
  })
)

app.get('*', async (req, res) => {
  if (req.session.count) {
    req.session.count++ // RESET CURRENT SESSION COOKIE ID ONLY WHEN CHANGE HAPPENS
    const count = req.session.count
    req.session.regenerate(err => {
      console.warn(err)
      req.session = Object.assign(req.session, { count })
      res.send(
        `SESSION ID ${req.sessionID} AND VISIT COUNTER ${req.session.count}`
      )
    })
  } else {
    req.session.count = 1
    res.send(`CREATED NEW SESSION WITH ID ${req.sessionID}`)
  }
})

app.listen(3000, () => {
  console.log(`SERVER RUNNING ON PORT 3000`)
})
