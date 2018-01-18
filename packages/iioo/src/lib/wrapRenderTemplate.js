/**
 * @file: templateFactory
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
import templateFactory from './templateFactory'
import fs from 'fs'

export default Object
  .keys(templateFactory)
  .reduce((collection, name) => {
    collection[name] = function (data, filename) {
      fs.writeFileSync(filename, templateFactory[name](data))
    }
    return collection
  }, {})
