/**
 * @file highlight
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
const debounce = require('lodash.debounce')
const domUtil = require('../helper/dom')
const selectionUtil = require('../helper/selection')

let popover = domUtil.getSingleDOM('div', 'mark-highlight-popover')
popover.style.position = 'absolute'
popover.style.display = 'none'
popover.className = 'mark-highlight-popover'
document.body.appendChild(popover)

popover.addEventListener('click', function(evt) {
  let target = evt.target
  if (target.classList.contains('mark-highlight-color')) {
    let color = target.style.backgroundColor
    const list = selectionUtil.getSelectionTextList()
    console.log('list', list)
    list.forEach(textNode => {
      let mark = document.createElement('mark')
      mark.className = 'mark-highlight-item'
      mark.style.backgroundColor = color
      mark.textContent = textNode.textContent

      textNode.parentNode && textNode.parentNode.replaceChild(mark, textNode)
    })

    // eslint-disable-next-line no-use-before-define
    resetQueue = []
  }
})

let style = document.createElement('style')
style.innerHTML = require('./highlightStyle')
document.head.appendChild(style)

let resetQueue = []
function reset() {
  try {
    resetQueue.forEach(reset => reset())
    resetQueue = []
  } catch (e) {}
}
function mouseUpCore(evt) {
  let selection = window.getSelection()
  if (!selection.isCollapsed) {
    // selection.anchorNode

    // selection.startContainer.parentElement._old =
    let { reset, pos } = selectionUtil.getLastRangePos(selection)
    if (reset) {
      resetQueue.push(reset)
    }

    if (pos) {
      popover.style.top = pos.top + pos.height + 'px'
      popover.style.left = pos.left + pos.width + 'px'

      popover.innerHTML = `
        <span class="mark-highlight-color" style="background-color: red"></span>
        <span class="mark-highlight-color" style="background-color: cyan"></span>
        <span class="mark-highlight-color" style="background-color: blue"></span>
        <span class="mark-highlight-color" style="background-color: green"></span>
      `
      // popover.textContent = selection.toString()
      popover.style.display = ''
    } else {
      popover.style.display = 'none'
    }
  }
}

function mouseDown(evt) {
  reset()
  popover.style.display = 'none'
}

const debouncedMouseUp = debounce(mouseUpCore, 100)
const debouncedMouseDown = debounce(mouseDown, 100)

module.exports = function highlight(element) {
  if (!window.getSelection) {
    throw new Error('window.getSelection is not existed')
  }

  element.removeEventListener('mouseup', debouncedMouseUp)
  element.addEventListener('mouseup', debouncedMouseUp)

  element.removeEventListener('mousedown', debouncedMouseDown)
  element.addEventListener('mousedown', debouncedMouseDown)
}
