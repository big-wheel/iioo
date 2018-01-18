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

import createServer from './lib/createServer'
// import FSWatcher from './lib/Watcher/FSWatcher'
import presetPlugin from './presetPlugin'
import setUpWebpack from './lib/setUpWebpack'
import getPluginHelper from './lib/getPluginHelper'
import paths from './lib/paths'
import renderer from './lib/wrapRenderTemplate'
import assign from './utils/assign'
import { version } from '../package.json'

import resolvePlugin from './utils/resolvePlugin'

export default class Hawkeyee extends EventEmitter {
  options = {
    silent: false,
    port: 3666,
    // move the watcher to external plugin
    // watcher: new FSWatcher(),
    plugins: [presetPlugin],
    level: 'debug',
    output: {
      publicPath: '',
      path: ''
    },
    template: join(paths.src, 'template.html'),
    entry: join(paths.client, 'sample-entry.js')
  }

  constructor(options = {}) {
    super()
    assign(this.options, options, {
      output: assign({}, this.options.output, options.output),
      // append the customized plugin
      plugins: this.options.plugins.concat(options.plugins).filter(Boolean)
    })
    this.checkOptions()

    // this.options.watcher = resolveRequest(this.options.watcher, { prefix: 'hawkeyee-watcher-' })

    this.hash = this.options.hash = this.options.hash || version
    this._init()
  }

  _init() {
    this.console = bole('Hawkeyee')
    this.registerPlugins()
    this.emit('this-options', this.options)
  }

  // TODO
  checkOptions() {
  }

  registerPlugins() {
    // calculate helper for plugin developer
    this.helper = getPluginHelper(this)

    this.options.plugins = this.options.plugins.map(plugin => {
      const resolvedPlugin = resolvePlugin(plugin)
      resolvedPlugin[0].call(this, resolvedPlugin[1])
      return resolvedPlugin
    })
  }

  async start() {
    this.emit('before-createServer')
    try {
      this.server = await createServer(this.options.port)
      this.io = socketio(this.server.__server)
    } catch (error) {
      this.emit('error', error)
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
      function bye(data) {
        resolve(data)
        this.emit('after-close')
      }
      if (this.server/* || this.compiler*/) {
        this.server && this.server.__server.close(bye)
        this.io && this.io.close(bye)
        delete this.server
        delete this.io

        // if (this.compiler && this.compiler.close) {
        //   this.compiler.close(resolve)
        //   delete this.compiler
        // }
      }
      else {
        bye()
      }
    })

  }

  clearRuntime() {
    del.sync(join(paths.client, `*.${this.hash}.js`), { force: true })
  }

  renderClientFile() {
    // todo > entry
    renderer.entry(
      { version, entry: resolve(this.options.entry) },
      join(paths.client, `entry.${this.hash}.js`)
    )
  }

  _initWebpackEnv() {
    this.renderClientFile()
  }

  async setUpWebpack(options) {
    this._initWebpackEnv()

    options = {
      ...options,
      ...this.options.output,
      template: this.options.template,
      entry: {
        app: [join(paths.client, `entry.${this.hash}.js`)]
      }
    }
    try {
      return await setUpWebpack(this, options)
    } catch (error) {
      this.emit('error', error)
    }
  }
}
