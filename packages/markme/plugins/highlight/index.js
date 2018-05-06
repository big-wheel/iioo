/**
 * @file highlight
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
import debounce from 'lodash.debounce'
import * as domUtil from '../../helper/dom'
import _rgbHex from 'rgb-hex'
import md5 from 'md5'
import * as selectionUtil from '../../helper/selection'
import styleText from './style'

function rgbHex(str) {
  try {
    return `#${_rgbHex(str)}`
  } catch (e) {
    return str
  }
}

function replaceToMark(textNode, { color, words, uid } = {}, opt) {
  // eslint-disable-next-line no-use-before-define
  if (isItemNode(textNode)) {
    return
  }
  let mark = opt.window.document.createElement('mark')
  mark.className = 'mark-highlight-item'
  mark.style.backgroundColor = color
  mark.setAttribute('data-mark-id', uid)
  words && mark.setAttribute('data-mark-words', words)
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

function getMarkItems(id, ele) {
  let doms = []
  if (typeof id === 'undefined') {
    doms = ele.querySelectorAll('mark[data-mark-id]')
  } else {
    doms = ele.querySelectorAll(
      `mark[data-mark-id=${JSON.stringify(id)}]`
    )
  }
  return doms
}

function batchSetMarkAttribute(id, { words, color }, ele) {
  let doms = getMarkItems(id, ele)
  for (let i = 0; i < doms.length; i++) {
    let dom = doms[i]
    words && dom.setAttribute('data-mark-words', words)
    color && (dom.style.backgroundColor = rgbHex(color))
  }
}

function remove(removeId, ele) {
  let doms = getMarkItems(removeId, ele)

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
  let self = this
  let popover = domUtil.getSingleDOM('div', void 0, document)
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
      this.innerHTML += '<textarea placeholder="input your idea" style="display: none"></textarea>'
      this.style.display = ''
    },
    selectColor(color, id) {
      this._resetActive()
      let colors = this.querySelectorAll('.mark-highlight-color')
      for (let i = 0; i < colors.length; i++) {
        if (rgbHex(colors[i].style.backgroundColor) === rgbHex(color)) {
          id && colors[i].setAttribute('data-mark-id', id)
          colors[i].classList.add('mark-highlight-active-color')
          this.setText('')
          return
        }
      }
    },
    setText(text) {
      let textarea = this.querySelector('textarea')
      textarea.style.display = ''
      textarea.value = text
      textarea.onblur = async () => {
        let activeItem = popover.getActive()
        if (!activeItem) {
          return
        }
        const words = textarea.value
        await self.emit('highlight-change:words', { id: activeItem.id, words })
        batchSetMarkAttribute(activeItem.id, { words }, ele)
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
  opt.window.document.body.appendChild(popover)
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
        target.classList.remove('mark-highlight-active-color')
      } else {
        let active = popover.getActive()
        if (active) {
          await this.emit('highlight-change:color', { id: active.id, color })

          popover.selectColor(color, active.id)

          batchSetMarkAttribute(active.id, { color }, ele)
          return
        }

        let list = selectionUtil.getSelectionTextList(opt.window.getSelection())
        let containsMarked = list.find(textNode =>
          isItemNode(textNode.parentNode)
        )
        if (containsMarked) {
          return
        }

        // slice side effect
        selectionUtil.getLastRangePos(opt.window)

        list = selectionUtil.getSelectionTextSeqList(opt.window.getSelection())

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
          replaceToMark(textNode, { uid, color }, opt)
        })
        selectionUtil.removeRanges(window)
        /* eslint-disable no-use-before-define */
        resetQueue.clear()
        popover.selectColor(color, uid)
      }

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

function _fill({ color, words, id, offset, length } = {}, dom, opt) {
  const { reset, nodes } = selectionUtil.sliceNode(
    dom,
    { offset, length },
    opt.window
  )
  // if (reset) {
  //   resetQueue.add(id, reset)
  // }
  if (nodes && nodes[1]) {
    replaceToMark(nodes[1], { uid: id, color, words }, opt)
  }
}

function fill({ color, id, words, chunks = [] } = {}, ele = document, opt) {
  if (!Array.isArray(chunks)) {
    return
  }
  let domList = chunks.map(({ parentSelector }) =>
    ele.querySelector(parentSelector)
  )
  chunks.forEach((chunk, i) => {
    domList[i] && _fill({ color, id, words, ...chunk }, domList[i], opt)
  })
}

async function mouseUpCore(opt, ele, popover, { target }) {
  // console.log('mouseUpCore')
  let selection = opt.window.getSelection()
  if (!selection.isCollapsed) {
    const markedList = selectionUtil.getSelectionContainsList(
      node => isItemNode(node) || isItemNode(node.parentNode)
    )(opt.window.getSelection())
    // Selected contains marked item
    if (markedList.length) {
      return
    }

    let { reset, pos } = selectionUtil.getLastRangePos(opt.window)
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

async function click(opt, ele, popover, evt) {
  let target = evt.target
  if (
    target.classList.contains('mark-highlight-item') &&
    target.hasAttribute('data-mark-id')
  ) {
    let id = target.getAttribute('data-mark-id')
    let color = target.style.backgroundColor
    let words = target.getAttribute('data-mark-words')

    let colorList = opt.highlightColors.slice().map(x => rgbHex(x))
    if (!colorList.includes(rgbHex(color))) {
      colorList.push(rgbHex(color))
    }
    popover.show(domUtil.getPageOffset(target), colorList)
    popover.selectColor(color, id)
    words && popover.setText(words)
  }
  if (opt.highlight.disableDefaultClick) {
    // evt.stopPropagation()
    evt.preventDefault()
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

export default function highlight(element, options) {
  if (!window.getSelection) {
    throw new Error('window.getSelection is not existed')
  }

  options = {
    generateUid() {
      return md5(new Date().getTime() + Math.random() + '')
    },
    window: window,
    highlightColors: ['#fff682', 'pink', '#b2f0ff', '#c57dff'],
    ...options
  }

  const document = options.window.document
  let style = document.createElement('style')
  style.innerHTML = styleText
  document.head.appendChild(style)

  function removeStyle() {
    document.head.removeChild(style)
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
    removeStyle()
  }

  element.addEventListener('click', onClick)
  element.addEventListener('mouseover', onMouseEnter)
  element.addEventListener('mouseout', onMouseLeave)
  element.addEventListener('mouseup', debouncedMouseUp)
  element.addEventListener('mousedown', debouncedMouseDown)

  this.highlight = {
    fill: function(data, ele = element) {
      if (Array.isArray(data)) {
        return data.forEach(item => fill(item, ele, options))
      }
      fill(data, ele, options)
    },
    remove: function(id, ele = element) {
      let active = popover.getActive()
      if (active && active.id === id) {
        popover.hide()
      }
      return remove(id, ele)
    },
    exit() {
      element.__reset && element.__reset()
    }
  }
}
