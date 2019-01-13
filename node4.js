import cp from 'child_process'

const a = cp.fork(`console.log("wow")`, [], {
  execPath: 'node_modules/.bin/babel-node',
  execArgv: ['-e'],
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
})
const b = cp.fork(`console.log(process.argv[0])`, [], {
  execArgv: ['-e'],
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
})

b.stdout.pipe(process.stdout)
