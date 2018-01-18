/**
 * @file: Watcher
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import EventEmitter from 'events'


export default class Watcher extends EventEmitter {
  _options = {}

  constructor(options = {}) {
    super()
    Object.assign(this._options, options)
  }

  add() {}

  unwatch() {}

  close() {}
}
