/* eslint-disable indent,no-use-before-define */
/**
 * @file remoteStorage
 * @author Cuttle Cong
 * @date 2018/5/6
 * @description
 */

import AV from 'leancloud-storage/live-query'
import mark from 'markme'

export default async function markLeancloud(element, options = {}) {
  options = {
    enableInitialFill: true,
    key: location.origin + location.pathname,
    AVOptions: {},
    enableLiveQuery: true,
    ...options
  }
  // AV.
  AV.applicationId = null
  AV.init(options.AVOptions)

  const Markme = AV.Object.extend('Markme')

  const emitter = mark(element, options)
  function toJSON(x) {
    let { data, ...json } = x.toJSON()

    return {
      ...json,
      ...data
    }
  }

  const runtime = {}
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
      runtime.set = true
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
        // console.error('remove', id)
        // console.trace()
        let rlt = AV.Query.doCloudQuery(
          `delete from Markme where objectId=${JSON.stringify(data.objectId)}`
        )
        runtime.rm = true
        return rlt
      }
    },
    getLiveQuery(type) {
      const query = new AV.Query('Markme')
      query.equalTo('type', type)
      query.equalTo('ukey', options.key)
      return query
    },
    getAll: async function(type) {
      const query = this.getLiveQuery(type)
      return (await query.find()).map(toJSON)
    },
    getTotal: async function(type) {
      const query = new AV.Query('Markme')
      query.equalTo('type', type)
      return (await query.find()).map(toJSON)
    }
  }

  // LiveQuery
  if (options.enableLiveQuery) {
    const query = storage.getLiveQuery('highlight')
    const liveQuery = await query.subscribe()
    liveQuery
      .on('create', created => {
        created = created.toJSON()
        // console.log('create', runtime, created.id, created.data)
        if (runtime.set) {
          delete runtime.set
          return
        }
        created.id &&
          created.data &&
          emitter.highlight.fill(
            { id: created.id, ...created.data }
          )
      })
      .on('update', updated => {
        updated = updated.toJSON()
        // console.log('update', runtime, updated.id)
        // 自己修改也会触发
        if (runtime.set) {
          delete runtime.set
          return
        }
        // console.log('updated', updated)
        const { words, color } = updated.data || {}
        updated.id && emitter.highlight.change(updated.id, { color, words })
      })
      .on('delete', deleted => {
        deleted = deleted.toJSON()
        // console.log('delete', runtime, deleted.id, deleted.data)
        if (runtime.rm) {
          delete runtime.rm
          return
        }
        // console.log('deleted', deleted)
        emitter.highlight.remove(deleted.id)
      })
  }

  emitter
    .on('highlight-add', async ({ id, ...data }) => {
      console.warn('highlight-add')
      await storage.set('highlight', id, data)
    })
    .on('highlight-remove', async id => {
      console.warn('highlight-remove')
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
      // console.warn('highlight-match-fail')
      // await storage.remove('highlight', id)
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
