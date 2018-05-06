/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import { Root, observable, reaction, bindView } from 'react-mobx-vm'
import View from './View'
import fetch, { concat } from '../../lib/fetch'

@bindView(View)
export class PlayGround extends Root {
  @observable id
  // @observable content = ''
  @observable src = ''
  @observable auth = true

  @reaction('id')
  async fetchView() {
    if (!this.id) {
      return
    }

    this.setValue('src', concat(`/doc/view/${this.id}`))
  }

  async init() {}
}

export default PlayGround.create()
