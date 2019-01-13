import immutable from 'immutable'
let { fromJS } = immutable

let ob = { one: 1, two: { three: 3 } }
let _ob = fromJS(ob)
let _ob2 = _ob.set('one', 2)
let _ob3 = _ob.set('two', { three: 4 })
