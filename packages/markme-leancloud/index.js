/**
 * @file remoteStorage
 * @author Cuttle Cong
 * @date 2018/5/6
 * @description
 */

import AV from 'leancloud-storage'
import mark from 'markme'

export default function markInLocalStorage(element, options = {}) {
  options = {
    enableInitialFill: true,
    key: location.origin + location.pathname,
    AVOptions: {},
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

  if (options.enableInitialFill) {
    storage.getAll('highlight').then(list => {
      // if (!list || !list.length) {
      //   storage.set('null', 'null', null)
      // }
      emitter.highlight.fill(list)
    })
  }

  return emitter
    .on('highlight-add', async ({ id, ...data }) => {
      await storage.set('highlight', id, data)
    })
    .on('highlight-remove', async id => {
      await storage.remove('highlight', id)
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
}
