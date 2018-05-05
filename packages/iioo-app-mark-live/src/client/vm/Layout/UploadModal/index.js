/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import { Root, observable, bindView, action } from 'react-mobx-vm'
import View from './View'
import fetch from '../../../lib/fetch'

@bindView(View)
export default class UploadModal extends Root {
  @observable file = null

  async _rm(id = this.file && this.file.id) {
    if (!id) {
      return
    }
    const rlt = await fetch('/file/rm', { data: { id }, toastSucc: false })
    return rlt.status === 'ok'
  }

  @action
  setFile(file) {
    this.file = file
  }

  // api
  onAfterUploadDone() {

  }

  @observable visible = false
  @action
  setVisible(vis) {
    this.visible = vis
  }
  @action
  show() {
    this.setVisible(true)
  }
  @action
  hide() {
    this.setVisible(false)
  }
  @action
  reset() {
    this.setFile(null)
  }


  @action
  upload() {}
}
