/**
 * @file IModel
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */

module.exports = class IModel {
  constructor(data = {}) {
    Object.assign(this, data)
  }
}
