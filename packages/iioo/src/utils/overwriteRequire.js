/**
 * @file: overwriteRequire
 * @author: Cuttle Cong
 * @date: 2018/1/18
 * @description:
 */
import Module from 'module'
import resolve from 'resolve'
import nps from 'path'
import unique from 'array-unique'

const _resolveFilename = Module._resolveFilename

export default {
  use(rules = []) {
    if (_resolveFilename === Module._resolveFilename) {
      rules = unique(rules)

      Module._resolveFilename = function (request, parent) {
        if (resolve.isCore(request)) {
          return _resolveFilename.apply(this, arguments)
        }

        const dirname = nps.dirname(parent.filename)
        try {
          return resolve.sync(request, { basedir: dirname })
        } catch (ex) {
          let path = ''
          let isFound = rules.some(function (rule) {
            try {
              if (typeof rule === 'string') {
                path = resolve.sync(request, { basedir: rule })
              }
              else if (typeof rule === 'function') {
                path = rule(request, parent)
              }
              return !!path
            // eslint-disable-next-line no-empty
            } catch (ex) {

            }
          })
          if (isFound) {
            return path
          }
          return _resolveFilename.apply(this, arguments)
        }
      }
    }
  },

  unuse() {
    Module._resolveFilename = _resolveFilename
  }
}
