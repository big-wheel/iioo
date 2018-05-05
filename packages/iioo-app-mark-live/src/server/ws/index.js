/**
 * @file process
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const playground = require('./playground')

function auth(fn) {
  return function() {
    if (!this.handshake.session || !this.handshake.session.userId) {
      this.emit('no-auth')
      return
    }
    return fn && fn.apply(this, arguments)
  }
}

module.exports = function process(io) {
  console.log('io running')
  io.use((socket, next) => {
    if (!socket.handshake.session || !socket.handshake.session.userId) {
      return next(new Error('Authentication error'))
    }
    return next()
  })
  io.on('connection', client => {
    console.log('io connection')
    client.on('ping', auth())
  })

  playground(io)
}
