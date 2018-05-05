import * as React from 'react'
import { Form, Icon, Input, Button, Checkbox } from 'antd'
import { inject } from 'react-mobx-vm'
const FormItem = Form.Item
import fetch from '../../lib/fetch'
import history from '../../history'
import { Link } from 'react-router'
import { authNotLogin } from '../../lib/util/authLogin'

@authNotLogin
@inject
class NormalLoginForm extends React.Component {
  componentWillMount() {
    this.app.sidebar.setVisible(false)
    this.app.header.setAvatarVisible(false)
  }
  componentWillUnmount() {
    this.app.sidebar.setVisible(true)
    this.app.header.setAvatarVisible(true)
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const res = await fetch('/user/login', {
          data: values,
          toastSucc: true
        })

        if (res.status === 'ok') {
          history.push('/')
          this.app.fillInfo()
        }
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please input your username or email!' }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username or Email"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </FormItem>
        <FormItem>
          {/*{getFieldDecorator('remember', {*/}
          {/*valuePropName: 'checked',*/}
          {/*initialValue: true*/}
          {/*})(<Checkbox>Remember me</Checkbox>)}*/}
          <a className="login-form-forgot" href="">
            Forgot password
          </a>
          <br />
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
          Or <Link to="/signup">register now!</Link>
        </FormItem>
      </Form>
    )
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm)

export default WrappedNormalLoginForm
