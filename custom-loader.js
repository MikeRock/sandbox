const { writeFile } = require('fs')
const utils = require('loader-utils')
module.exports = function(context) {
  let callback = this.async()
  this.cacheable && this.cacheable()
  writeFile('./custom.log', JSON.stringify(utils.getOptions(this)), err => {
    callback(err, context)
  })
}
module.exports.pitch = (remainingRequest, precedingRequest, data) => {
  if (false) {
    // fast exit to left loader skipping execution
    return 'module.exports = require(' + JSON.stringify('-!' + remainingRequest) + ');'
  }
}
