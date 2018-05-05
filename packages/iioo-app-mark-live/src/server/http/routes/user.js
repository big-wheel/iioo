/**
 * @file user
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */

const { Router } = require('iioo/express')
const User = require('../../model/User')
const wrap = require('../../util/wrapHandle')
const login = require('../handles/login')
const walli = require('../handles/walli')
const userInfo = require('../handles/userInfo')
const w = require('walli')
const r = new Router()

r
  .all('/check_login', login(''), (req, res) => {
    res.succ('')
  })
  .all(
    '/check_not_login',
    wrap(async (req, res) => {
      if (!req.session.userId) {
        res.succ('')
      } else {
        res.fail('')
      }
    })
  )
  .all(
    '/exists',
    wrap(async (req, res) => {
      const ent = req.ent
      if (
        res.walliCheck(
          w.oneOf([
            w.eq({
              name: w.string,
              email: w.string
            }),
            w.eq({
              name: w.string.optional,
              email: w.string
            }),
            w.eq({
              name: w.string,
              email: w.string.optional
            })
          ])
        )
      ) {
        res.succ(await User.exists(ent))
      }
    })
  )
  .all(
    '/login',
    wrap(async (req, res) => {
      if (
        res.walliCheck({
          name: w.string,
          password: w.string
        })
      ) {
        const user = await User.findOne({
          name: req.ent.name,
          password: User.calcPassword(req.ent.password)
        })
        if (user) {
          req.session.userId = user.id
          res.succ('login ok!')
          return
        }

        res.fail('login fail!')
      }
    })
  )
  .all(
    '/logout',
    wrap(async (req, res) => {
      delete req.session.userId
      res.succ('logout')
    })
  )
  .all(
    '/signup',
    walli({
      name: w.string,
      password: w.string,
      email: w.string
    }),
    wrap(async (req, res) => {
      if (
        await User.exists({
          $or: [
            {
              name: req.ent.name
            },
            {
              email: req.ent.email
            }
          ]
        })
      ) {
        res.fail('already existed')
        return
      }

      const result = await User.insert({
        name: req.ent.name,
        email: req.ent.email,
        password: User.calcPassword(req.ent.password),
        datetime: new Date()
      })
      if (result.affectedRows >= 1) {
        res.succ('sign ok!')
      } else {
        res.fail('sign failed!')
      }
    })
  )
  .all('/info', login(), userInfo(), (req, res) => {
    res.succ(req.user)
  })

module.exports = r
