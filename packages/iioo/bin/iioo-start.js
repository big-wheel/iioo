#!/usr/bin/env node
/**
 * @file: iioo-start
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
var nps = require('path')

var getConfigFilename = require('../dist/lib/getConfigFilename')
var splitList = require('./utils/splitList')
var listOrSingle = require('./utils/listOrSingle')
var assign = require('../dist/utils/assign')

module.exports = function (commander) {
  commander
    .command('start')
    .description('to start a server')
    .option('-c --config <path>', 'the path of configuration file.')
    .option('-e --entry <paths>', 'the path of the entry.', listOrSingle)
    .option('-g --log-level <type>', 'debug|info|warn|error', /^(debug|info|warn|error)$/i)
    .option('-l --plugins <plugins>', 'plugins', splitList)
    .option('-p --port <port>', 'port', Number)
    .option('-s --silent', '  vers ', false)
    .option('-t --template <path>', '  template ')
    .option('-o --open', 'open', false)
    .option('-d --output.path <path>', 'output')
    .option('-P --output.public-path <path>', 'publicPath')
    .action(function (commander) {
      commander = commander || {}

      var md5 = require('md5')
      var IIOO = require('../dist')
      var configFilename = getConfigFilename(commander.config, { chdir: true, throwError: false })
      var config = configFilename ? require(configFilename) : {}
      var iioo = new IIOO(
        assign(
          {},
          config,
          {
            cwd: configFilename ? nps.dirname(configFilename) : process.cwd(),
            hash: configFilename && md5(configFilename).slice(0, 6),
            silent: commander.silent,
            entry: commander.entry,
            open: commander.open,
            plugins: commander.plugins,
            port: commander.port,
            logLevel: commander.logLevel,
            template: commander.template,
            output: assign({}, config, {
              path: commander['output.path'],
              publicPath: commander['output.publicPath']
            }),
            noiioo: true
          }
        )
      )

      iioo.start()

      process.on('SIGINT', function () {
        iioo.close()
          .then(function () {
            iioo.clearRuntime()
            process.exit()
          }, function () {
            process.exit(1)
          })
      })
    })
}
