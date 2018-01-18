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
  }

  this
    .on('this-server', server => {
      this.watcher = new FSWatcher().add(paths)

      server.use()
    })
    .on('after-close', () => {
      this.watcher && this.watcher.close()
      delete this.watcher
    })
}
