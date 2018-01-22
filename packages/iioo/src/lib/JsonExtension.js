/**
 * @file: JsonExtension
 * @author: Cuttle Cong
 * @date: 2018/1/20
 * @description:
 */
import { isArray, isNumber, isObject, isString, isNullOrUndefined } from 'util'

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
  let temp, targetObj = {}

  Object.keys(obj).map(key => {
    const value = obj[key]
    if (!isAtomValue(value)) {
      temp = {}
      Object.keys(value).map((subKey) => {
        temp[`${key}.${subKey}`] = value[subKey]
      })
      Object.assign(targetObj, flatten(temp, isAtomValue))
    } else {
      targetObj[key] = value
    }
  })

  return targetObj
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
  if(!isObject(flattened)) {
    throw new TypeError('summon is require {}/[], but ' + typeof flattened)
  }
  let i, tempKey, obj = {}

  Object.keys(flattened).map((key) => {
    i = key.indexOf('.')
    if(i !== -1) {
      tempKey = key.substring(0, i)
      obj[tempKey] = obj[tempKey] ? obj[tempKey] : {}
      obj[tempKey][key.substring(i + 1)] = flattened[key]
    } else {
      obj[key] = flattened[key]
    }
  })
  for(let key in obj){
    if (isObject(obj[key])) {
      obj[key] = summon(obj[key])
    }
  }
  // to Array
  if(Object.keys(obj).every(isNumber)) {
    let arr = []
    for(let key in obj) {
      arr[key] = obj[key]
    }
    obj = arr
  }
  return obj
}
