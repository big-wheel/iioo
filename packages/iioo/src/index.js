/**
 * @file: index
 * @author: Cuttle Cong
 * @date: 2018/1/16
 * @description:
 */
import EventEmitter from 'events'
import socketio from 'socket.io'
import bole from 'bole'
import del from 'del'
import { resolve, join } from 'path'
import { isArray, isString, inherits, isObject } from 'util'

import createServer from './lib/createServer'
import presetPlugin from './presetPlugin'
import setUpWebpack from './lib/setUpWebpack'
import getPluginHelper from './lib/getPluginHelper'
import paths from './lib/paths'
import renderer from './lib/wrapRenderTemplate'
import getConfigFilename from './lib/getConfigFilename'
import assign from './utils/assign'
import { toUriPath, escapeWinPath } from './utils/path'
import { version } from '../package.json'
import registerLifeCycle from './lib/registerLifeCycle'
import { flatten } from './lib/JsonExtension'

import resolvePlugin, { resolvePluginString } from './utils/resolvePlugin'
import mapShallow from './utils/mapShallow'

class IIOO extends EventEmitter {
  static defaultOptions = {
    silent: false,
    port: 3666,
    // move the watcher to external plugin
    // watcher: new FSWatcher(),
    plugins: [presetPlugin],
    logLevel: 'info',
    cwd: process.cwd(),
    output: {
      publicPath: '',
      path: './public'
    },
    lifeCycle: {},
    template: join(paths.src, 'template.html'),
    entry: join(paths.client, 'sample-entry.js'),
    noiioo: false,
    force: false
  }

  // `new IIOO()` trigger initialize cwd
  options = {
    cwd: process.cwd()
  }

  assignOptions(options = {}) {
    this.options = assign({}, IIOO.defaultOptions, this.options, options, {
      output: assign({}, IIOO.defaultOptions.output, this.options.output, options.output),
      // append the customized plugin
      plugins: IIOO.defaultOptions.plugins.concat(options.plugins).filter(Boolean)
    })

    return this.options
  }

  constructor(options = {}) {
    super()
    this.console = bole('iioo')
    this.checkOptions(options)
    this.assignOptions(options)

    // use iioo config file
    if (!this.options.noiioo) {
      let filename = getConfigFilename({ chdir: false, throwError: false, cwd: this.options.cwd })
      if (filename) {
        this.console.debug({ type: 'iioo-config-file', message: filename })
        this.assignOptions(require(filename))
      }
    }

    // resolve entry
    // even this.options.entry is {} or [] or string
    let entry = mapShallow(this.options.entry, source =>
      isString(source)
        ? resolvePluginString(source, {
          prefix: 'iioo-app-', cwd: this.cwd
        })
        : source
    )
    if (isArray(entry)) {
      entry = entry.filter(isString)
    } else if (isString(entry)) {
      entry = [resolvePluginString(entry, { prefix: 'iioo-app-', cwd: this.cwd })]
    }
    this.options.entry = entry

    this.hash = this.options.hash = this.options.hash || version
    this.cwd = this.options.cwd
    if (this.options.output) {
      this.options.output.path = this.resolve(this.options.output.path)
    }

    this._init()
  }

  _init() {
    // Use it in bin `registerOverwriteRequire()` not here.
    // The cause is the operation making `new IIOO()` have a global's side effect.
    // registerOverwriteRequire()
    this.registerPlugins()
    // the priority is most
    this.registerLifeCycle()
    this.emit('this-options', this.options)
  }

  // TODO
  checkOptions(options) {
  }

  registerPlugins() {
    // calculate helper for plugin developer
    this.helper = getPluginHelper(this)

    this.options.plugins = this.options.plugins.map(plugin => {
      this.console.debug(JSON.stringify(plugin))
      const resolvedPlugin = resolvePlugin(plugin, { prefix: 'iioo-plugin-', cwd: this.cwd })
      resolvedPlugin[0].call(this, resolvedPlugin[1])
      return resolvedPlugin
    })
  }

  registerLifeCycle() {
    registerLifeCycle(this, this.options.lifeCycle)
  }

  _clearBuildPath() {
    if (this.options.force && this.options.output.path) {
      this.emit('before-delete-build-assert')
      del.sync([
        join(this.options.output.path, '*'),
        // ignore .git
        `!${join(this.options.output.path, '.git')}`
      ], { force: true })
      this.emit('after-delete-build-assert')
    }
  }

  async start() {
    this.mode = 'dev'
    this.emit('before-createServer')
    try {
      this.server = await createServer(this.options.port)
      this.io = socketio(this.server.__server)
    } catch (error) {
      this.emit('error', error)
      throw error
    }

    this.emit('this-server', this.server)
    this.emit('this-io', this.io)
    this.emit('after-createServer')

    await this.setUpWebpack({ dev: true })
  }

  async build() {
    this.mode = 'prod'
    this._clearBuildPath()
    await this.setUpWebpack({ dev: false })
  }

  async close() {
    this.emit('before-close')
    return new Promise(resolve => {
      const bye = data => {
        resolve(data)
        this.emit('after-close')
      }
      if (this.server) {
        this.server && this.server.__server.close(bye)
        this.io && this.io.close(bye)
        delete this.server
        delete this.io
      }
      else {
        bye()
      }
    })

  }

  resolve(...pathList) {
    return resolve(this.cwd, ...pathList.filter(Boolean))
  }

  clearRuntime() {
    del.sync(join(paths.client, `entry*.${this.hash}.js`), { force: true })
  }

  _getEntryList(entry, prefix = '') {
    let array
    if (isString(entry)) {
      array = [entry]
    }
    if (isArray(array)) {
      array = entry
    }

    return array.map((path, i) => (
      { key: prefix + i, path: this.resolve(path) }
    ))
  }

  getEntry() {
    let entry = this.options.entry
    if (isObject(entry) && !isArray(entry)) {
      let flattened = flatten(entry, value => !isObject(value) || isArray(value))
      const computed = {}
      mapShallow(flattened, (value, key) => {
        computed[key] = value
      })
      return computed
    }
    return entry
  }

  renderClientFile() {
    const entryObj = this.getEntry()
    mapShallow(entryObj, (value, key) => {
      renderer.entry(
        {
          version,
          entryList: [].concat(value).map(
            path => toUriPath(escapeWinPath(this.resolve(path)))
          )
        },
        join(paths.client, `entry.${key}.${this.hash}.js`)
      )
    })
  }

  _initWebpackEnv() {
    this.renderClientFile()
  }

  async setUpWebpack(options) {
    this.emit('before-setUpWebpack')
    this._initWebpackEnv()
    let entry = this.getEntry()
    if (isArray(entry)) {
      entry = join(paths.client, `entry.${0}.${this.hash}.js`)
    }
    else {
      mapShallow(entry, (value, key) => {
        return join(paths.client, `entry.${key}.${this.hash}.js`)
      })
    }
    this.console.debug({ type: 'entry', message: JSON.stringify(entry, null, 2) })

    options = {
      ...options,
      ...this.options.output,
      cwd: this.cwd,
      // name: 'iioo',
      template: this.options.template,
      entry
    }
    try {
      let tmp = await setUpWebpack(this, options)
      this.emit('after-setUpWebpack')
      return tmp
    } catch (error) {
      this.emit('error', error)
    }
  }
}

function iioo(options) {
  if (!(this instanceof IIOO)) {
    return new iioo(options)
  }
  IIOO.call(this, options)
}

inherits(iioo, IIOO)

module.exports = iioo
module.exports.IIOO = IIOO
