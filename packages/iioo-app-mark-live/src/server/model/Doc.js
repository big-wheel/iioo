/**
 * @file Doc
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const IModel = require('./IModel')
const bind = require('../util/bindNoSQL')

class Doc extends IModel {
  /**
   *
   * @param docId
   * @param userid
   * @return {Promise<Doc>}
   */
  static async belongs(docId, userid) {
    // console.log('userid:', userid)
    // console.log('docId:', docId)
    let res = await Doc.findOne({ userid: Number(userid), id: Number(docId) })
    if (res) {
      return res
    }
    // TODO:
    // public: all
    // protected: team, shared
    // private: null
  }
  // id
  // fileid
  // name
  // datetime
  // permission
}

module.exports = bind('doc')(Doc)
