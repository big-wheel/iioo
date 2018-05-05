/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */

const app = require('express')()
const socketio = require('socket.io')
const port = process.env.PORT || 8000

const server = app.listen(port, () => {
  console.log('server on ' + port)
})
require('./http/index.js')(app)

const io = socketio(server)
require('./ws-http')(io, app)
require('./ws/index')(io)
