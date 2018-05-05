/**
 * @file process
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const connect = require('express-socket.io-session')

module.exports = function process(io, server) {
  io.use(connect(server.session))
}
