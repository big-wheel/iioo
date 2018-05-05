/**
 * @file process
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const session = require('express-session')
const { Verifiable, leq } = require('walli')
const user = require('./routes/user')
const file = require('./routes/file')
const doc = require('./routes/doc')
const MySQLStore = require('express-mysql-session')(session)

const options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'mark-live'
}
const sessionStore = new MySQLStore(options)

module.exports = function process(app) {
  app.session = session({
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: 'marklive cat',
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
  // let use = app.use
  app.use(app.session)

  app.use(function(req, res, next) {
    if (req.method === 'POST') {
      req.ent = req.body
    } else {
      req.ent = req.query
    }
    next()
  })

  app.use(function(req, res, next) {
    res.succ = function(data) {
      res.status(200).json({ status: 'ok', data })
    }
    res.fail = function(message) {
      res.status(200).json({ status: 'fail', message })
    }
    next()
  })

  app.use('/api/user', user)
  app.use('/api/file', file)
  app.use('/api/doc', doc)

  app.use(function errorHandler(err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
  })
}
