/**
 * @file IPersistence
 * @author Cuttle Cong
 * @date 2018/5/1
 * @description
 */

module.exports = class IPersistence {
  static key = 'IPersistence'

  constructor(element, options) {
    this.element = element
    this.options = options
    this.map = new Map()
  }

  apply() {

  }

  async save() {
    this.options.save &&
      (await this.options.save(this.constructor.key, this.map))
  }
  async fetch() {
    const data =
      this.options.fetch && (await this.options.fetch(this.constructor.key))
    if (data) {
      Object.keys(data).forEach(key => {
        this.map.set(key, data[key])
      })
    }
  }
}
