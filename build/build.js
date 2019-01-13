import React, {Component} from 'react'
import {createStore, applyMiddleware} from 'redux'
import {Provider, connect} from 'react-redux'
import ReactDOM from 'react-dom'


const reducer = (state={}, action) => {
  return state
}
const middleware = ({dispatch, getState}) => next => action => {
console.log(getState())
next(action)
}
const store = createStore(reducer,{number:1},applyMiddleware(middleware))()

class App extends Component {
constructor(...args) {
  super(...args)
}
render() {
  return (
    <div>Number is {this.props.number}</div>
  )
}
}
const Application = connect(({number}) =>({number}))(App)

ReactDOM.render(<Provider store={store}><Application/></Provider>, document.getElementById('app'))

