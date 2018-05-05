/**
 * @file highlight
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
const debounce = require('lodash.debounce')
const domUtil = require('../../helper/dom')
const md5 = require('md5')
const selectionUtil = require('../../helper/selection')

function replaceToMark(textNode, { color, uid } = {}) {
  // eslint-disable-next-line no-use-before-define
  if (isItemNode(textNode)) {
    return
  }
  let mark = document.createElement('mark')
  mark.className = 'mark-highlight-item'
  mark.style.backgroundColor = color
  mark.setAttribute('data-mark-id', uid)
  textNode.parentNode && textNode.parentNode.replaceChild(mark, textNode)
  mark.appendChild(textNode)
}

class MapQueue {
  constructor() {
    this.mapQueue = {}
  }
  get(id) {
    return this.mapQueue[id]
  }
  add(id, val) {
    let list = this.get(id)
    if (list) {
      list.push(val)
    } else {
      this.mapQueue[id] = [val]
    }
  }
  get keys() {
    return Object.keys(this.mapQueue)
  }
  clear(id) {
    this.reset(id, false)
  }
  reset(id, exec = true) {
    if (typeof id === 'undefined') {
      this.keys.map(key => this.reset(key, exec))
    } else {
      let list = this.get(id)
      if (list) {
        exec && list.forEach(reset => reset())
        list.splice(0, list.length)
      }
    }
  }
}
const resetQueue = new MapQueue()

function prependTextNodeChunks(textNode) {
  if (!domUtil.isText(textNode)) {
    return
  }
  let prev = textNode.previousSibling
  while (domUtil.isText(prev)) {
    textNode.textContent = prev.textContent + textNode.textContent
    let tmpPrev = prev.previousSibling
    prev.remove()
    prev = tmpPrev
  }
}

function appendTextNodeChunks(textNode) {
  if (!domUtil.isText(textNode)) {
    return
  }
  let next = textNode.nextSibling
  while (domUtil.isText(next)) {
    textNode.textContent = textNode.textContent + next.textContent
    let tmpNext = next.nextSibling
    next.remove()
    next = tmpNext
  }
}

function remove(removeId, ele) {
  let doms = ele.querySelectorAll(
    `mark[data-mark-id=${JSON.stringify(removeId)}]`
  )
  /* eslint-disable no-use-before-define */
  for (let i = 0; i < doms.length; i++) {
    let dom = doms[i]
    if (dom.parentNode) {
      let textNode = dom.firstChild
      dom.parentNode.replaceChild(textNode, dom)
      prependTextNodeChunks(textNode)
      appendTextNodeChunks(textNode)
    }
  }
}

