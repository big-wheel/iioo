/**
 * @file: registerLifeCircle
 * @author: Cuttle Cong
 * @date: 2018/1/19
 * @description:
 */
import { isObject, isArray, isFunction } from 'util'

function understandKeyString(keyString) {
  let method = 'on'
  let event = keyString.replace(/^(.*)#/, (_, $1) => {
    if ($1) {
      method = $1
    }
    return ''
  })

  return [method, event]
}

export default function registerLifeCircle(iioo, lifeCircle = {}) {
  if (isObject(lifeCircle)) {
    Object.keys(lifeCircle)
      .forEach(name => {
        const [method, event] = understandKeyString(name)
        if (!isFunction(iioo[method])) {
          const error = new Error(`lifeCircle the string of key should be \`${method}#${event}\`. iioo['${method}'] is ${typeof iioo[method]}`)
          iioo.emit(error)
          throw error
        }

        const queue = isArray(lifeCircle[name]) ? lifeCircle[name] : [lifeCircle[name]]
        queue.forEach(listener => {
          if (isFunction(listener)) {
            iioo.console.debug({ type: 'lifeCircle', message: `register: iioo['${method}']` })
            iioo[method](event, listener.bind(iioo))
          }
        })
      })
  }
}
