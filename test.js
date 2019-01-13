import style from './scss/index.scss'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import image from './assets/bee.jpg'
const worker = new Worker('./worker.js', { type: 'module' })
worker.onmessage = event => {
  console.log(event.data)
}
worker.postMessage('PING')
console.log(image)
class App extends Component {
  render() {
    return (
      <div
        styleName="test"
        style={{
          width: 200,
          height: 200
        }}
      >
        TEST
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
