/**
 * @file Doc
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const IModel = require('./IModel')
const bind = require('../util/bindNoSQL')

class Highlight extends IModel {
  constructor(data = {}) {
    data = { ...data }
    if (data.chunks && typeof data.chunks === 'string') {
      data.chunks = JSON.parse(data.chunks)
    }
    super(data)
  }
  // id
  // docid
  // color
  // chunks
  // datetime
}

module.exports = bind('highlight')(Highlight)
