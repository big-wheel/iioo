/**
 * @file Document
 * @author Cuttle Cong
 * @date 2018/5/4
 * @description
 */
import { Root, observable } from 'react-mobx-vm'

export default class Document extends Root {
  @observable id
  @observable userid
  @observable fileid
  @observable name
  @observable description
  @observable datetime
}
