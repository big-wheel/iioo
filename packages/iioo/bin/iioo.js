#!/usr/bin/env node
/**
 * @file: iioo
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
var commander = require('commander')
var util = require('util')
var pkg = require('../package.json')
var getConfigFilename = require('../dist/lib/getConfigFilename')
var rlv = require('../dist/utils/resolvePlugin')
var registerOverwriteRequire = require('../dist/lib/registerOverwriteRequire')

commander
  .version(pkg.version)
  .usage('[command] [options]')

// Official command
;[
  require('./iioo-start'),
  require('./iioo-build')
].forEach(function (registerCommand) {
  registerCommand(commander)
})

// Customized command

// NOTE: registerOverwriteRequire, for use iioo in global, and require('iioo/abc') in commander
registerOverwriteRequire()

var config = {}
try {
  var foundConfigFilename = getConfigFilename(void 0, { chdir: true })
  config = require(foundConfigFilename)
} catch (error) {
  // not found
}

if (config && util.isArray(config.commanders)) {

  config.commanders.forEach(function (command) {
    try {
      var registerCommand = rlv.resolveRequest(command, { prefix: 'iioo-commander-' })
      if (util.isFunction(registerCommand)) {
        registerCommand.call(null, command, config)
      }
    } catch (err) {
      // commander is not found should be ignored
      if (
        !(err.code === 'MODULE_NOT_FOUND' && err.message.includes(command))
      ) {
        throw err
      }
    }
  })
}

commander.parse(process.argv)
