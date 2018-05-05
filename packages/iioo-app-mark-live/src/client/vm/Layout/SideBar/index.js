/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import { Root, observable, bindView ,storageSync, action } from 'react-mobx-vm'
import View from './View'

@bindView(View)
export default class Header extends Root {
  @storageSync
  @observable collapsed = false
  @action setCollapsed(collapsed) {
    this.collapsed = collapsed
  }

  @observable visible = true
  @action setVisible(vis) {
    this.visible = vis
  }
}
