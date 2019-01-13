import express from 'express'
import session from 'express-session'
import redis from 'connect-redis'
import bodyParser from 'body-parser'
const RedisStore = redis(session)
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'test',
    store: new RedisStore({
      host: 'redis://localhost',
      port: 6379
    })
  })
)

app.listen(3000, () => {
  console.log('LISTENING ON PORT 3000')
})
