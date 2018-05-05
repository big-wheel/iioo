/**
 * @file bindNoSQL
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const nosql = require('./nosql')
const db = require('../db')

function bind(tableName) {
  const ns = nosql(tableName)
  return function(Model) {
    Object.assign(Model, {
      ...ns,
      nosql: ns,
      async find() {
        const list = await db.query(ns.find.apply(ns, arguments))
        return list.map(x => new Model(x))
      },
      async findOne() {
        const data = await db.query(ns.findOne.apply(ns, arguments))
        if (data && data.length) {
          return new Model(data[0])
        }
        return null
      },
      async exists(query) {
        return !!await Model.findOne(query)
      },
      async insert(collection) {
        return await db.query(ns.insert.apply(ns, [collection]))
      },
      async delete(query) {
        return (await db.query(ns.delete.apply(ns, [query]))).affectedRows
      },
      async count(query, options) {
        const sql = ns.count.apply(ns, [query, options])
        const data = await db.query(sql)
        if (data && data.length) {
          return data[0]['count(*)']
        }
        return -1
      }
    })
    return Model
  }
}

module.exports = bind
