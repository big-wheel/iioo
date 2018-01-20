/**
 * @file: calculateEntry
 * @author: Cuttle Cong
 * @date: 2018/1/20
 * @description:
 */
import { isArray, isObject, isString, isNullOrUndefined } from 'util'

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
 * @return {{refPath: string}}
 */
export function flatten(object) {
  return { 'refPath': object }
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
  return {}
}
