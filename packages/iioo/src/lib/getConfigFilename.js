/**
 * @file: getConfigFilename
 * @author: Cuttle Cong
 * @date: 2018/1/18
 * @description:
 */
import nps from 'path'
import findParentDir from 'find-parent-dir'

const basenames = [
  'iioo.json',
  'iioo.js',
  'iioo.config.json',
  'iioo.config.js'
]

export default function getConfigFilename(configFilename, options = {}) {
  if (typeof configFilename === 'object') {
    options = configFilename
    configFilename = void 0
  }
  const { cwd = process.cwd(), chdir = false, throwError = true } = options
  if (!configFilename) {
    let dir
    const basename = basenames.find(function (base) {
      dir = findParentDir.sync(cwd, base)
      return !!dir
    })

    if (dir) {
      configFilename = nps.join(dir, basename)
    }
  }

  if (!configFilename) {
    if (throwError) {
      throw new Error('iioo configuration file is not found.')
    }
    return
  }

  configFilename = nps.resolve(cwd, configFilename)
  chdir && process.chdir(nps.dirname(configFilename))

  return configFilename
}
