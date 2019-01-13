import dns from 'dns'
import request from 'request'
import retry from 'retry'

function waitFor(address, cb) {
  let operation = retry.operation({
    retries: 2,
    minTimeout: 1000,
    maxTimeout: 10000
  })
  operation.attempt(function(currentAttempt) {
    request(address, (err, res, body) => {
      if (operation.retry(err)) {
        return
      }
      cb(err ? operation.mainError().code : null, 'GOT RESPONSE')
    })
  })
}
let count = 0
let obj = {
  getter() {
    count++
    if (count < 3) throw new Error('Nope')
    return 'OK'
  }
}

let wrap = {
  retry: (obj, what, ...rest) => {
    const DEFAULT_OPTS = { retries: 4, minTimeout: 100, maxTimeout: 100 }
    const CB = 1
    const OPTS = 0
    let cb = rest.length === 2 ? rest[CB] : rest[0]
    let opts = rest.length === 2 ? rest[OPTS] : DEFAULT_OPTS
    const map = new Map()
    what
      .filter(i => obj[i])
      .forEach(i => {
        map.set(i, obj[i])
        obj[i] = (i =>
          (async (...args) => {
            let result
            let finished = false
            let op = retry.operation(opts)
            op.attempt(count => {
              try {
                result = map.get(i)(...args)
                finished = true
                cb(null, { prop: i, result })
              } catch (err) {
                if (!op.retry(err))
                  (finished = true),
                    (result = undefined),
                    cb(err, { prop: i, result: undefined })
              }
            })

            let r = await new Promise(async resolve => {
              let count = 1
              while ((count++, !finished))
                await new Promise(r => setTimeout(r, count * 0.1 * 100 + 100))
              resolve(result)
            })

            return r
          }).bind(null, cb))(i)
      })
    return () => {
      for (let k of map.keys()) {
        obj[k] = map.get(k)
      }
    }
  },
  DEFAULT_OPTS: {
    get function() {
      const _def = { retries: 4, minTimeout: 100, maxTimeout: 100 }
      return _def
    },
    set function(_) {
      throw new Error('Cannot set redonly property DEFAULT_OPTS')
    }
  }
}

let unload = wrap.retry(obj, ['getter'], wrap.DEFAULT_OPTS, (err, result) => {
  console.log(result)
})

let x = (async () => {
  let result = await obj.getter()
  console.log(result)
})()
