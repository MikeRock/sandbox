import express from 'express'
import session from 'express-session'
import bp from 'body-parser'
import passport from 'passport'
import path from 'path'
import cookie from 'cookie-parser'
import redis from 'connect-redis'
import { Strategy as LocalStrategy } from 'passport-local'
passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'user',
      passwordField: 'pass'
      //  passReqToCallback: true
    },
    (user, pass, done) => {
      // !TODO AUTH
      console.log(`VALIDATED AS ${user}`)
      return done(null, user)
    }
  )
)

passport.serializeUser((user, done) => {
  console.log(`SU: ${user}`)
  done(null, user)
})

passport.deserializeUser((id, done) => {
  console.log(`DU: ${id}`)
  done(null, id)
})

const RedisStore = redis(session)
const app = express()
app.use(express.static(path.resolve(__dirname, 'public')))
app.use(bp.json())
app.use(bp.urlencoded({ extended: false }))
// app.use(cookie())
app.use(
  session({
    secret: 'mykey',
    name: 'sesionid',
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 600000
    },
    store: new RedisStore({ host: 'redis://localhost', port: 6379 }),
    saveUninitialized: true,
    resave: true
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.get('/session', (req, res) => {
  if (req.sessionId) res.send(`SESSION is ${req.sessionID}`)
})

app.post('/secure', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) res.send(`NOT AUTHENTICATED\n ${JSON.stringify(err.message)}`)
    else {
      req.login(user, error => {
        if (!error) res.send(`AUTHENTICATED AS ${user}`)
        else res.send(`NO LOGIN BECAUSE ${JSON.stringify(error)}`)
      })
    }
  })(req, res, next)
})

app.get('/admin', passport.authenticate('local', { failureRedirect: '/404' }), (req, res) => {
  res.send('SECURE CONTENT')
})
app.get('/404', (req, res) => {
  res.send('404')
})

app.use('*', (err, req, res, next) => {
  res.send(`ERRORZ:${err.message}`)
})

const server = app.listen(3000, () => {
  console.log(`SERVER LISTENING ON PORT ${server.address().port}`)
})
