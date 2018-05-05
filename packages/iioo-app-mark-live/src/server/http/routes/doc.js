/**
 * @file file
 * @author Cuttle Cong
 * @date 2018/5/4
 * @description
 */
const { Router } = require('iioo/express')
const nps = require('path')
const Doc = require('../../model/Doc')
const File = require('../../model/File')
const wrap = require('../../util/wrapHandle')
const walli = require('../handles/walli')
const login = require('../handles/login')
const page = require('../handles/page')
const userInfo = require('../handles/userInfo')
const w = require('walli')
const { resourceFilesPath } = require('../../config')
const r = new Router()

r
  .all(
    '/create',
    walli({
      fileid: w.number,
      name: w.string,
      permission: w.oneOf(['private', 'protected', 'public'])
    }),
    login(),
    userInfo(),
    wrap(async (req, res) => {
      const row = await Doc.insert({
        datetime: new Date(),
        userId: req.user.id,
        name: req.ent.name,
        description: req.ent.description,
        fileid: req.ent.fileid,
        permission: req.ent.permission
      })

      if (row.insertId) {
        res.succ(row.insertId)
      } else {
        res.fail('create failed!')
      }
    })
  )
  .all(
    '/list',
    login(),
    userInfo(),
    page(),
    wrap(async (req, res) => {
      const { pageSize, pageNum, orderBy = [], orderByRule } = req.ent

      const list = await Doc.find(
        {},
        {
          limit: pageSize,
          offset: (pageNum - 1) * pageSize,
          orderBy,
          orderByRule
        }
      )
      res.succ({
        list: list,
        total: await Doc.count({ userid: req.user.id })
      })
    })
  )

const handles = [
  login(),
  userInfo(),
  wrap(async (req, res) => {
    // TODO: team and user
    const { id } = req.params
    const path = req.params[0]
    let doc = await Doc.belongs(id, req.user.id)
    if (!doc) {
      return res.fail('no auth!')
    }
    let file = await File.findOne({ id: doc.fileid })
    if (!file) {
      return res.fail(`fileid: ${doc.fileid} not found!`)
    }
    let filePath = nps.join(resourceFilesPath, file.path, path || '')

    // res.type(nps.extname(filePath))
    // let type = res.getHeader('content-type')
    // res.setHeader('Content-Type', type.replace('; charset=utf-8', ''))
    res.sendFile(filePath)
  })
]

r.all('/view/:id/*?', handles)
r.all('/view/:id', handles)

module.exports = r
