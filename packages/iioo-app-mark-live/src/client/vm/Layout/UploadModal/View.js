/**
 * @file View
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */

import * as React from 'react'
import {
  Modal,
  Select,
  Input,
  Upload,
  Tooltip,
  message,
  Form,
  Layout,
  Menu,
  Icon
} from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const { Sider } = Layout
import { Link } from 'react-router'
const SubMenu = Menu.SubMenu
import { observer } from 'mobx-react'

import './style.less'
import history from '../../../history'
import fetch from '../../../lib/fetch'

@Form.create()
@observer
export default class View extends React.Component {
  get local() {
    return this.props.local
  }

  componentDidMount() {
    this.reset()
  }

  reset() {
    this.props.form.setFieldsValue({
      name: '',
      permission: 'public',
      description: ''
    })
    this.local.reset()
  }

  render() {
    return (
      <Modal
        maskClosable={false}
        title="Upload Document"
        visible={this.local.visible}
        onOk={this.handleSubmit}
        onCancel={() => {
          this.local._rm()
          this.local.hide()
          this.reset()
        }}
        // okText="确认"
        // cancelText="取消"
      >
        {this.renderForm()}
      </Modal>
    )
  }

  handleSubmit = e => {
    e && e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        if (!this.local.file || !this.local.file.id) {
          message.error('Please upload a file.')
          return
        }

        const res = await fetch('/doc/create', {
          data: {
            fileid: this.local.file.id,
            ...values
          },
          toastSucc: true
        })
        if (res.status === 'ok') {
          this.local.hide()
          this.reset()
          this.local.onAfterUploadDone()
        }
      }
    })
  }

  renderForm() {
    const props = {
      name: 'file',
      multiple: false,
      action: '/api/file/upload',
      beforeUpload(file) {
        if (file.type !== 'text/html' && file.type !== 'application/zip') {
          message.error('file type only supports ' + 'html, htm or zip')
          return false
        }
      },
      fileList: [this.local.file].filter(Boolean),
      onRemove: file => {
        this.local._rm(file.id)
        this.local.setFile(null)
      },
      onChange: info => {
        const file = info.file
        const status = info.file.status
        if (!file.originFileObj) {
          return
        }
        file.name = file.originFileObj.name

        if (file.response) {
          if (status === 'done' && file.response.status === 'ok') {
            file.id = file.response.data
            message.success(
              `${file.originFileObj.name} file uploaded successfully.`
            )
            if (file.name && !this.props.form.getFieldsValue().name) {
              this.props.form.setFieldsValue({ name: file.name })
            }
          } else if (status === 'error' || file.response.status !== 'ok') {
            this.local._rm()
            this.local.setFile(null)
            message.error(
              `${file.originFileObj.name} file upload failed: ${file.response
                .message || ''}`
            )
            return
          }
        }
        this.local.setFile(file)
      }
    }
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 }
      }
    }

    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSubmit} ref={r => (this.form = r)}>
        <Upload.Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a zip packed files upload.
          </p>
        </Upload.Dragger>
        <FormItem
          className={'margin-top-10'}
          {...formItemLayout}
          label={'Name'}
        >
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: 'Please input Doc name!'
              }
            ]
          })(<Input autoComplete={'off'} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={'Permission'}>
          {getFieldDecorator('permission', {
            rules: [
              {
                required: true,
                message: 'Please select one permission!'
              }
            ]
          })(
            <Tooltip
              title={
                <div>
                  <div>Public: All could be editable.</div>
                  <div>Protected: Team or User could be editable.</div>
                  <div>Private: Self could be editable.</div>
                </div>
              }
            >
              <Select>
                <Option value="public">Public</Option>
                <Option value="protected">Protected</Option>
                <Option value="private">private</Option>
              </Select>
            </Tooltip>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={'Description'}>
          {getFieldDecorator('description', {})(
            <Input.TextArea autosize={{ minRows: 3 }} />
          )}
        </FormItem>
      </Form>
    )
  }
}
