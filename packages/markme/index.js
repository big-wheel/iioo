/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
const highlight = require('./plugins/highlight/index')
const badge = require('./plugins/badge/index')
const AwaitEventEmitter = require('await-event-emitter')

const isBrowser = typeof document !== 'undefined'

const plugins = {
  highlight: highlight,
  badge: badge
}

function run(func, message, ...args) {
  try {
    func.apply(this, args)
  } catch (e) {
    console.error(message, e.toString())
  }
}

function registerCommonMethod(ctx, methodName, plugins = []) {
  ctx[methodName] = function () {
    plugins.forEach(pluginName => {
      if (ctx[pluginName] && ctx[pluginName][methodName]) {
        ctx[pluginName][methodName].apply(ctx[pluginName], arguments)
      }
    })
  }
}

module.exports = function(element, options = {}) {
  if (!isBrowser) {
    throw new Error('mark should be used in browser environment.')
  }
  options = {
    enablePlugins: ['highlight', 'badge'],
    ...options,
    highlight: {
      disableDefaultClick: true,
      ...options.highlight
    }
  }
  const { enablePlugins, ...restOptions } = options

  const ctx = new AwaitEventEmitter()
  ctx.opt = options
  ctx.addButton = function({ title, icon, action } = {}) {}

  enablePlugins.forEach(plugin => {
    if (plugins[plugin]) {
      run.call(ctx, highlight, plugin, element, restOptions)
    }
  })

  registerCommonMethod(ctx, 'exit', enablePlugins)
  registerCommonMethod(ctx, 'remove', enablePlugins)
  // registerCommonMethod(ctx, 'fill', enablePlugins)

  return ctx
}
