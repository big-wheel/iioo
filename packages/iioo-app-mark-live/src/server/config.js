/**
 * @file config
 * @author Cuttle Cong
 * @date 2018/5/4
 * @description
 */
const nps = require('path')
const mkdirp = require('mkdirp')

export const resourcePath = nps.join(__dirname, '../../res')
export const resourceFilesPath = nps.join(resourcePath, 'files')

mkdirp.sync(resourceFilesPath)
