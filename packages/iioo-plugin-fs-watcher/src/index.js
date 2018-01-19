/**
 * @file: index
 * @author: Cuttle Cong
 * @date: 2018/1/18
 * @description:
 */
import FSWatcher from './Watcher/FSWatcher'
import { Router } from 'iioo/express'

export default function ({ paths }) {
  if (!paths) {
    this.console.error('fs-watcher: paths is required, but `' + paths + '`')
    return
  }

  this
    .on('before-createServer', () => {
      this.watcher = new FSWatcher({
        cwd: this.cwd
      }).add(paths)
      this.console.debug('iioo-plugin-fs-watcher: emit-watcher')
      this.emit('iioo-plugin-fs-watcher-emit-watcher', this.watcher)
    })
    .on('after-close', () => {
      this.watcher && this.watcher.close()
      delete this.watcher
    })
}
