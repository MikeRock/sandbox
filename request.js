import request from 'request'
import fetch from 'node-fetch'
import http from 'http'
import fs from 'fs'
process.on('uncaughtException',(err) => {
  console.warn(err.message)
})
const server = http.createServer((req,res) => {
  const json = {path:req.url, method: req.method, upgrade: req.httpVersion,
  origin: req.headers.host }
  res.setHeader('Content-Type','application/json')
  res.flushHeaders()
  if(req.url.includes('/redirect'))
  request('https://jsonplaceholder.typicode.com/users/2',{method: 'GET'}).on('response',async _ => {
    const r = await fetch('https://jsonplaceholder.typicode.com/users/2',{method:'GET',follow: true})
    res.write(JSON.stringify(await r.json()))
    res.end()
  })
  else {
  res.write(JSON.stringify(json))
  res.end() }
})
server.listen(3000)
process.nextTick(() => {
  request.get('http://localhost:3000/redirect').on('complete',(res) => {
    setTimeout(() => {
      server.close()
    })
  },0).pipe(process.stdout)
})
