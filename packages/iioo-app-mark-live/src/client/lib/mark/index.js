/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
const highlight = require('./plugins/highlight/index')
const badge = require('./plugins/badge')
const AwaitEventEmitter = require('await-event-emitter')

const isBrowser = typeof document !== 'undefined'

function isInPage(node) {
  return node === document.body ? false : document.body.contains(node)
}

function run(func, message, ...args) {
  try {
    func.apply(this, args)
  } catch (e) {
    console.error(message, e.toString())
  }
}

module.exports = function(element, options = {}) {
  if (!isBrowser) {
    throw new Error('mark should be used in browser environment.')
  }
  if (!isInPage(element)) {
    throw new Error('the element may not in page.')
  }
  options = {
    enableHighlight: true,
    save(key, map) {

    },
    fetch(key) {

    },
    ...options
  }
  const { enableHighlight, enableBadge, ...restOptions } = options

  const ctx = new AwaitEventEmitter()
  // highlight
  enableHighlight && run.call(ctx, highlight, 'highlight', element, restOptions)
  enableBadge && run.call(ctx, badge, 'badge', element, restOptions)

  // const _emit = ctx.emit
  // ctx.emit = async function () {
  //   try {
  //     return await _emit.apply(this, arguments)
  //   } catch (e) {
  //     _emit.apply(this, ['error', e])
  //     throw e
  //   }
  // }

  return ctx
}
