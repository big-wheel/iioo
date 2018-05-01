/**
 * @file highlight
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
const debounce = require('lodash.debounce')
const domUtil = require('../../helper/dom')
const selectionUtil = require('../../helper/selection')
const Persistence = require('./persistence')

function getPopover(ele) {
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

  popover.addEventListener('click', (evt) => {
    let target = evt.target
    if (target.classList.contains('mark-highlight-color')) {
      let color = target.style.backgroundColor
      if (
        target.classList.contains('mark-highlight-active-color') &&
        target.hasAttribute('data-mark-id')
      ) {
        // Remove
        let doms = ele.querySelectorAll(
          `mark[data-mark-id=${JSON.stringify(
            target.getAttribute('data-mark-id')
          )}]`
        )

        /* eslint-disable no-use-before-define */
        for (let i = 0; i < doms.length; i++) {
          if (doms[i].parentNode) {
            doms[i].parentNode.replaceChild(doms[i].firstChild, doms[i])
          }
        }
        // target.resetQueue && reset(target.resetQueue)
        popover.hide()
      } else {
        let active = popover.getActive()
        if (active) {
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

        const list = selectionUtil.getSelectionTextList()
        let containsMarked = list.find(textNode =>
          isItemNode(textNode.parentNode)
        )
        if (containsMarked) {
          return
        }

        let uid = new Date().getTime() + Math.random() + ''
        target.setAttribute('data-mark-id', uid)
        let nodeList = list.filter(textNode => ele.contains(textNode))
        this.hlPersistence.addTextNodeList(uid, nodeList, color)
        nodeList.forEach(textNode => {
          let mark = document.createElement('mark')
          mark.className = 'mark-highlight-item'
          mark.style.backgroundColor = color
          mark.setAttribute('data-mark-id', uid)
          textNode.parentNode &&
            textNode.parentNode.replaceChild(mark, textNode)
          mark.appendChild(textNode)
        })
        selectionUtil.removeRanges()
        /* eslint-disable no-use-before-define */
        resetQueue = []
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

let resetQueue = []
function reset(resetQueue = resetQueue) {
  try {
    resetQueue.forEach(reset => reset())
    resetQueue.splice(0, resetQueue.length)
  } catch (e) {}
}
function mouseUpCore(opt, ele, popover, { target }) {
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
      resetQueue.push(reset)
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
  reset()
  popover.hide()
}

function click(opt, ele, popover, evt) {
  let target = evt.target
  if (
    target.classList.contains('mark-highlight-item') &&
    target.hasAttribute('data-mark-id')
  ) {
    let id = target.getAttribute('data-mark-id')
    let color = target.style.backgroundColor
    popover.show(domUtil.getPageOffset(target), opt.highlightColors)
    popover.selectColor(color, id)
    // TODO: high id~
  }
}

function mouseEnter(opt, ele, popover, { target }) {
  if (
    target.classList.contains('mark-highlight-item') &&
    target.hasAttribute('data-mark-id')
  ) {
    // let color = target.style.backgroundColor
    let domList = ele.querySelectorAll(
      `[data-mark-id=${JSON.stringify(target.getAttribute('data-mark-id'))}]`
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
    highlightColors: ['red', 'pink', 'blue'],
    ...options
  }

  const popover = getPopover.call(this, element)
  this.hlPersistence = new Persistence(element, options)
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
}
