/**
 * @file connect
 * @author Cuttle Cong
 * @date 2018/5/5
 * @description
 */
import io, { Manager } from 'socket.io-client'
import { message } from 'antd'
import history from '../../history'
import mark from '../../lib/mark'
import md5 from 'md5'
import join from 'url-join'

module.exports = function connect(element, { userId, docId }) {
  const url = join(
    process.env.NODE_ENV === 'production'
      ? location.origin
      : 'http://localhost:8000',
    'playground'
  )

  const socket = io(url, {
    query: { docId }
  })
  global.io = socket

  const emitter = mark(element, {
    generateUid() {
      return md5(userId + '-' + Date.now() + '-' + Math.random())
    }
  })

  socket.ack = function(event, data) {
    socket.emit(event, data)
    let ackEvent = join(event, 'ack')
    return new Promise(resolve => {
      socket.once(ackEvent, ack => {
        resolve(ack)
      })
    })
  }

  emitter
    .on('highlight-add', async chunks => {
      console.log('highlight-add', chunks)
      if (!await socket.ack('/highlight/add', chunks)) {
        throw new Error('suspend /highlight/add')
      }
    })
    .on('highlight-remove', async id => {
      console.log('highlight-remove', id)
      if (!await socket.ack('/highlight/remove', id)) {
        throw new Error('suspend /highlight/remove')
      }
    })
    .on('highlight-change:color', async data => {
      console.log('highlight-change:color', data)
      if (!await socket.ack('/highlight/change/color', data)) {
        throw new Error('suspend /highlight/change/color')
      }
    })

  socket
    .on('error', console.error)
    .emit('ping')
    .on('no-auth', () => {
      // eslint-disable-next-line quotes
      message.error("Sorry, You don't have authentication.")
      history.push('/')
    })
    .on('echo', console.log)
    .on('/highlight/remove', id => {
      emitter.highlight.remove(id)
    })
    .on('/highlight/add', data => {
      if (!Array.isArray(data)) {
        data = [data]
      }
      data.forEach(data => emitter.highlight.fill(data))
    })

  return cb => {
    socket.close(cb)
  }
}
