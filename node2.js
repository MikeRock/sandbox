import cluster, { prependListener } from 'cluster'
import { Transform } from 'stream'
import cp from 'child_process'
import net from 'net'
import { SSL_OP_TLS_D5_BUG } from 'constants'

console.log(`WORKER ${process.pid} STARTED`)
process.on('uncaughtException', err => {
  console.warn(err)
})
const server = net.createServer(socket => {})
server.on('close', () => {
  console.log('SERVER CLOSED')
})
server.listen(0, () => {
  console.log(`SERVER LISTENING ON PORT ${server.address().port}`)
})
process.stdin.on('data', data => {
  let ts = new Transform({
    transform: function(chunk, enc, cb) {
      let trimmed = `${chunk.toString().trim()}\n`
      cb(null, trimmed)
    },
    flush: function(cb) {
      cb(null)
    }
  })
  let ts2 = new Transform({
    transform: function(data, enc, cb) {
      this.push(
        Buffer.isBuffer(data)
          ? data.toString('utf8').toUpperCase()
          : data.toUpperCase()
      )
      cb()
    },
    flush: function(cb) {
      cb()
    }
  })
  ts2.on('readable', () => {
    console.log('DATA READABLE')
  })
  /*
let upper = data.toString().replace(/[\n\t]+/,'').toUpperCase()
let grep = cp.spawn(`echo ${upper} | egrep A`,[],{stdio:"pipe", shell: '/bin/bash', encoding: 'utf8'})
let wc = cp.spawn('wc -c',[],{shell:'/bin/bash',stdio:"pipe"})
grep.stdout.pipe(wc.stdin)
wc.stdout.pipe(ts).pipe(process.stdout)
*/
  ts2.pipe(process.stdout)
  ts2.write('test\n')
  ts2.write('test3\n')
  ts2.end()
})
console.log(`CALLED WITH:${process.argv0}`)
setTimeout(() => {
  //cluster.worker.kill()
}, 1000)
