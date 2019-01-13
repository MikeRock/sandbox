const path = require('path')
const utils = require('loader-utils')
const sharp = require('sharp')
const color = require('onecolor')
module.exports = function(context) {
  let callback = this.async()
  this.cacheable && this.cacheable()
  console.log(this.resourcePath)
  // return callback(null, context)
  sharp(this.resourcePath)
    .resize(10, 10, {
      fit: 'cover',
      position: sharp.strategy.entropy
    })
    .blur(1000)
    .toBuffer((err, buffer, info) => {
      if (err) return callback(err)
      callback(null, context.replace('{', `{dominant:"data:image/gif;base64,${buffer.toString('base64')}",`))
    })
}
module.exports.pitch = (remainingRequest, precedingRequest, data) => {
  if (false) {
    // fast exit to left loader skipping execution
    return 'module.exports = require(' + JSON.stringify('-!' + remainingRequest) + ');'
  }
}
