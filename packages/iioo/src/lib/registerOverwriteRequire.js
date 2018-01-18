import overwrite from '../utils/overwriteRequire'
import paths from './paths'
import { join } from 'path'

export default () => {
  overwrite.unuse()
  overwrite.use([
    request => {
      if (/^\s*io(.*)/.test(request)) {
        return join(paths.root, RegExp.$1)
      }
    }
  ])
}
