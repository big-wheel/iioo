/**
 * @file: templateFactory
 * @author: Cuttle Cong
 * @date: 2018/1/17
 * @description:
 */
import template from 'lodash.template'
import { resolve } from 'path'
import { readFileSync } from 'fs'

export default {
  entry: template(readFileSync(resolve(__dirname, '../templates/entry.template.js')).toString())
}
