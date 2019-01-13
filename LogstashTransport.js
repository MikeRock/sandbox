const net = require('net')
const sender = require('os').hostname()

const Transform = require('stream').Transform
const Transport = require('winston-transport')

const transform = new Transform({
  transform(chunk, enc, cb) {
    this.push(chunk)
    cb()
  }
})
module.exports = class LogstashTransport extends Transport {
  constructor(opts) {
    super(opts)
    this.socket = net.createConnection({ port: opts.port, host: opts.host, allowHalfOpen: true })
    this.socket.on('end', () => {
      console.warn('END')
    })
    this.socket.on('close', () => {
      console.warn('CLOSED')
    })
    this.transform = this.socket.pipe(transform)
  }

  log(info, callback) {
    const message = {
      '@tags': ['nodejs', 'express'],
      '@message': info.message,
      '@fields': { sender: sender, level: info.level.replace(/\\e\[[0-9;]*/g, '') }
    }
    this.socket.write(JSON.stringify(message) + '\n', () => {
      this.emit('logged', info)
      callback()
    })
  }
}
