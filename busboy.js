import express from 'express'
import Busboy from 'busboy'
import { tmpdir } from 'os'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { Transform } from 'stream'
const app = express()

app.use((req, res, next) => {
  const bus = new Busboy({
    headers: req.headers,
    highWaterMark: res.writableHighWaterMark,
    fileHwm: req.readableHighWaterMark,
    limits: {
      fields: 100,
      files: 100
    }
  })
  console.log(`TMPDIR ${tmpdir()}`)
  bus.on('file', (fieldName, file, fileName, enc, mime) => {
    console.log(`DETECTED FILE ${fileName} IN FIELD ${fieldName} IN PAYLOAD`)
    ;(res.locals.upload && (res.locals.upload.push(`${fileName}`), true)) ||
      ((res.locals.upload = []), res.locals.upload.push(`${fileName}`))
    const f = fs.createWriteStream(
      path.resolve(__dirname, `caches/${fileName}`),
      { flags: 'w', mode: 0o777, autoClose: true }
    )
    const b = []
    let uri
    const t = new Transform({
      transform(chunk, enc, cb) {
        this.push(chunk)
        b.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        cb(null)
      },
      flush(cb) {
        console.log('JEST')
        uri = Buffer.concat(b)
        res.locals.uri = uri.toString('base64')
        cb(null)
      }
    })
    file
      .pipe(sharp().blur(100))
      .pipe(t)
      .pipe(f)
  })
  bus.on('finish', () => {
    // console.log(`HEADERS WERE ${res.headersSent ? '': 'NOT '}FLUSHED`)
    next()
  })
  req.pipe(bus)
})

app.post('*', async (req, res) => {
  console.log(`AFTER: ${JSON.stringify(app.locals)}`)
  console.log(`HEADERS WERE ${res.headersSent ? '' : 'NOT '}FLUSHED`)
  if (res.locals.upload) {
    let count = 0
    while (!res.locals.uri && count++ < 3) {
      await new Promise((resolve, _) => setTimeout(resolve, 1000))
    }
    res.write(`FILES UPLOADED\n`)
    res.end(`DATA URI GENERATED data:image/jpg;base64,${res.locals.uri}\n`)
  } else res.send('NO FILE UPLOADED\n')
})

app.listen(3000, () => {
  console.log(`SERVER LISTENING ON PORT 3000`)
})
