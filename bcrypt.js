import bcrypt from 'bcrypt'
;(async () => {
  if (!process.argv[2]) return process.stdout.write('NO INPUT')
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(process.argv[2], salt)
  const v = await bcrypt.compare(process.argv[2], hash)
  process.stdout.write(hash)
  process.stdout.write(`\nHASH WAS${v ? '' : ' NOT'} VERIFIED\n`)
})()
