/**
 * @file: chdir
 * @author: Cuttle Cong
 * @date: 2018/1/18
 * @description:
 */
var nps = require('path')
var findParentDir = require('find-parent-dir')

module.exports = function (configFilename) {
  if (!configFilename) {
    var dir = findParentDir.sync(process.cwd(), 'iioo.config.js')
    if (dir) {
      configFilename = nps.join(dir, 'iioo.config.js')
    }
  }
  if (!configFilename) {
    throw new Error('iioo configuration file is not found.')
  }

  configFilename = nps.resolve(configFilename)
  process.chdir(nps.dirname(configFilename))

  return configFilename
}
