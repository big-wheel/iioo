/**
 * @file View
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import * as React from 'react'
import { h } from 'react-mobx-vm'
import { Layout, Breadcrumb } from 'antd'
const { Header, Content, Footer } = Layout

import './style.less'

export default class View extends React.Component {
  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        {/*{h(this.local.sidebar)}*/}
        <Layout>
          {h(this.local.header)}
          <Content className="container" style={{ margin: '0 16px' }}>
            {this.props.children}
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            <a href={'https://github.com/imcuttle'} target={'_blank'}>
              MarkLive
            </a>{' '}
            ©2018 Created by{' '}
            <a href={'https://github.com/imcuttle'} target={'_blank'}>
              Imcuttle
            </a>
          </Footer>
        </Layout>
      </Layout>
    )
  }
}
