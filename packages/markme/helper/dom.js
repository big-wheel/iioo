/**
 * @file selection
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */

export function isText(node) {
  return node && node.nodeType === document.TEXT_NODE
}

function createElem(tagName, document = document) {
  return document.createElement(tagName)
}
const doms = new Map()
export function getSingleDOM(tagName = 'div', id = Math.random(), document = document) {
  if (doms.has(id)) {
    return doms.get(id)
  }
  let ele = createElem(tagName, document)
  doms.set(id, ele)
  return ele
}


export function getPageOffset(el) {
  el = el.getBoundingClientRect()
  return {
    width: el.width,
    height: el.height,
    left: el.left + window.scrollX,
    top: el.top + window.scrollY
  }
}

export function getTextNodeSize(node, window = window) {
  if (!(node instanceof window.Range)) {
    const range = window.document.createRange()
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
export const hasParent = _hasRelaMaker('parentNode')
export const hasNext = _hasRelaMaker('nextSibling')
export const hasPrev = _hasRelaMaker('previousSibling')

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

export const walk = walkDOM

export function getSelector(el, root = document) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) {
    throw new Error('getSelector requires element.')
  }
  if (root === el) {
    return null
  }
  if (el.hasAttribute('id')) {
    return `#${el.getAttribute('id')}`
  }

  const children = Array.from(el.parentNode ? el.parentNode.children : [])
  let index = -1,
    hasBrother = false
  children.forEach((x, i) => {
    if (x === el) {
      index = i + 1
    } else if (el.tagName === x.tagName) {
      hasBrother = true
    }
  })

  let selector = el.localName
  if (index > 0 && hasBrother) {
    selector = `${el.localName}:nth-child(${index})`
  }
  let ps = getSelector(el.parentNode, root)
  return ps !== null ? `${ps} > ${selector}` : selector
}
