import * as React from 'react'
import { Form, Icon, Input, Button, Checkbox } from 'antd'
import { inject, mapping, reactAutorun, reactReaction } from 'react-mobx-vm'
const FormItem = Form.Item
import fetch from '../../lib/fetch'
import history from '../../history'
import { Link } from 'react-router'
import auth from '../../lib/util/authLogin'
const connect = require('./connect')

@auth
@inject
@mapping({ 'params.id': 'id' })
export default class PlayGround extends React.Component {
  get local() {
    return this.props.local
  }
  get app() {
    return this.props.app
  }

  componentWillMount() {}

  reset() {
    this._t && clearTimeout(this._t)
    this.socket && this.socket.close()
  }

  @reactReaction('local.id')
  autoChangedId() {
    if (this.local.id) {
      this.reset()
      this._t = setTimeout(() => {
        this.socket = connect(this.playground.contentDocument.body, {
          userId: this.app.header.id,
          docId: this.local.id,
          markOptions: {
            window: this.playground.contentWindow
          }
        })
        this._t = null
      }, 200)
    }
  }

  componentDidMount() {
    this.autoChangedId()

    // console.log(this.playground)
    this.playground.style.height =
      this.playground.parentElement.clientHeight + 'px'
  }

  componentWillUnmount() {
    this.reset()
  }

  render() {
    return (
      <iframe
        style={{
          border: 'none',
          display: 'block',
          width: '100%'
        }}
        src={this.local.src}
        ref={r => (this.playground = r)}
        // dangerouslySetInnerHTML={{ __html: this.local.content }}
      />
    )
  }
}
