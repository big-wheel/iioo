/**
 * @file: common
 * @author: Cuttle Cong
 * @date: 2018/1/19
 * @description:
 */
var splitList = require('./splitList')
var listOrSingle = require('./listOrSingle')

module.exports = function (commander) {
  return commander
    .option('-c --config <path>', 'the path of configuration file.')
    .option('-e --entry <paths>', 'the path of the entry.', listOrSingle)
    .option('-g --log-level <type>', 'debug|info|warn|error', /^(debug|info|warn|error)$/i)
    .option('-l --plugins <plugins>', 'plugins', splitList)
    .option('-s --silent', '  vers ', false)
    .option('-t --template <path>', '  template ')
}
