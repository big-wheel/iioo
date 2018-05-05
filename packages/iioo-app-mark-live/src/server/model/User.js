/**
 * @file User
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const IModel = require('./IModel')
const bind = require('../util/bindNoSQL')
const md5 = require('md5')

class User extends IModel {
  static calcPassword(password) {
    return md5(password)
  }

  constructor(data) {
    super(data)
  }
}

module.exports = bind('user')(User)
