/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import { Root, observable, bindView } from 'react-mobx-vm'
import SideBar from './SideBar'
import Header from './Header'
import View from './View'
import fetch from '../../lib/fetch'

@bindView(View)
export default class Layout extends Root {
  @observable sidebar = SideBar.create()
  @observable header = Header.create()

  async fillInfo() {
    let res = await fetch('/user/info', { toastError: false })
    if (res.status === 'ok') {
      this.header.assign(res.data)
    }
  }

  async init() {
    await this.fillInfo()
  }
}
