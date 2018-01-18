/**
 * @file: mapShallow
 * @author: Cuttle Cong
 * @date: 2018/1/18
 * @description:
 */
import { isArray, isObject, isFunction, isUndefined } from 'util'

export default function mapShallow(source, track) {
  if (!isFunction(track)) {
    throw new TypeError('walkShallow: track is required a function, not ' + typeof track)
  }

  function mapToNewValue(previous, index, all) {
    const newValue = track(previous, index, all)
    if (isUndefined(newValue)) {
      return previous
    }
    return newValue
  }

  if (isArray(source)) {
    source.map(mapToNewValue)
  } else if (isObject(source)) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        source[key] = mapToNewValue(source[key], key, source)
      }
    }
  }

  return source
}
