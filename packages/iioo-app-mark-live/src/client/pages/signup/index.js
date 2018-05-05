/**
 * @file index
 * @author Cuttle Cong
 * @date 2018/5/2
 * @description
 */
import { Root, observable, bindView ,storageSync, action } from 'react-mobx-vm'
import View from './View'

@bindView(View)
export class Login extends Root {

}

export default new Login()
