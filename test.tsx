import * as style from './css.scss'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

class App extends React.Component {
  render() {
    return <div styleName="test">TEST</div>
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
