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
  hasNext,
  getSelector
} = require('./dom')

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

export function sliceNode(node, { offset, length } = {}, window = window) {
  const document = window.document

  if (node && node.nodeType === Node.ELEMENT_NODE) {
    let sumOffset = 0,
      relativeOffset = offset
    for (let i = 0; i < node.childNodes.length; i++) {
      let child = node.childNodes[i]
      if (child && 'textContent' in child) {
        sumOffset += child.textContent.length
        relativeOffset = relativeOffset - child.textContent.length
      }

      if (sumOffset > offset) {
        return sliceNode(
          child,
          {
            offset: relativeOffset + child.textContent.length,
            length
          },
          window
        )
      }
    }
  }

  if (node && 'textContent' in node) {
    const text = node.textContent
    const pNode = node.parentNode
    if (!pNode) {
      return {}
    }

    if (text.length < offset && node.nextSibling) {
      return sliceNode(
        node.nextSibling,
        { offset: offset - text.length, length },
        window
      )
    }
    const nodes = [
      text.slice(offset + length),
      text.slice(offset, offset + length),
      text.slice(0, offset)
    ].map(text => document.createTextNode(text))
    // .filter(text => text.trim() !== '')

    let head = nodes[0]
    pNode.replaceChild(nodes[0], node)
    let resetNodes = nodes.slice(1)

    let reset = makeReset(function() {
      pNode.replaceChild(node, nodes[0])
      resetNodes.forEach(function(node) {
        node.remove()
      })
    })

    resetNodes.forEach(function(node) {
      pNode.insertBefore(node, head)
      head = node
    })

    return { reset, nodes }
  }
  return {}
}

exports.getLastRangePos = function(window) {
  let selection = window.getSelection()
  let document = window.document

  let range = selection.getRangeAt(selection.rangeCount - 1)
  let reset
  let pos

  if (range) {
    // eslint-disable-next-line no-inner-declarations

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
      let data = sliceNode(
        startContainer,
        {
          offset: startOffset,
          length: endOffset - startOffset
        },
        window
      )
      let nodes = data.nodes
      range.selectNodeContents(nodes[1])
      pos = getTextNodeSize(range, window)
      reset = data.reset
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
            node.remove()
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
              node.remove()
            })
          }))(reset)

        resetNodes.forEach(function(node) {
          endParentContainer.insertBefore(node, head)
          head = node
        })
        range.setEnd(nodes[1], nodes[1].textContent.length)
      }

      pos = getTextNodeSize(range, window)
    }

    return {
      reset,
      pos
    }
  }

  return {}
}

exports.removeRanges = function(window = window) {
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

const getTextList = getSelectionContainsList(node => {
  if (isText(node)) {
    if (node.parentNode) {
      if (
        node.parentNode.tagName &&
        ['style', 'script', 'noscript', 'title'].includes(
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
exports.getSelectionTextList = getTextList

function isEmpty(node) {
  return node.textContent.trim() === ''
}

exports.getSelectionTextSeqList = function(selection) {
  const textList = getTextList(selection)
  if (!textList || !textList.length) {
    return textList
  }
  // debugger
  let newList = [textList.shift()]
  while (textList.length) {
    let head = newList[newList.length - 1]
    let node = textList.shift()
    if (node.previousSibling === head) {
      head.textContent = head.textContent + node.textContent
      node.remove()
    } else {
      newList.push(node)
    }
  }

  return newList.filter(x => !isEmpty(x))
}
