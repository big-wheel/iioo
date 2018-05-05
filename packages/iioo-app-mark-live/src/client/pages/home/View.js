/**
 * @file View
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import { inject } from 'react-mobx-vm'
import * as React from 'react'
import { Layout, List, Row, Col, Avatar, Tooltip, Card, Button } from 'antd'
import auth from '../../lib/util/authLogin'
import { Link } from 'react-router'

// TODO: preload placeholder
@auth
@inject
export default class View extends React.Component {
  componentWillMount() {
    this.app.header.uploadModal.onAfterUploadDone = () => {
      this.local.refresh()
    }
  }
  componentWillUnmount() {
    delete this.app.header.uploadModal.onAfterUploadDone
  }

  get local() {
    return this.props.local
  }

  renderItem = item => (
    <List.Item>
      <List.Item.Meta
        avatar={<Avatar size={'large'}>{item.name[0].toUpperCase()}</Avatar>}
        title={<Link to={`/playground/${item.id}`} target={'_blank'}>{item.name}</Link>}
        description={item.description}
      />
    </List.Item>
  )

  render() {
    return (
      <div>
        <Card
          className={'margin-top-20 margin-bottom-10'}
          title="My Documents"
          extra={<a href="#">More</a>}
        >
          <Row>
            <List
              itemLayout={'horizontal'}
              dataSource={this.local.myDocuments.slice()}
              renderItem={item => <Col span={12}>{this.renderItem(item)}</Col>}
            />
          </Row>
        </Card>

        <Card
          className={'margin-top-20 margin-bottom-10'}
          title="My Teams"
          extra={<a href="#">More</a>}
        >
          <Button ghost>Default</Button>
        </Card>
      </div>
    )
  }
}
