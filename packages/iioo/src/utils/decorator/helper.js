/**
 * @file: helper
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */

export function isInvokeClass() {
  return typeof arguments[0] === 'function' && arguments.length === 1
}

export function isInvokeMember() {
  return typeof arguments[0] === 'object'
    && typeof arguments[1] === 'string'
    && typeof arguments[2] === 'object'
    && arguments.length === 3
}

export function isInvokeMemberMethod(target, key) {
  return isInvokeMember.apply(null, arguments) && typeof target[key] === 'function'
}

export function getKeys(target) {
  // (Using reflect to get all keys including symbols)
  let keys = []
  // Use Reflect if exists
  if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
    keys = Reflect.ownKeys(target.prototype)
  } else {
    keys = Object.getOwnPropertyNames(target.prototype)
    // use symbols if support is provided
    if (typeof Object.getOwnPropertySymbols === 'function') {
      keys = keys.concat(Object.getOwnPropertySymbols(target.prototype))
    }
  }

  return keys
}

export function getInvokeByClass(
  filterKey = () => true,
  invokeByMethod
) {
  return function (target) {
    getKeys(target)
      .filter(filterKey)
      .forEach(key => {
        let descriptor = Object.getOwnPropertyDescriptor(target.prototype, key)
        Object.defineProperty(
          target.prototype,
          key,
          invokeByMethod(target.prototype, key, descriptor)
        )
      })

    return target
  }
}
