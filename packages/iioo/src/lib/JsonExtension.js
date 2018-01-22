/**
 * @file: JsonExtension
 * @author: Cuttle Cong
 * @date: 2018/1/20
 * @description:
 */
import { isArray, isObject, isPrimitive } from 'util'

function defaultIsAtomValue(value) {
  return !isObject(value)
}

/**
 * flatten the object
 * eg.
 *  input: { a: '[]', b: null, c: [1, 3, { a: 'io' }], d: {k: 123} }
 *  output: {
 *            a: '[]',
 *            b: null,
 *            'c.0': 1,
 *            'c.1': 3,
 *            'c.2.a': 'io',
 *            'd.k': 123
 *          }
 * @param object
 * @param isAtomValue :Function value => boolean
 *      check the value is atom value or not.
 *      atom value will not flatten continue,
 *      BTW: the primitive value is atom value in default case.
 * @return {{refPath: string}}
 */
export function flatten(obj, isAtomValue = defaultIsAtomValue) {
  if (!isObject(obj)) {
    throw new TypeError('flatten is require {}/[], but ' + typeof obj)
  }

  function _flatten(obj, isAtomValue, collections) {
    let temp, targetObj = {}
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      if (!isAtomValue(value)) {
        if (!isPrimitive(value)) {
          if (collections.indexOf(value) >= 0) {
            throw new Error('The object has circle reference, paths: ' + key)
          }
          collections.push(value)
        }
        temp = {}
        Object.keys(value).map(subKey => {
          temp[`${key}.${subKey}`] = value[subKey]
        })
        Object.assign(targetObj, _flatten(temp, isAtomValue, collections))
      } else {
        targetObj[key] = value
      }
    })

    return targetObj
  }

  return _flatten(obj, isAtomValue, [])
}

/**
 * the *reverse* process of flatten
 * NOTE: { '0': 'y', '1': 'x' } -> flatten -> summon -> [ 'y', 'x' ]
 * some error cases:
 *  case1. input is not {}
 *  case2. input is not shape of { 'refPath': value }
 * @param flattened
 * @return {{}}
 */
export function summon(flattened) {
  if (!isObject(flattened) || isArray(flattened)) {
    throw new TypeError('summon is require {}, but ' + typeof flattened)
  }


  function _summon(flattened) {
    if (!isObject(flattened)) {
      return flattened
    }
    let i, tempKey, subKey, obj = {}, needSummon = {}, arr = [], times = 0

    Object.keys(flattened).forEach(key => {
      tempKey = key
      i = key.indexOf('.')
      if (i !== -1) {
        tempKey = key.substring(0, i)
        subKey = key.substring(i + 1)

        obj[tempKey] = obj[tempKey] || {}
        obj[tempKey][subKey] = flattened[key]
        /* eslint-disable eqeqeq */
        if (parseInt(tempKey) == tempKey) {
          if (!needSummon[tempKey]) {
            times++
          }
          arr[+tempKey] = arr[+tempKey] || {}
          arr[+tempKey][subKey] = flattened[key]
        }

        needSummon[tempKey] = 1
      } else {
        obj[tempKey] = flattened[tempKey]
        if (parseInt(tempKey) == tempKey) {
          arr[+tempKey] = flattened[tempKey]
          times++
        }
      }

    })

    let isarr = false
    if (Object.keys(obj).length === times && times === arr.length) {
      isarr = true
      obj = arr
    }

    Object.keys(needSummon).forEach(key => {
      if (isarr) {
        key = +key
      }
      obj[key] = _summon(obj[key])
    })

    return obj
  }

  return _summon(flattened)
}
