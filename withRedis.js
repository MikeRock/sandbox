import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import passport from 'passport'
import redis from 'connect-redis'
import client from 'redis'
import { Strategy as LocalStrategy } from 'passport-local'
const RedisStore = redis(session)
passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'user',
      passwordField: 'pass'
    },
    (user, pass, done) => {
      done(null, user)
    }
  )
)

passport.serializeUser(function(user, done) {
  console.log(`SU: ${user}`)
  done(null, user)
})

passport.deserializeUser(function(id, done) {
  console.log(`DU: ${id}`)
  done(null, id)
})

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
    resave: false,
    store: new RedisStore({
      port: 6379,
      host: 'localhost',
      ttl: 60, //seconds
      client: client.createClient()
    })
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.get('/logout', (req, res) => {
  if (req.isAuthenticated()) {
    req.logout()
    res.send('LOGGED OUT')
  } else res.send('ALREADY LOGGED OUT')
})
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) res.send(`ERR: ${err.message}`)
    if (!user) res.send(`PROBLEM:${info}`)
    else {
      req.login(user, err => {
        if (err) res.send(err.message)
        res.send(
          `AUTHENTICATED AS ${req.user} WITH SESSION ${JSON.stringify(
            req.session
          )}`
        )
      })
    }
  })(req, res, next)
})
app.get('/success', (req, res) => {
  res.send('SUCCESS')
})
app.get('/admin', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.session.count) req.session.count++
    else req.session.count = 1
    res.send(`WOHO ${req.user} PO RAZ ${req.session.count}`)
  } else res.send('NOES WHY FAIL')
})
app.get('/404', (req, res) => {
  res.send(`404 WITH USER ${req.user} SESSION:${JSON.stringify(req.session)}`)
})
app.get('*', async (req, res) => {
  if (req.session.count) {
    req.session.count++ // RESET CURRENT SESSION COOKIE ID ONLY WHEN CHANGE HAPPENS
    res.send(
      `SESSION ID ${req.sessionID} AND VISIT COUNTER ${req.session.count}`
    )
  } else {
    req.session.count = 1
    res.send(`CREATED NEW SESSION WITH ID ${req.sessionID}`)
  }
})

app.listen(3000, () => {
  console.log(`SERVER RUNNING ON PORT 3000`)
})
