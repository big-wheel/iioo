/**
 * @file nosql
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
const mysql = require('mysql')
const format = mysql.format

module.exports = function nosql(name) {
  return {
    tableName: format('??', name),
    _selectSql(columns) {
      if (!columns) {
        return `select * from ${this.tableName}`
      }
      if (Array.isArray(columns)) {
        columns = columns.map(col => format('??', col)).join(', ')
      }

      return `select ${columns} from ${this.tableName}`
    },

    _where(query, join = 'and') {
      const keys = Object.keys(query)
      const cond = keys
        .map((key, index, { length }) => {
          // let isLast = index === length - 1
          let val = query[key]
          if (typeof val === 'undefined') {
            return ''
          }
          if (key === '$or') {
            let str = val
              .map(query => {
                return Object.keys(query || {}).length > 1
                  ? `(${this._where(query)})`
                  : this._where(query)
              })
              .join(' or ')
            return val.length > 1 ? `(${str})` : str
          }
          if (val.$eval) {
            val = val.$eval
          } else {
            val = format('?', [val])
          }
          return `${key}=${val}`
        })
        .filter(Boolean)
        .join(' ' + join + ' ')
      return cond
    },

    find(
      query = {},
      { columns, offset, limit, orderBy = [], orderByRule = 'asc' } = {}
    ) {
      const prefix = this._selectSql(columns)
      let suffix = ''
      if (orderBy.length) {
        suffix += ` order by ${orderBy
          .map(by => format('??', by))
          .join(', ')} ${orderByRule}`
      }

      if (typeof limit !== 'undefined') {
        if (typeof offset === 'undefined') {
          offset = 0
        }
        suffix += ` limit ${offset},${limit}`
      }

      const keys = Object.keys(query)
      if (keys.length === 0) {
        return prefix + suffix
      }
      let sql = `${prefix} where ${this._where(query)}${suffix};`
      return sql
    },

    findOne(query, options) {
      return this.find(query, { ...options, limit: 1 })
    },

    insert(collection) {
      let cols = []
      let values = []
      Object.keys(collection).forEach(key => {
        cols.push(format('??', key))
        values.push(format('?', collection[key]))
      })

      return `insert into ${this.tableName} (${cols.join(
        ', '
      )}) values (${values.join(', ')});`
    },

    delete(query = {}) {
      return `delete from ${this.tableName} where ${this._where(query)};`
    },

    count(query, options) {
      return this.find(query, { ...options, columns: 'count(*)' })
    }
  }
}
