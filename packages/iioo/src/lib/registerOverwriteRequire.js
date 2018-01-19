import overwrite from '../utils/overwriteRequire'
import paths from './paths'
import { join } from 'path'

export default (rules = []) => {
  overwrite.unuse()
  overwrite.use(rules.concat(
    [
      paths.root,
      request => {
        if (/^\s*iioo(.*)/.test(request)) {
          return require.resolve(join(paths.root, RegExp.$1))
        }
      }
    ]
  ))
}
