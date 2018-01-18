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

function setUpWebpackServer(hawkeyee, options = {}) {
  const opts = {
    dev: true,
    template: options.template,
    hash: false,
    path: options.path,
    publicPath: options.publicPath,
    entry: options.entry
  }
  hawkeyee.emit('getWebpackConfig.options', opts)
  const webpackConfig = hawkeyee.webpackConfig = getWebpackConfig(opts)
  const { server } = hawkeyee
  hawkeyee.emit('this-webpackConfig', webpackConfig, webpack)

  hawkeyee.emit('before-webpackServer', server)
  const compiler = hawkeyee.compiler = webpack(webpackConfig)
  hawkeyee.emit('this-webpackCompiler', compiler)
  // TODO better cli performance
  server.use(webpackDevMiddleware(compiler, {
    logLevel: !hawkeyee.options.silent ? 'warn' : 'silent',
    // stats: false,
    publicPath: webpackConfig.output.publicPath
  }))
  server.use(webpackHotMiddleware(compiler, {
    log: false
  }))
  hawkeyee.emit('after-webpackServer', server)
}

async function setUpWebpackBuilder(hawkeyee, options = {}) {
  const opts = {
    dev: false,
    template: options.template,
    hash: false,
    path: options.path,
    publicPath: options.publicPath,
    entry: options.entry
  }
  hawkeyee.emit('getWebpackConfig.options', opts)
  const webpackConfig = hawkeyee.webpackConfig = getWebpackConfig(opts)
  hawkeyee.emit('this-webpackConfig', webpackConfig, webpack)
  hawkeyee.emit('before-webpackBuilder')
  const compiler = hawkeyee.compiler = webpack(webpackConfig)
  hawkeyee.emit('this-webpackCompiler', compiler)

  return new Promise((resolve, reject) => {
    // setTimeout for log some information before webpack cli progressBar
    setTimeout(() => {
      compiler.run((err, stats) => {
        if (err) {
          reject(err)
        } else {
          resolve(stats)
          hawkeyee.emit('after-webpackBuilder', stats)
        }
      })
    }, 500)
  })

}

export default async function (hawkeyee, options = {}) {
  if (options.dev) {
    return setUpWebpackServer(hawkeyee, options)
  }
  return await setUpWebpackBuilder(hawkeyee, options)
}
