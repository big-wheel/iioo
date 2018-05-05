/**
 * @file login
 * @author Cuttle Cong
 * @date 2018/5/4
 * @description
 */
const User = require('../../model/User')
const wrap = require('../../util/wrapHandle')

module.exports = function (msg = 'please login in!') {
  return wrap(async (req, res, next) => {
    if (!req.session.userId) {
      res.fail(msg)
      return
    }
    if (!await User.exists({ id: req.session.userId })) {
      res.fail(msg)
      return
    }

    next()
  })

}
