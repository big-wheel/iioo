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

  if (range) {
    let cloneRange = range.cloneRange()
    // eslint-disable-next-line no-inner-declarations
    function makeReset(fn) {
      let wrap = function() {
        if (wrap.__called) {
          return
        }
        wrap.__called = true

        // range.setStart(cloneRange.startContainer, cloneRange.startOffset)
        // range.setEnd(cloneRange.endContainer, cloneRange.endOffset)
        fn()
      }
      return wrap
    }

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
      if (isText(startContainer)) {
        const nodes = [
          startWholeText.slice(startOffset),
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
        range.setStart(nodes[0], 0)
      }

      if (isText(endContainer)) {
        const nodes = [
          endWholeText.slice(endOffset),
          endWholeText.slice(0, endOffset)
        ].map(x => document.createTextNode(x))
        let head = nodes[0]
        endParentContainer.replaceChild(nodes[0], endContainer)
        let resetNodes = nodes.slice(1)

        reset = (reset =>
          makeReset(function() {
            reset && reset()
            endParentContainer.replaceChild(endContainer, nodes[0])
            resetNodes.forEach(function(node) {
              endParentContainer.removeChild(node)
            })
          }))(reset)

        resetNodes.forEach(function(node) {
          endParentContainer.insertBefore(node, head)
          head = node
        })
        range.setEnd(nodes[1], nodes[1].textContent.length)
      }

      pos = getTextNodeSize(range)
    }

    return {
      reset,
      pos
    }
  }

  return {}
}

exports.removeRanges = function() {
  const selection = window.getSelection()
  selection.removeAllRanges()
}

function getSelectionContainsList(cond) {
  return function(selection = window.getSelection()) {
    if (selection.isCollapsed) {
      return []
    }
    let list = []
    let range = selection.getRangeAt(selection.rangeCount - 1)

    function getTexts(root, range) {
      let list = []
      walk(root, function(node) {
        if (cond(node)) {
          if (range.isPointInRange(node, 0)) {
            list.push(node)
          }
        }
      })
      return list
    }
    if (cond(range.commonAncestorContainer)) {
      return [range.commonAncestorContainer]
    }
    if (range) {
      list = getTexts(range.commonAncestorContainer, range)
    }
    return list
  }
}
exports.getSelectionContainsList = getSelectionContainsList

exports.getSelectionTextList = getSelectionContainsList(node => {
  if (isText(node)) {
    if (node.parentNode) {
      if (
        node.parentNode.tagName &&
        ['style', 'script', 'noscript'].includes(
          node.parentNode.tagName.toLowerCase()
        )
      ) {
        return false
      }
    }
    return true
  }
  return false
})
