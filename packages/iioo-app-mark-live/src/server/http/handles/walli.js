/**
 * @file login
 * @author Cuttle Cong
 * @date 2018/5/4
 * @description
 */
const wrap = require('../../util/wrapHandle')
const w = require('walli')

module.exports = function(walli = {}) {
  return wrap(async (req, res, next) => {
    if (!(walli instanceof w.Verifiable)) {
      walli = w.leq(walli)
    }
    let result = walli.check(req.ent)
    if (!result.ok) {
      res.fail(result.toString())
      return
    }

    next()
  })
}
