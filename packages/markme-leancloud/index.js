/**
 * @file remoteStorage
 * @author Cuttle Cong
 * @date 2018/5/6
 * @description
 */

import * as AV from 'leancloud-storage'
import { Realtime, TextMessage } from 'leancloud-realtime'
// TODO
import mark from '/Users/yucong02/self/iioo-repo/packages/markme/index'

export default async function markInLocalStorage(element, options = {}) {
  options = {
    enableInitialFill: true,
    // clientId: Date.now() + '',
    clientId: location.hash,
    key: location.origin + location.pathname,
    AVOptions: {},
    ...options
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
    console.log(
      '[me] received a message from [' + message.from + ']: ' + message.text
    )
    // 收到消息之后一般的做法是做 UI 展现，示例代码在此处做消息回复，仅为了演示收到消息之后的操作，仅供参考。
    conversation.send(
      new TextMessage(
        'Tom，我在 Jerry 家，你跟 Harry 什么时候过来？还有 William 和你在一起么？'
      )
    )
  })

  // conversation = await me.getConversation(conversation.id)
  await conversation.add([me.id, '#xxxooo'])
  // await conversation.join()
  await conversation.send(new TextMessage('耗子，起床！'))
  conversation
    .count()
    .then(function(count) {
      console.log('在线人数: ' + count)
    })
    .catch(console.error.bind(console))

  var query = me.getQuery()
  console.warn(me, conversation)
  query
    .equalTo('topic', 'MarkmeLeancloud')
    .equalTo('tr', true)
    .find()
    .then(function(conversations) {
      console.log('conversations', conversations)
    })
    .catch(console.error.bind(console))

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
      await storage.set('highlight', id, data)
    })
    .on('highlight-remove', async id => {
      storage.remove('highlight', id)
    })
    .on('highlight-change:words', async data => {
      let old = await storage.get('highlight', data.id)
      if (old) {
        old.words = data.words
        await storage.set('highlight', data.id, old)
      }
    })
    .on('highlight-change:color', async data => {
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
    let list = await storage.getTotal('highlight')
    if (!list || !list.length) {
      storage.set('null', 'null', null)
    }
    emitter.highlight.fill(list)
  }

  return emitter
}
