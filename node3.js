import {Observable, interval} from 'rxjs'
import {map, zip, merge, delay} from 'rxjs/operators'
import {Transform, Readable} from 'stream'
import through from 'through2'
import {pipeline} from 'mississippi'
import fs from 'fs'
import cp from 'child_process'

/**
 * Trasnform a read stream into an observable with stream transforms 
 * via [https://github.com/maxogden/mississippi#pipeline] (missisipi) pipeline
 */


let count = 0;
let streamFromStr = str =>  cp.spawn(`echo ${str}`,[],{shell:'/bin/bash', stdio:"pipe"})
const single = new Transform({transform:function(chunk, enc,cb) {
let ch = Buffer.isBuffer(chunk) ? chunk.toString('utf8'): chunk
ch.split('').forEach(c => this.push(c))
cb(null)
}, flush:function(cb){
cb(null)
}})
const txt = fs.createReadStream('test.txt',{mode:0o777})
const rs = new Readable({read:function(size){
while(this.push(`${count}\n`) && count < 10) {
count++
}
if (count >=10) this.push(null)
}})
const read =  (rs,tr) => new Observable(subject => {
  let ts = new Transform({transform: function (chunk, enc, cb) {
    subject.next(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk )
    cb(null,chunk);
  }, flush: function(cb) {
    subject.complete()
    cb(null)
  }})
  //  Set flowing mode via pipe and backpressure
  tr && (rs.pipe(tr).pipe(ts), true) || rs.pipe(ts)

})

const stream1$ = read(txt, pipeline(single,through(function(chunk, enc, cb) {
  this.push(chunk)
cb()
})))
.pipe(zip(interval(400)),map(([n]) => n ))

const stream2$ = read(rs).pipe(zip(interval(400)),delay(200),map(([n]) => n ))

stream1$.pipe(merge(stream2$)).subscribe(console.log,console.warn,() => {console.log('END')})

read(streamFromStr('TEST').stdout,single)
.pipe(zip(interval(200)),map(([s])=>s))
.subscribe(console.log,console.warn,() => {console.log('END')})