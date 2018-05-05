/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import { Root, observable, reaction, bindView } from 'react-mobx-vm'
import View from './View'
import fetch from '../../lib/fetch'

@bindView(View)
export class PlayGround extends Root {
  @observable id
  @observable content = ''
  @observable auth = true

  @reaction('id')
  async fetchView() {
    if (!this.id) {
      return
    }
    let text = await fetch(
      `/doc/view/${this.id}`,
      {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        }
      },
      'text'
    )
    try {
      let parsed = JSON.parse(text)
      // error
      if (parsed.status !== 'fail') {
        throw new Error('placeholder')
      }
      this.setValue('auth', false)
    } catch (e) {
      // html?
      this.setValue('auth', true)
      this.setValue('content', text)
    }
  }

  async init() {}
}

export default PlayGround.create()
