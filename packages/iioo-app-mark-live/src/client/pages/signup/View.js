import * as React from 'react'
import { Form, Icon, Input, Button, Checkbox } from 'antd'
import { inject } from 'react-mobx-vm'
const FormItem = Form.Item
import fetch from '../../lib/fetch'
import { Link } from 'react-router'
import { authNotLogin } from '../../lib/util/authLogin'
import history from '../../history'
import debounce from 'lodash-decorators/debounce'

@authNotLogin
@inject
class NormalLoginForm extends React.Component {
  @debounce(200)
  async validatorName(rule, value, callback, source, options) {
    const res = await fetch('/user/exists', {
      data: { name: value },
      toastError: false
    })
    if (res.data) {
      callback(['Already Existed'])
      return
    }
    callback([])
  }

  @debounce(200)
  async validatorEmail(rule, value, callback, source, options) {
    const res = await fetch('/user/exists', {
      data: { email: value },
      toastError: false
    })
    if (res.data) {
      callback(['Already Existed'])
      return
    }
    callback([])
  }

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
        const res = await fetch('/user/signup', {
          data: values,
          toastSucc: true
        })
        if (res.status === 'ok') {
          history.push('/login')
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
            rules: [
              { required: true, message: 'Please input your username!' },
              {
                validator: this.validatorName
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('email', {
            rules: [
              { required: true, message: 'Please input your email!' },
              {
                type: 'email',
                message: 'The input is not valid E-mail!'
              },
              {
                validator: this.validatorEmail
              }
            ]
          })(
            <Input
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Email"
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
          {getFieldDecorator('passwordAgain', {
            rules: [
              { required: true, message: 'Please input your Password again!' }
            ]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password Again"
            />
          )}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            className="regsiter-form-button"
          >
            Register
          </Button>
        </FormItem>
      </Form>
    )
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm)

export default WrappedNormalLoginForm
