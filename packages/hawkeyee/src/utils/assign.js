/**
 * @file: assign
 * @author: Cuttle Cong
 * @date: 2018/1/18
 * @description:
 */
import { isUndefined } from 'util'

export default function assign(source, ...argvs) {
  argvs.forEach(
    item => {
      if (!item) {
        return
      }
      for (let key in item) {
        if (item.hasOwnProperty(key) && !isUndefined(item[key])) {
          source[key] = item[key]
        }
      }
    }
  )
  return source
}
