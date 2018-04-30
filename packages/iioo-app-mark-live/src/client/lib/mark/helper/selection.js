/**
 * @file selection
 * @author Cuttle Cong
 * @date 2018/4/30
 * @description
 */
const {
  isText,
  getTextNodeSize,
  hasParent,
  hasPrev,
  walk,
  hasNext
} = require('./dom')

exports.getLastRangePos = function(selection = window.getSelection()) {
  let range = selection.getRangeAt(selection.rangeCount - 1)
  let reset
  let pos

  function makeReset(fn) {
    let wrap = function() {
      if (wrap.__called) {
        return
      }
      wrap.__called = true
      fn()
    }
    return wrap
  }

  if (range) {
    const startContainer = range.startContainer
    const endContainer = range.endContainer
    const startParentContainer = startContainer.parentElement
    const endParentContainer = endContainer.parentElement
    const commonAncestorContainer = range.commonAncestorContainer
    // pure text nodes

    const startWholeText = range.startContainer.textContent
    const startOffset = range.startOffset
    const endWholeText = range.endContainer.textContent
    const endOffset = range.endOffset

    //  " hello world "
    //      _____
    if (startContainer === endContainer) {
      const nodes = [
        startWholeText.slice(endOffset),
        startWholeText.slice(startOffset, endOffset),
        startWholeText.slice(0, startOffset)
      ].map(x => document.createTextNode(x))
      let head = nodes[0]
      startParentContainer.replaceChild(nodes[0], startContainer)
      let resetNodes = nodes.slice(1)

      reset = makeReset(function() {
        startParentContainer.replaceChild(startContainer, nodes[0])
        resetNodes.forEach(function(node) {
          startParentContainer.removeChild(node)
        })
      })

      resetNodes.forEach(function(node) {
        startParentContainer.insertBefore(node, head)
        head = node
      })

      range.selectNodeContents(nodes[1])
      pos = getTextNodeSize(range)
    } else {
      //  " hello<code>x</code>world "
      //      ^^^^^^^^^^^^^^^^^^^
      // TODO  slice
      pos = getTextNodeSize(range)
    }

    return {
      reset,
      pos
    }
  }

  // if (isText(focusNode)) {
  //   focusNode.textContent = focusNode.textContent.slice(0, focusOffset)
  // } else {
  //   focusNode.childNodes = Array.from(focusNode.childNodes).slice(
  //     0,
  //     focusOffset
  //   )
  // }

  return {}
}

function getTexts(root, range) {
  let list = []
  walk(root, function (node) {
    if (isText(node)) {
      if (range.isPointInRange(node, 0)) {
        list.push(node)
      }
    }/* else if (node.nodeType === Node.ELEMENT_NODE) {
      if (range.isPointInRange(node, 0)) {
        // list = list.concat(getTexts(node, range))
        return false
      }
    }*/
  })
  return list
}

exports.getSelectionTextList = function(selection = window.getSelection()) {
  let list = []
  let range = selection.getRangeAt(selection.rangeCount - 1)
  if (isText(range.commonAncestorContainer)) {
    return [range.commonAncestorContainer]
  }
  if (range) {
    list = getTexts(range.commonAncestorContainer, range)
  }
  return list
}
