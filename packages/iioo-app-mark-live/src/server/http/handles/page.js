/**
 * @file login
 * @author Cuttle Cong
 * @date 2018/5/4
 * @description
 */
const wrap = require('../../util/wrapHandle')
const w = require('walli')
const walli = require('./walli')

function getCheck(check) {
  return function validInput(input, fallback) {
    if (!check(input)) {
      return fallback
    }
    return input
  }
}
const validNum = getCheck(num => {
  if (isNaN(num) || num <= 0) {
    return false
  }
})

module.exports = function({ pageSize = 10, pageNum = 1 } = {}) {
  return [
    walli({
      pageSize: w.number.optional,
      pageNum: w.number.optional,
      orderBy: w.string.optional
    }),
    wrap(async (req, res, next) => {
      req.ent.pageNum = validNum(req.ent.pageNum, pageNum)
      req.ent.pageSize = validNum(req.ent.pageSize, pageSize)
      next()
    })
  ]
}
