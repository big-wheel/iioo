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
import { isArray, isString, inherits } from 'util'

import createServer from './lib/createServer'
import presetPlugin from './presetPlugin'
import setUpWebpack from './lib/setUpWebpack'
import getPluginHelper from './lib/getPluginHelper'
import paths from './lib/paths'
import renderer from './lib/wrapRenderTemplate'
import getConfigFilename from './lib/getConfigFilename'
import assign from './utils/assign'
import { version } from '../package.json'
import registerLifeCircle from './lib/registerLifeCircle'

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
    lifeCircle: {},
    template: join(paths.src, 'template.html'),
    entry: join(paths.client, 'sample-entry.js'),
    noiioo: false
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

    // resolve entry to {}
    // even this.options.entry is {} or [] or string
    let entry = mapShallow(this.options.entry, source => resolvePluginString(source, { prefix: 'iioo-app-' }))
    if (isArray(entry)) {
      const collection = {}
      entry.forEach((eachEntry, index) => {
        if (isString(eachEntry)) {
          collection[index] = eachEntry
        }
      })
      entry = collection
    } else if (isString(entry)) {
      entry = { 'app': resolvePluginString(entry, { prefix: 'iioo-app-' }) }
    }
    this.options.entry = entry

    this.hash = this.options.hash = this.options.hash || version
    this.cwd = this.options.cwd

    this._init()
  }

  _init() {
    // use it in bin `registerOverwriteRequire()`
    // not here, case the operation make `new IIOO()` have global's side effect
    // registerOverwriteRequire()
    this.registerPlugins()
    // the priority is most
    this.registerLifeCircle()
    this.emit('this-options', this.options)
  }

  // TODO
  checkOptions(options) {
  }

  registerPlugins() {
    // calculate helper for plugin developer
    this.helper = getPluginHelper(this)

    this.options.plugins = this.options.plugins.map(plugin => {
      const resolvedPlugin = resolvePlugin(plugin, { prefix: 'iioo-plugin-' })
      resolvedPlugin[0].call(this, resolvedPlugin[1])
      return resolvedPlugin
    })
  }

  registerLifeCircle() {
    registerLifeCircle(this, this.options.lifeCircle)
  }

  async start() {
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
    return resolve(this.cwd, ...pathList)
  }

  clearRuntime() {
    del.sync(join(paths.client, `*.${this.hash}.js`), { force: true })
  }


  getEntryFilesEntity() {
    return Object.keys(this.options.entry)
      .map(key => ({
        path: this.resolve(this.options.entry[key]),
        key
      }))
  }
  renderClientFile() {
    this.getEntryFilesEntity()
      .forEach(({ key, path }) => {
        renderer.entry(
          { version, entry: this.resolve(path) },
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

    const entry = {}
    this.getEntryFilesEntity()
      .forEach(({ key }) => {
        let path = join(paths.client, `entry.${key}.${this.hash}.js`)
        entry[key] = path
      })
    this.console.debug({ type: 'entry', message: entry })

    options = {
      ...options,
      ...this.options.output,
      cwd: this.options.cwd,
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
