/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import { Root, observable, bindView ,storageSync, action } from 'react-mobx-vm'
import View from './View'
import fetch from '../../../lib/fetch'
import history from '../../../history'
import UploadModal from '../UploadModal'

@bindView(View)
export default class Header extends Root {
  @observable uploadModal = UploadModal.create()

  @observable title = 'MarkLive'
  @observable name = 'anonymous'
  @observable email = 'anonymous@abc.com'
  @observable id = ''
  @observable datetime = ''

  @observable avatarVisible = true
  @action setAvatarVisible(avatarVisible) {
    this.avatarVisible = avatarVisible
  }

  @observable visible = true
  @action setVisible(vis) {
    this.visible = vis
  }

  get exitDisabled() {
    return this.logoutIng
  }
  @observable logoutIng = false
  async logout() {
    this.setValue('logoutIng', true)
    const res = await fetch('/user/logout', { toastSucc: true })
    if (res.status === 'ok') {
      history.push('/login')
    }
    this.setValue('logoutIng', false)
  }
}
