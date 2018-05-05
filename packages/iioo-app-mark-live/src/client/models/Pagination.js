/**
 * @file Pagination
 * @author Cuttle Cong
 * @date 2018/5/4
 * @description
 */
import { Root, observable, computed } from 'react-mobx-vm'

export default class Pagination extends Root {
  @observable pageSize = 10
  @observable pageNum = 1
  @observable total = 0

  @computed
  get param() {
    return this.toJSON()
  }

  toJSON() {
    return {
      pageSize: this.pageSize,
      pageNum: this.pageNum
    }
  }
}
