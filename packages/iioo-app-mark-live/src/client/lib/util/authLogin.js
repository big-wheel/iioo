/**
 * @file auth
 * @author Cuttle Cong
 * @date 2018/5/3
 * @description
 */
import { observer } from 'mobx-react'
import * as React from 'react'
import fetch from '../fetch'
import history from '../../history'
import displayName from './displayName'

function createAuthView(View, url, callback) {
  View = observer(View)

  class AuthLoginView extends React.Component {
    static displayName = `AuthLogin-${displayName(View)}`
    state = {
      auth: false
    }
    async authCheck() {
      let res = await fetch(url)
      if (res.status === 'ok') {
        this.setState({ auth: true })
      } else {
        callback()
      }
    }

    get local() {
      return this.props.local
    }

    get app() {
      return this.props.app
    }

    async componentDidMount() {
      await this.authCheck()
    }

    render() {
      if (!this.state.auth) {
        return null
      }
      return <View {...this.props}>{this.props.children}</View>
    }
  }

  return AuthLoginView
}

export default function authLogin(View) {
  return createAuthView(View, '/user/check_login', () => history.push('/login'))
}

export function authNotLogin(View) {
  return createAuthView(View, '/user/check_not_login', () => history.push('/'))
}
