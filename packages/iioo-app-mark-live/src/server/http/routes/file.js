/**
 * @file file
 * @author Cuttle Cong
 * @date 2018/5/4
 * @description
 */
const { Router } = require('iioo/express')
const multer = require('multer')
const pify = require('pify')
const decompress = require('decompress')
const fs = require('fs')
const nps = require('path')
const md5 = require('md5')
const File = require('../../model/File')

const { resourceFilesPath } = require('../../config')
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, resourceFilesPath)
    },
    filename: function (req, file, cb) {
      let name = md5(file.originalname + Date.now()) + '-' + file.originalname
      cb(null, name)
    }
  })
  // 10M
  // limits: { fileSize: 1024 * 1024 * 10 }
})

const wrap = require('../../util/wrapHandle')
const walli = require('../handles/walli')
const login = require('../handles/login')
const userInfo = require('../handles/userInfo')
const w = require('walli')
const r = new Router()

r
  .post(
    '/upload',
    login(),
    upload.single('file'),
    userInfo(),
    wrap(async (req, res) => {
      const file = req.file
      if (!file) {
        res.fail('fail')
        return
      }
      if (file.size > 1024 * 1024 * 5) {
        // eslint-disable-next-line quotes
        res.fail("file size can't large than 5M.")
        return
      }

      let filePath = file.filename
      if (file.mimetype === 'application/zip') {
        // TODO: decompress zip file contains chinese name
        // let files = await pify(decompress)(file.path, file.path + '_decompress')
      }
      // console.log(file)
      let rlt = await File.insert({
        uploader: req.user.id,
        path: filePath,
        datetime: new Date()
      })
      res.succ(rlt.insertId)
    })
  )
  .all(
    '/rm',
    walli({
      id: w.number
    }),
    wrap(async (req, res) => {
      let obj = { id: req.ent.id }
      const file = await File.findOne(obj)

      if (!file) {
        res.fail('')
        return
      }
      try {
        require('rimraf').sync(nps.join(resourceFilesPath, file.path))
        // eslint-disable-next-line no-empty
      } catch (_) {}

      let rlt = await File.delete(obj)
      if (rlt) {
        res.succ(rlt)
      } else {
        res.fail('')
      }
    })
  )

module.exports = r
