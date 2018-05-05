/**
 * @file login
 * @author Cuttle Cong
 * @date 2018/5/4
 * @description
 */
const User = require('../../model/User')
const wrap = require('../../util/wrapHandle')

module.exports = function () {
  return wrap(async (req, res, next) => {
    let userId = req.session.userId
    let user = await User.findOne({ id: userId })
    delete user.password
    req.user = user
    next()
  })
}


