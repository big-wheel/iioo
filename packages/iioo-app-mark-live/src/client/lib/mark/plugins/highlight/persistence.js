/**
 * @file persistence
 * @author Cuttle Cong
 * @date 2018/5/1
 * @description
 */
const domUtil = require('../../helper/dom')
const IPersistence = require('../IPersistence')

/**
 *
 * selector: body > a
 * pos: 5
 * len: 3
 */

module.exports = class HLPersistence extends IPersistence {
  static key = 'HLPersistence'

  addTextNodeList(uid, textNodeList = [], color) {
    this.map.set(uid, {
      color,
      list: textNodeList.map(textNode => {
        let textOffset = 0
        Array.from(textNode.parentElement.childNodes).some(node => {
          if (node === textNode) {
            return true
          }
          textOffset += node.hasOwnProperty('textContent')
            ? node.textContent.length
            : 0
        })

        return {
          pSelector: domUtil.getSelector(textNode.parentElement, this.element),
          offset: textOffset,
          text: textNode.textContent
        }
      })
    })
  }
}
