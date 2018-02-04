/**
 * @file: normalizeOptions
 * @author: Cuttle Cong
 * @date: 2018/1/20
 * @description:
 */
import { isArray, isObject } from 'util'
import { resolve } from 'path'
import mapShallow from '../../utils/mapShallow'

export default function normalizeOptions(options, ...optionsList) {
  const mixed = Object.assign({}, {
    cwd: options.cwd,
    // string | array (multi-entry)
    template: options.template,
    hash: false,
    path: options.path,
    name: options.name || 'index',
    publicPath: options.publicPath,
    entry: options.entry
  }, ...optionsList)

  // if entry's shape like { app: '...', appX: ['...'] }
  // will use multi-compiler to split the page
  //   - app/index.html
  //   - appX/index.html
  if (isObject(mixed.entry) && !isArray(mixed.entry)) {
    let optionsList = []
    let index = 0
    mapShallow(mixed.entry, (value, name) => {
      let template
      if (isArray(mixed.template)) {
        if (!mixed.template[index]) {
          template = mixed.template[mixed.template.length - 1]
        }
        else {
          template = mixed.template[index]
        }
      }
      else {
        template = mixed.template
      }

      optionsList = optionsList.concat(
        normalizeOptions({
          ...mixed,
          entry: value,
          name,

          // can't use different path, cause webpack-dev-middleware broken
          // path: resolve(mixed.path, name),
          template
        })
      )
      index++
    })

    return optionsList
  }

  return [mixed]
}
