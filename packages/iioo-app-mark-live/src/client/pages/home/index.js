/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import {
  Root,
  observable,
  List,
  bindView,
  storageSync,
  action
} from 'react-mobx-vm'
import View from './View'
import Document from '../../models/Document'
import fetch from '../../lib/fetch'

@bindView(View)
export class Home extends Root {
  @observable myDocuments = List.create([], Document)

  async fetchMyDocuments() {
    let res = await fetch('/doc/list', {
      data: {
        pageSize: 10,
        pageNum: 1
      }
    })
    if (res.status === 'ok') {
      this.myDocuments.assign(res.data.list)
    }
  }

  async refresh() {
    await this.fetchMyDocuments()
  }

  async init() {
    await this.refresh()
  }
}

export default new Home()
