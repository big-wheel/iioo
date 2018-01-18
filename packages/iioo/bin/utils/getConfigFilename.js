/**
 * @file: chdir
 * @author: Cuttle Cong
 * @date: 2018/1/18
 * @description:
 */
var nps = require('path')
var findParentDir = require('find-parent-dir')

var basenames = [
  'iioo.json',
  'iioo.config.json',
  'iioo.js',
  'iioo.config.js'
]

module.exports = function (configFilename) {
  if (!configFilename) {
    var dir
    var basename = basenames.find(function (base) {
      dir = findParentDir.sync(process.cwd(), base)
      return !!dir
    })

    if (dir) {
      configFilename = nps.join(dir, basename)
    }
  }
  if (!configFilename) {
    throw new Error('iioo configuration file is not found.')
  }

  configFilename = nps.resolve(configFilename)
  process.chdir(nps.dirname(configFilename))

  return configFilename
}
