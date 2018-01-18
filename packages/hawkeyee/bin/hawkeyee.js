#!/usr/bin/env node
/**
 * @file: hawkeyee
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
var commander = require('commander')
var util = require('util')
var pkg = require('../package.json')
var getConfigFilename = require('./utils/getConfigFilename')
var rlv = require('../dist/utils/resolvePlugin')

commander
  .version(pkg.version)
  .usage('[command] [options]')

// Official command
;[
  require('./hawkeyee-start'),
  require('./hawkeyee-build')
].forEach(function (registerCommand) {
  registerCommand(commander)
})

// Customized command
var config = {}
try {
  var foundConfigFilename = getConfigFilename()
  config = require(foundConfigFilename)
} catch (error) {
  // not found
}

if (config && util.isArray(config.commanders)) {

  config.commanders.forEach(function (command) {
    try {
      var registerCommand = rlv.resolveRequest(command, { prefix: 'hawkeyee-commander-' })
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
