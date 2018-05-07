/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
import highlight from './plugins/highlight/index'
import badge from './plugins/badge/index'
import AwaitEventEmitter from 'await-event-emitter'
import styleText from './plugins/highlight/style'

const isBrowser = typeof document !== 'undefined'

const plugins = {
  highlight: highlight,
  badge: badge
}

function run(func, message, ...args) {
  try {
    func.apply(this, args)
  } catch (e) {
    console.error(message, e)
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

export default function mark(element, options = {}) {
  if (!isBrowser) {
    throw new Error('mark should be used in browser environment.')
  }
  options = {
    window: window,
    enablePlugins: ['highlight', 'badge'],
    ...options,
    highlight: {
      disableDefaultClick: false,
      ...options.highlight
    }
  }
  const { enablePlugins, ...restOptions } = options

  const ctx = new AwaitEventEmitter()

  Object.assign(ctx, {
    opt: options,
    __resets: [],
    addReset(reset) {
      reset && this.__resets.push(reset)
    },
    exit() {
      if (element.__reset) {
        element.__reset()
      }
    },
    addStyle(text) {
      const document = this.opt.window.document
      let style = document.createElement('style')
      style.textContent = text
      document.head.appendChild(style)
      this.addReset(() => {
        document.head.removeChild(style)
      })
      return style
    }
    // addButton = function({ title, icon, action } = {}) {}
  })

  ctx.exit()
  element.__reset = function () {
    ctx.__resets.forEach(reset => reset())
  }

  enablePlugins.forEach(plugin => {
    if (plugins[plugin]) {
      run.call(ctx, plugins[plugin], plugin, element, restOptions)
    }
  })

  registerCommonMethod(ctx, 'exit', enablePlugins)
  registerCommonMethod(ctx, 'remove', enablePlugins)
  // registerCommonMethod(ctx, 'fill', enablePlugins)

  return ctx
}
