import Moment from 'moment'
Moment.locale('pl')
let m = Moment([2018, 11], Moment.defaultFormat, false)

// Duration must get values in ms
// Checking duration of difference between two dates
console.log(Moment.duration(m.diff(Moment.now(), 'ms')).humanize(true))
console.log(Moment.min(Moment(Date.now()), Moment([2020])).format())
console.log(
  Moment.max(
    Moment('2024-12-11', Moment.defaultFormat, false),
    Moment([2020]),
    Moment(Moment.now())
  ).format()
)
// Duration
const duration = (a, b) => {
  return Moment.duration(a.diff(b, 'ms')).humanize(true)
}
const fromNow = a => {
  return duration(a, Moment(Date.now()))
}
console.log(fromNow(Moment([2017])))
// month and weekday start from 0
// day starts from 1
// First month
console.log(
  Moment(Moment.now())
    .set('month', 0)
    .toString()
)
// first day of week
console.log(
  Moment(Moment.now())
    .set('day', 1)
    .toString()
)
console.log(
  Moment(Moment.now())
    .set('weekday', 0)
    .toString()
)
// day of month
console.log(
  Moment(Moment.now())
    .set('D', 21)
    .toString()
)
// M : Y M; ms: Y M D m s ms
console.log(Moment(Moment.now()).isBetween([2017], [2018, 1], 'Y', '[]'))
// Diff:  FIRST date in comparison to second in MS
// TO check in other values use Moment.difference
console.log(Moment([2018]).diff(Moment(Date.now())))

console.log(Moment(new Date('2011-12-11T23:21:11')))

// Get locales with WebpackIgnorePlugin
