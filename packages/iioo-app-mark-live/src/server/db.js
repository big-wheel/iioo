/**
 * @file db
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const mysql = require('mysql')
const pify = require('pify')

const config = {
  host: 'localhost',
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'mark-live'
}

const database = mysql.createPool(config)

const db = {
  query: function() {
    const argArr = Array.from(arguments)
    const cb = argArr.splice(-1)[0]

    database.getConnection(function(err, dbConnection) {
      if (err) {
        /* do something */ return
      }
      dbConnection.query.apply(
        dbConnection,
        argArr.concat(function() {
          dbConnection.release() // return to the pool
          cb.apply(null, Array.from(arguments))
        })
      )
    })
  },
  format: mysql.format,
  likeStrFilter: function(s) {
    return '%' + s.replace(/([_%])/g, '*' + RegExp.$1) + '%'
  }
}

db.query = pify(db.query)
module.exports = db

process.on('exit', () => {
  database.end()
})
