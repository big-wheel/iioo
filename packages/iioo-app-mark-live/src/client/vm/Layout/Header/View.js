/**
 * @file View
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */

import * as React from 'react'
import { Layout, Dropdown, Row, Col, Avatar, Menu, Icon } from 'antd'
const { Header } = Layout
import { h } from 'react-mobx-vm'

import './style.less'

export default class View extends React.Component {
  get Menu() {
    return (
      <Menu>
        <Menu.Item key="-1">
          <div
            onClick={() => {
              this.local.uploadModal.show()
            }}
          >
            Upload Doc
          </div>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="0">
          <div>Name: {this.local.name}</div>
        </Menu.Item>
        <Menu.Item key="1">
          <div>Email: {this.local.email}</div>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3" disabled={this.local.exitDisabled}>
          <div onClick={this.local.logout.bind(this.local)}>Exit</div>
        </Menu.Item>
      </Menu>
    )
  }

  render() {
    if (!this.local.visible) {
      return null
    }

    return (
      <Header style={{ background: '#fff', padding: 0 }}>
        {h(this.local.uploadModal)}
        <div className={'container'}>
          <Row type="flex" justify="space-around" align="middle">
            <Col span={20}>
              <h3>{this.local.title}</h3>
            </Col>
            {this.local.avatarVisible && (
              <Col offset={2} span={2}>
                <Dropdown overlay={this.Menu}>
                  <Avatar
                    style={{
                      float: 'right',
                      marginRight: 10,
                      backgroundColor: '#333',
                      verticalAlign: 'middle',
                      textAlign: 'center'
                    }}
                    size="large"
                  >
                    {(this.local.name[0] || '').toUpperCase()}
                  </Avatar>
                </Dropdown>
              </Col>
            )}
          </Row>
        </div>
      </Header>
    )
  }
}
