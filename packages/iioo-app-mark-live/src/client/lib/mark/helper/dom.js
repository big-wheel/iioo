/**
 * @file selection
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */

exports.isText = function(node) {
  return node && node.nodeType === document.TEXT_NODE
}

function createElem(tagName) {
  return document.createElement(tagName)
}

const doms = new Map()
function getSingleDOM(tagName = 'div', id = Math.random()) {
  if (doms.has(id)) {
    return doms.get(id)
  }
  let ele = createElem(tagName)
  doms.set(id, ele)
  return ele
}

exports.getSingleDOM = getSingleDOM

function getPageOffset(el) {
  el = el.getBoundingClientRect()
  return {
    width: el.width,
    height: el.height,
    left: el.left + window.scrollX,
    top: el.top + window.scrollY
  }
}
exports.getPageOffset = getPageOffset

let place = getSingleDOM('div')
place.style.display = 'none'
place.style.width = '0px'
place.style.height = '0px'
exports.getTextNodeSize = function(node) {
  if (!(node instanceof Range)) {
    const range = document.createRange()
    range.selectNodeContents(node)
    node = range
  }
  return getPageOffset(node)
}

function _hasRelaMaker(attr) {
  return function(node, parent) {
    let parentNode = node
    while (parentNode !== parent) {
      if (!parentNode) {
        return false
      }
      parentNode = parentNode[attr]
    }

    return true
  }
}
exports.hasParent = _hasRelaMaker('parentNode')
exports.hasNext = _hasRelaMaker('nextSibling')
exports.hasPrev = _hasRelaMaker('previousSibling')

function walkDOM(node, func) {
  let rlt = func(node) // this will invoke the functionToInvoke from arg
  // skip
  if (rlt === false) {
    return
  }
  node = node.firstChild
  while (node) {
    walkDOM(node, func)
    node = node.nextSibling
  }
}

exports.walk = walkDOM
