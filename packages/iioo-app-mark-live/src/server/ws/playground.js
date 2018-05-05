/**
 * @file playground
 * @author Cuttle Cong
 * @date 2018/5/5
 * @description
 */
const Highlight = require('../model/Highlight')

module.exports = function(io) {
  io = io.of('/playground')
  console.log('register playground io')

  io.on('connection', async socket => {
    console.log('playground: connection')

    const { docId } = socket.handshake.query
    // TODO  permission
    if (!docId) {
      socket.disconnect()
      return
    }

    const items = await Highlight.find({ docid: docId })
    socket.emit('/highlight/add', items)

    let roomId = `doc/${docId}`
    socket.join(roomId)
    socket = socket
      .on('/highlight/add', async data => {
        const { id, color, chunks } = data
        let rlt = await Highlight.insert({
          id,
          color,
          chunks: JSON.stringify(chunks),
          datetime: new Date(),
          docid: docId
        })
        console.log('add', rlt)
        if (rlt.affectedRows >= 1) {
          socket.emit('/highlight/add/ack', 1)
          socket.to(roomId).emit('/highlight/add', data)
        }
        else {
          socket.emit('/highlight/add/ack', 0)
        }
      })
      .on('/highlight/remove', async id => {
        if (await Highlight.delete({ id })) {
          socket.emit('/highlight/remove/ack', 1)
          socket.to(roomId).emit('/highlight/remove', id)
        } else {
          socket.emit('/highlight/remove/ack', 0)
        }
      })
      .on('/highlight/change/color', async ({ id, color }) => {
        // if (await Highlight.update({ id })) {
        //   socket.emit('/highlight/remove/ack', 1)
        //   socket.to(roomId).emit('/highlight/remove', id)
        // } else {
        //   socket.emit('/highlight/remove/ack', 0)
        // }
      })
      .on('error', console.error)
  })
}
