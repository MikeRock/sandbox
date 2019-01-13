import util from 'util'
import stream from 'stream'
import { StringDecoder } from 'string_decoder'

// Formatowanie adresu na https
/*
if(!['http','https'].some(s => process.argv[2].includes(s))) throw new Error('Schema must be set')
const f = util.format(process.argv[2].replace(/^https?/,'%s'),'https')
*/
let ws = new stream.Readable({
  read(size) {
    let arr = [1, 2, 3, 4]
    while (
      arr.length &&
      this.push(Buffer.from(arr.shift().toString(), 'utf-8'))
    );
    this.push(null)
  }
})
let str = ''
let str2 = str
let td = new util.TextDecoder('utf-8')
let sd = new StringDecoder()
ws.on('data', chunk => {
  str2 += sd.write(chunk)
  str += td.decode(new Uint8Array(chunk), { stream: true })
})
ws.on('end', () => {
  str2 += sd.end()
  str += td.decode()
  console.log(str2)
  console.log(str)
})
// TextEncoder encodes as UInt8Array
let te = new util.TextEncoder()
console.log(te.encode('test string'))

// ? USE TextEncoder to encode to UInt8Array buffers decode with StringDecoder