function getPopover(ele, opt) {
  let popover = domUtil.getSingleDOM('div')
  popover.style.position = 'absolute'
  popover.style.display = 'none'
  popover.className = 'mark-highlight-popover'
  Object.assign(popover, {
    hide() {
      this.style.display = 'none'
    },
    show(pos, colors) {
      if (pos) {
        this.style.top = pos.top + pos.height + 'px'
        this.style.left = pos.left + pos.width + 'px'
      }
      if (colors) {
        this.innerHTML = colors
          .map(c => {
            let className = 'mark-highlight-color'
            return `<span class="${className}" style="background-color: ${c}"></span>`
          })
          .join('')
      }
      this.style.display = ''
    },
    selectColor(color, id) {
      this._resetActive()
      let colors = this.querySelectorAll('.mark-highlight-color')
      for (let i = 0; i < colors.length; i++) {
        if (colors[i].style.backgroundColor === color) {
          id && colors[i].setAttribute('data-mark-id', id)
          colors[i].classList.add('mark-highlight-active-color')
          return
        }
      }
    },
    _resetActive() {
      let active = this.querySelector('.mark-highlight-active-color')
      if (active) {
        active.removeAttribute('data-mark-id')
        active.classList.remove('mark-highlight-active-color')
      }
    },
    getActive() {
      let active = this.querySelector('.mark-highlight-active-color')
      return (
        active && {
          color: active.style.backgroundColor,
          id: active.getAttribute('data-mark-id')
        }
      )
    }
  })
  document.body.appendChild(popover)

  popover.addEventListener('click', async evt => {
    let target = evt.target
    if (target.classList.contains('mark-highlight-color')) {
      let color = target.style.backgroundColor
      if (
        target.classList.contains('mark-highlight-active-color') &&
        target.hasAttribute('data-mark-id')
      ) {
        let removeId = target.getAttribute('data-mark-id')
        // Remove
        await this.emit('highlight-remove', removeId)
        remove(removeId, ele)
        popover.hide()
      } else {
        let active = popover.getActive()
        if (active) {
          await this.emit('highlight-change:color', { id: active.id, color })

          popover.selectColor(color, active.id)
          let doms = ele.querySelectorAll(
            `mark[data-mark-id=${JSON.stringify(
              target.getAttribute('data-mark-id')
            )}]`
          )
          for (let i = 0; i < doms.length; i++) {
            doms[i].style.backgroundColor = color
          }
          return
        }

        let list = selectionUtil.getSelectionTextList()
        let containsMarked = list.find(textNode =>
          isItemNode(textNode.parentNode)
        )
        if (containsMarked) {
          return
        }

        // slice side effect
        selectionUtil.getLastRangePos()

        list = selectionUtil.getSelectionTextSeqList()

        let uid = opt.generateUid()
        target.setAttribute('data-mark-id', uid)
        let nodeList = list.filter(textNode => ele.contains(textNode))

        const chunks = nodeList.map(node => {
          let parentNode = node.parentNode
          let offset = 0
          for (let i = 0; i < parentNode.childNodes.length; i++) {
            let childNode = parentNode.childNodes[i]
            if (childNode === node) {
              break
            }
            if (childNode && 'textContent' in childNode) {
              offset += childNode.textContent.length
            }
          }

          return {
            offset,
            length: node.textContent.length,
            parentSelector: domUtil.getSelector(parentNode, ele)
          }
        })
        if (chunks && chunks.length) {
          await this.emit('highlight-add', { chunks, id: uid, color })
        }

        nodeList.forEach(textNode => {
          replaceToMark(textNode, { uid, color })
        })
        selectionUtil.removeRanges()
        /* eslint-disable no-use-before-define */
        resetQueue.clear()
      }
      target.classList.toggle('mark-highlight-active-color')
    }
  })
  return popover
}

function isItemNode(node) {
  return (
    node &&
    node.classList &&
    node.classList.contains('mark-highlight-item') &&
    node.tagName &&
    node.tagName.toLowerCase() === 'mark'
  )
}

let style = document.createElement('style')
style.innerHTML = require('./style')
document.head.appendChild(style)

function _fill({ color, id, offset, length } = {}, dom) {
  const { reset, nodes } = selectionUtil.sliceNode(dom, { offset, length })
  // if (reset) {
  //   resetQueue.add(id, reset)
  // }
  if (nodes && nodes[1]) {
    replaceToMark(nodes[1], { uid: id, color })
  }
}

function fill({ color, id, chunks = [] } = {}, ele = document) {
  if (!Array.isArray(chunks)) {
    return
  }
  let domList = chunks.map(({ parentSelector }) =>
    ele.querySelector(parentSelector)
  )
  chunks.forEach((chunk, i) => {
    domList[i] && _fill({ color, id, ...chunk }, domList[i])
  })
}

async function mouseUpCore(opt, ele, popover, { target }) {
  let selection = window.getSelection()
  if (!selection.isCollapsed) {
    const markedList = selectionUtil.getSelectionContainsList(
      node => isItemNode(node) || isItemNode(node.parentNode)
    )()
    // Selected contains marked item
    if (markedList.length) {
      return
    }

    let { reset, pos } = selectionUtil.getLastRangePos(selection)
    if (reset) {
      resetQueue.add('TEMP', reset)
    }

    if (pos) {
      popover.show(pos, opt.highlightColors)
    } else {
      popover.hide()
    }
  }
}

