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

function setUpWebpackServer(iioo, options = {}) {
  const opts = {
    cwd: options.cwd,
    dev: true,
    template: options.template,
    hash: false,
    path: options.path,
    publicPath: options.publicPath,
    entry: options.entry
  }
  iioo.emit('getWebpackConfig.options', opts)
  const webpackConfig = iioo.webpackConfig = getWebpackConfig(opts)
  const { server } = iioo
  iioo.emit('this-webpackConfig', webpackConfig, webpack)

  iioo.emit('before-webpackServer', server)
  const compiler = iioo.compiler = webpack(webpackConfig)
  iioo.emit('this-webpackCompiler', compiler)
  // TODO better cli performance
  const devMiddleware = iioo.devMiddleware = webpackDevMiddleware(compiler, {
    logLevel: !iioo.options.silent ? 'warn' : 'silent',
    // stats: false,
    publicPath: webpackConfig.output.publicPath
  })
  server.use(devMiddleware)
  const hotMiddleware = iioo.hotMiddleware = webpackHotMiddleware(compiler, { log: false })
  server.use(hotMiddleware)
  iioo.emit('after-webpackServer', server)
}

async function setUpWebpackBuilder(iioo, options = {}) {
  const opts = {
    cwd: options.cwd,
    dev: false,
    template: options.template,
    hash: false,
    path: options.path,
    publicPath: options.publicPath,
    entry: options.entry
  }
  iioo.emit('getWebpackConfig.options', opts)
  const webpackConfig = iioo.webpackConfig = getWebpackConfig(opts)
  iioo.emit('this-webpackConfig', webpackConfig, webpack)
  iioo.emit('before-webpackBuilder')
  const compiler = iioo.compiler = webpack(webpackConfig)
  iioo.emit('this-webpackCompiler', compiler)

  return new Promise((resolve, reject) => {
    // setTimeout for log some information before webpack cli progressBar
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
