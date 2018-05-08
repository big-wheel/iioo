/* eslint-disable indent,no-use-before-define */
/**
 * @file remoteStorage
 * @author Cuttle Cong
 * @date 2018/5/6
 * @description
 */

import * as AV from 'leancloud-storage'
import { Realtime, MessagePriority, TextMessage } from 'leancloud-realtime'
// TODO
import mark from '/Users/yucong02/self/iioo-repo/packages/markme/index'

export default async function markInLocalStorage(element, options = {}) {
  options = {
    enableInitialFill: true,
    // clientId: Date.now() + '',
    clientId: null,
    key: location.origin + location.pathname,
    AVOptions: {},
    ...options
  }
  if (!options.clientId) {
    throw new Error('clientId is required.')
  }
  // AV.
  AV.applicationId = null
  AV.init(options.AVOptions)
  const realtime = new Realtime(options.AVOptions)

  let admin = await realtime.createIMClient('__admin__')
  let conversation = await admin.createConversation({
    name: 'MarkmeLeancloud',
    members: [],
    unique: true
  })

  let me = await realtime.createIMClient(options.clientId)
  me.on('message', function(message, conversation) {
    const data = JSON.parse(message.text)
    console.log(
      '[me] received a message from [' + message.from + ']:', data
    )
    // 收到消息之后一般的做法是做 UI 展现，示例代码在此处做消息回复，仅为了演示收到消息之后的操作，仅供参考。
    switch (data.type) {
      case 'highlight-add':
        emitter.highlight.fill(data.data)
        break
      case 'highlight-remove':
        emitter.highlight.remove(data.data)
        break
    }
  })

  // conversation = await me.getConversation(conversation.id)
  await conversation.add([me.id])

  let meConversation = await me.getConversation(conversation.id)
  await meConversation.join()
  console.warn('clientId', options.clientId)
  async function send(type, data) {
    console.warn('will send', { type, data })
    await meConversation.send(
      new TextMessage(JSON.stringify({ type, data }), { priority: MessagePriority.HIGH })
    )
  }

  const Markme = AV.Object.extend('Markme')

  const emitter = mark(element, options)
  function toJSON(x) {
    let { data, ...json } = x.toJSON()

    return {
      ...json,
      ...data
    }
  }

  const storage = {
    set: async function(type, id, data) {
      let old = await this.get(type, id)
      let mm
      if (old && old.objectId) {
        mm = AV.Object.createWithoutData('Markme', old.objectId)
      } else {
        mm = new Markme()
      }

      mm.set('id', id)
      mm.set('ukey', options.key)
      mm.set('type', type)
      mm.set('data', data)

      send('highlight-add', { id, ...data })
      return mm.save()
    },
    get: async function(type, id) {
      const query = new AV.Query('Markme')
      query.equalTo('type', type)
      query.equalTo('id', id)
      query.equalTo('ukey', options.key)
      return (await query.find()).map(toJSON)[0]
    },
    remove: async function(type, id) {
      let data = await this.get(type, id)
      if (data.objectId) {
        send('highlight-remove', id)

        return AV.Query.doCloudQuery(
          `delete from Markme where objectId=${JSON.stringify(data.objectId)}`
        )
      }
    },
    getAll: async function(type) {
      const query = new AV.Query('Markme')
      query.equalTo('type', type)
      query.equalTo('ukey', options.key)
      return (await query.find()).map(toJSON)
    },
    getTotal: async function(type) {
      const query = new AV.Query('Markme')
      query.equalTo('type', type)
      return (await query.find()).map(toJSON)
    }
  }

  emitter
    .on('highlight-add', async ({ id, ...data }) => {
      console.warn('highlight-add')
      await storage.set('highlight', id, data)
    })
    .on('highlight-remove', async id => {
      storage.remove('highlight', id)
    })
    .on('highlight-change:words', async data => {
      console.warn('highlight-change:words')
      let old = await storage.get('highlight', data.id)
      if (old) {
        old.words = data.words
        await storage.set('highlight', data.id, old)
      }
    })
    .on('highlight-change:color', async data => {
      console.warn('highlight-change:color')
      let old = await storage.get('highlight', data.id)
      if (old) {
        old.color = data.color
        await storage.set('highlight', data.id, old)
      }
    })
    .on('highlight-match-fail', async id => {
      await storage.remove('highlight', id)
    })

  if (options.enableInitialFill) {
    let list = await storage.getAll('highlight')
    // if (!list || !list.length) {
    //   storage.set('null', 'null', null)
    // }
    emitter.highlight.fill(list)
  }

  return emitter
}
