/**
 * @file View
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */

import * as React from 'react'
import { Layout, Menu, Icon } from 'antd'
const { Sider } = Layout
import { Link } from 'react-router'
const SubMenu = Menu.SubMenu

import './style.less'

export default class View extends React.Component {
  render() {
    if (!this.local.visible) {
      return null
    }

    return (
      <Sider
        collapsible
        collapsed={this.local.collapsed}
        onCollapse={collapsed => this.local.setCollapsed(collapsed)}
      >
        <div className="logo">Logo</div>
        <Menu theme="dark" className={'sidebar'} defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1">
            <Icon type="home" />
            <Link to={'/'}>Home</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Icon type="desktop" />
            <span>Discover</span>
          </Menu.Item>
          <SubMenu
            key="sub1"
            title={
              <span>
                <Icon type="user" />
                <span>User</span>
              </span>
            }
          >
            <Menu.Item key="3">Information</Menu.Item>
            <Menu.Item key="4">Setting</Menu.Item>
            <Menu.Item key="5">Alex</Menu.Item>
          </SubMenu>
          <SubMenu
            key="sub2"
            title={
              <span>
                <Icon type="team" />
                <span>Team</span>
              </span>
            }
          >
            <Menu.Item key="6">Team 1</Menu.Item>
            <Menu.Item key="8">Team 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="9">
            <Icon type="file" />
            <span>File</span>
          </Menu.Item>
        </Menu>
      </Sider>
    )
  }
}
