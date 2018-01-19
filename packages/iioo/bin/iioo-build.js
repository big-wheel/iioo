#!/usr/bin/env node
/**
 * @file: iioo-build
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
var getConfigFilename = require('../dist/lib/getConfigFilename')
var assign = require('../dist/utils/assign')

module.exports = function (commander) {
  commander
    .command('build')
    .description('to build and write static files to `config.output`')
    .option('-c --config <path>', 'the path of configuration file.')
    .option('--output.path <path>', 'output')
    .option('--output.publicPath <path>', 'publicPath')
    .option('--silent', '   ', false)
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
            hash: commander.config && md5(commander.config).slice(1, 7),
            silent: commander.silent,
            output: assign({}, config.output, {
              path: commander['output.path'],
              publicPath: commander['output.publicPath']
            }),
            noiioo: true
          }
        )
      )

      iioo.build()
        .then(function () {
          return iioo.close()
        })
        .then(function () {
          iioo.clearRuntime()
          process.exit()
        })
        .catch(function () {
          process.exit(1)
        })

      process.on('SIGINT', function () {
        iioo.close()
          .then(function () {
            iioo.clearRuntime()
            process.exit()
          })
          .catch(function () {
            process.exit(1)
          })
      })
    })
}
