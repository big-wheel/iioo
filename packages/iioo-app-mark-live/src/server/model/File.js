/**
 * @file File
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const IModel = require('./IModel')
const bind = require('../util/bindNoSQL')

class File extends IModel {
}

module.exports = bind('file')(File)
