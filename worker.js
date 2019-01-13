addEventListener('message', event => {
  if (event.data === 'PING') postMessage('PONG')
})
