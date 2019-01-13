import express from 'express'
import { Request, Response } from 'express'
import bodyParser from 'body-parser'
import winston from 'winston'
import path from 'path'
import LogstashTransport from './LogstashTransport.js'

// import './css.scss'
const format = [
  winston.format.metadata({ server: 'EXPRESS' }),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`
  )
]
const options = {
  file: {
    level: 'info',
    filename: path.resolve(__dirname, 'logs/app.log'),
    handleExceptions: true,
    json: true,
    format: winston.format.combine(...format),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    // level: 'info',
    handleExceptions: true,
    json: true,
    format: winston.format.combine(winston.format.colorize(), ...format),
    colorize: false
  },
  logstash: {
    format: winston.format.combine(...format)
  }
}
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'verbose' : 'info',
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
    // @ts-ignore
    new LogstashTransport({
      host: '127.0.0.1',
      port: 5000,
      ...options.logstash
    })
  ],
  exitOnError: false // do not exit on handled exceptions
})
console.log = message => {
  logger.info(message)
}
console.error = message => {
  logger.error(message)
}
class Application {
  private app: express.Application
  constructor() {
    console.log('INITIATING...')
    this.app = express()
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.use(bodyParser.json())
    this.app.use('*', (req: Request, res: Response) => {
      res.send('OK')
    })
  }
  public getApp(): express.Application {
    return this.app
  }
}

const application = new Application()
application.getApp().listen(3000, () => {
  console.log('LISTENING ON PORT 3000')
  /*
  setInterval(() => {
    console.log(`TESTING T:${Date.now().toString()}`)
  }, 2000)
  */
})
