import { Machine } from 'xstate'
import { interpret } from 'xstate/lib/interpreter'

const state = new Machine({
  initial: 'on',
  states: {
    on: { on: { TOGGLE: 'off' } },
    off: { on: { TOGGLE: 'on' } }
  }
})

const toggler = interpret(state)
  .onTransition(state => {
    console.log(`TRANSITION TO ${state.value}`)
  })
  .start()
toggler.onDone(_ => {
  console.log('DONE')
})
toggler.onChange(_ => {
  console.log('CHANGE')
})
toggler.send('TOGGLE')
