/**
 * @file: listOrSingle
 * @author: Cuttle Cong
 * @date: 2018/1/18
 * @description:
 */
var splitList = require('./splitList')

module.exports = function (argv) {
  var rlt = splitList(argv)
  return rlt && (rlt.length === 1 ? rlt[0] : rlt)
}
