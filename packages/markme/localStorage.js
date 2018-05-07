/**
 * @file localStorage
 * @author Cuttle Cong
 * @date 2018/5/6
 * @description
 */
import mark from './'

export default function markInLocalStorage(element, options = {}) {
  options = {
    enableInitialFill: true,
    ...options
  }
  const emitter = mark(element, options)

  const storage = {
    set(type, id, data) {
      localStorage.setItem(
        `markLocalStorage_${type}_${id}`,
        JSON.stringify(data)
      )
      return true
    },
    get(type, id) {
      let str = localStorage.getItem(`markLocalStorage_${type}_${id}`)
      if (str) {
        return { id, ...JSON.parse(str) }
      }
      return null
    },
    keys(type) {
      let prefix = 'markLocalStorage_' + (type || '')

      return Object.keys(localStorage)
        .filter(x => x.startsWith(prefix))
        .map(x => {
          let matched = x.match(/^markLocalStorage_(.+?)_(.+)$/)
          return {
            type: matched[1],
            id: matched[2]
          }
        })
    },
    remove(type, id) {
      if (typeof type === 'undefined') {
        return this.keys().forEach(({ id, type }) => this.remove(type, id))
      }
      if (typeof id === 'undefined') {
        return this.keys(type).forEach(({ id, type }) => this.remove(type, id))
      }
      localStorage.removeItem(`markLocalStorage_${type}_${id}`)
    },
    getAll(type) {
      return this.keys(type).map(({ id, type }) => this.get(type, id))
    }
  }

  emitter
    .on('highlight-add', ({ id, ...data }) => {
      storage.set('highlight', id, data)
    })
    .on('highlight-remove', async id => {
      storage.remove('highlight', id)
    })
    .on('highlight-change:words', async data => {
      let old = storage.get('highlight', data.id)
      if (old) {
        old.words = data.words
        storage.set('highlight', data.id, old)
      }
    })
    .on('highlight-change:color', async data => {
      let old = storage.get('highlight', data.id)
      if (old) {
        old.color = data.color
        storage.set('highlight', data.id, old)
      }
    })
    .on('highlight-match-fail', id => {
      storage.remove('highlight', id)
    })

  if (options.enableInitialFill) {
    emitter.highlight.fill(storage.getAll('highlight'))
  }

  return emitter
}
