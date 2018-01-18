#!/usr/bin/env node
/**
 * @file: hawkeyee-start
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
var getConfigFilename = require('./utils/getConfigFilename.js')
var assign = require('../dist/utils/assign')

module.exports = function (commander) {
  commander
    .command('start')
    .description('to start a server')
    .option('-c --config <path>', 'the path of configuration file.', './hawkeyee.config.js')
    .option('--silent', '  vers ', false)
    .option('--open', 'open', false)
    .option('--output.path <path>', 'output')
    .option('--output.publicPath <path>', 'publicPath')
    .action(function (commander) {
      commander = commander || {}

      var md5 = require('md5')
      var Hawkeyee = require('../dist')

      var configFilename = getConfigFilename(commander.config)

      var hawkeyee = new Hawkeyee(
        assign(
          {},
          require(configFilename),
          {
            hash: configFilename && md5(configFilename).slice(0, 6),
            silent: commander.silent,
            open: commander.open,
            output: assign({}, require(configFilename), {
              path: commander['output.path'],
              publicPath: commander['output.publicPath']
            })
          }
        )
      )

      hawkeyee.start()

      process.on('SIGINT', function () {
        hawkeyee.close()
          .then(function () {
            hawkeyee.clearRuntime()
            process.exit()
          }, function () {
            process.exit(1)
          })
      })
    })
}
