import chokidar from 'chokidar'
import rimraf from 'rimraf'
import fs from 'fs-extra'
import { Glob } from 'glob'
import execa from 'execa'
;(async function() {
  const { stdout: v } = execa.shellSync('node -v', { shell: '/bin/bash' })
  console.log(v)
})()
