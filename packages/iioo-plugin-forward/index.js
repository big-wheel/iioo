/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const forwardReq = require('./forward')
module.exports = function forw(forward) {
  const iioo = this
  iioo.on('this-server', server => {
    Object.keys(forward).forEach(test => {
      let data = forward[test]
      if (typeof data === 'string') {
        data = { target: data }
      }

      server.all(new RegExp(test), (req, res, next) => {
        forwardReq(
          req,
          res,
          req.url.replace(new RegExp(test), data.target),
          data
        )
      })
    })
  })
}
