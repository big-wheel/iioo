/**
 * @file: index
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */

import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import getWebpackConfig from './getWebpackConfig'
import normalizeOptions from './normalizeOptions'
import { inspect } from 'util'


function emitWebpackConfig(iioo, opts = []) {
  const webpackConfig = iioo.webpackConfig = opts.map(opt => {
    iioo.emit('getWebpackConfig.options', opt)
    const webpackConfig = getWebpackConfig(opt)
    iioo.emit('each-webpackConfig', webpackConfig, webpack)
    return webpackConfig
  })
  iioo.emit('this-webpackConfig', webpackConfig, webpack)

  return webpackConfig
}

function setUpWebpackServer(iioo, options = {}) {
  const webpackConfig = emitWebpackConfig(iioo, normalizeOptions(options, { dev: true }))
  // iioo.console.debug({ type: 'webpackConfig', message: inspect(webpackConfig, { depth: 5 }) })

  const { server } = iioo
  iioo.emit('before-webpackServer', server)
  const compiler = iioo.compiler = webpack(webpackConfig)
  iioo.emit('this-webpackCompiler', compiler)
  // TODO better cli performance
  const devMiddleware = iioo.devMiddleware = webpackDevMiddleware(compiler, {
    logLevel: iioo.options.logLevel !== 'debug' && (!iioo.options.silent ? 'warn' : 'silent'),
    stats: iioo.options.logLevel === 'debug' && {
      colors: true,
      context: process.cwd()
    },
    publicPath: options.publicPath
  })
  server.use(devMiddleware)
  const hotMiddleware = iioo.hotMiddleware = webpackHotMiddleware(compiler, { log: false })
  server.use(hotMiddleware)
  iioo.emit('after-webpackServer', server)
}

async function setUpWebpackBuilder(iioo, options = {}) {
  const webpackConfig = emitWebpackConfig(iioo, normalizeOptions(options, { dev: false }))

  iioo.emit('before-webpackBuilder')
  const compiler = iioo.compiler = webpack(webpackConfig)
  iioo.emit('this-webpackCompiler', compiler)

  return new Promise((resolve, reject) => {
    // ensure that log information before webpack cli progressBar
    setTimeout(() => {
      compiler.run((err, stats) => {
        if (err) {
          reject(err)
        } else {
          resolve(stats)
          iioo.emit('after-webpackBuilder', stats)
        }
      })
    }, 500)
  })

}

export default async function (iioo, options = {}) {
  if (options.dev) {
    return setUpWebpackServer(iioo, options)
  }
  return await setUpWebpackBuilder(iioo, options)
}