function mouseDown(opt, ele, popover, { target }) {
  if (
    target.classList.contains('mark-highlight-item') &&
    target.hasAttribute('data-mark-id')
  ) {
    return
  }
  resetQueue.reset('TEMP')
  popover.hide()
}

window.resetQueue = resetQueue

async function click(opt, ele, popover, evt) {
  let target = evt.target
  if (
    target.classList.contains('mark-highlight-item') &&
    target.hasAttribute('data-mark-id')
  ) {
    let id = target.getAttribute('data-mark-id')
    let color = target.style.backgroundColor

    let colorList = opt.highlightColors.slice()
    if (!colorList.includes(color)) {
      colorList.push(color)
    }
    popover.show(domUtil.getPageOffset(target), colorList)
    popover.selectColor(color, id)
  }
}

function mouseEnter(opt, ele, popover, { target }) {
  if (
    target.classList.contains('mark-highlight-item') &&
    target.hasAttribute('data-mark-id')
  ) {
    // let color = target.style.backgroundColor
    let domList = ele.querySelectorAll(
      `.mark-highlight-item[data-mark-id=${JSON.stringify(
        target.getAttribute('data-mark-id')
      )}]`
    )
    Array.from(domList).forEach(dom => {
      dom.style.filter = 'brightness(85%)'
      dom.style.webkitFilter = 'brightness(85%)'
      dom.style.msFilter = 'brightness(85%)'
      dom.style.mozFilter = 'brightness(85%)'
    })
  }
}

function mouseLeave(opt, ele, popover, { target }) {
  if (
    target.classList.contains('mark-highlight-item') &&
    target.hasAttribute('data-mark-id')
  ) {
    let domList = ele.querySelectorAll(
      `[data-mark-id=${JSON.stringify(target.getAttribute('data-mark-id'))}]`
    )

    Array.from(domList).forEach(dom => {
      dom.style.filter = ''
      dom.style.webkitFilter = ''
      dom.style.msFilter = ''
      dom.style.mozFilter = ''
    })
  }
}

module.exports = function highlight(element, options) {
  if (!window.getSelection) {
    throw new Error('window.getSelection is not existed')
  }

  options = {
    generateUid() {
      return md5(new Date().getTime() + Math.random() + '')
    },
    highlightColors: ['red', 'pink', 'blue'],
    ...options
  }

  const popover = getPopover.call(this, element, options)
  const debouncedMouseUp = debounce(mouseUpCore, 100).bind(
    this,
    options,
    element,
    popover
  )
  const debouncedMouseDown = debounce(mouseDown, 100).bind(
    this,
    options,
    element,
    popover
  )
  const onClick = click.bind(this, options, element, popover)
  const onMouseEnter = mouseEnter.bind(this, options, element, popover)
  const onMouseLeave = mouseLeave.bind(this, options, element, popover)

  element.__reset && element.__reset()
  element.__reset = () => {
    popover.parentNode && popover.parentNode.removeChild(popover)
    element.removeEventListener('click', onClick)
    element.removeEventListener('mouseover', onMouseEnter)
    element.removeEventListener('mouseout', onMouseLeave)
    element.removeEventListener('mouseup', debouncedMouseUp)
    element.removeEventListener('mousedown', debouncedMouseDown)
  }

  element.addEventListener('click', onClick)
  element.addEventListener('mouseover', onMouseEnter)
  element.addEventListener('mouseout', onMouseLeave)
  element.addEventListener('mouseup', debouncedMouseUp)
  element.addEventListener('mousedown', debouncedMouseDown)

  this.highlight = {
    fill: function(data, ele = element) {
      return fill(data, ele)
    },
    remove: function(id, ele = element) {
      let active = popover.getActive()
      if (active && active.id === id) {
        popover.hide()
      }
      return remove(id, ele)
    }
  }
}
