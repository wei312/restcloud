import React from 'react';
import { Form, Select, Input, Button, message,Spin,Upload,Icon,Row,Col,Radio} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import PermissionSelect from '../../core/components/PermissionSelect';
import UserAsynTreeSelect from '../../core/components/UserAsynTreeSelect';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_GATEWAY_APPCONFIG.getById;
const saveDataUrl=URI.CORE_GATEWAY_APPCONFIG.save;


class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    this.loadData(); //载入表单数据
  }

  loadData(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      //载入表单数据
      this.setState({mask:true});
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                message.error(data.msg);
              }else{
                this.setState({mask:false});
                this.props.close(true);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form  >
        <FormItem  label="应用名称"   {...formItemLayout4_16} >
          {
            getFieldDecorator('gatewayAppName', {
              rules: [{ required: true, message: 'Please input the AppName!' }]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem  label="应用Id"   {...formItemLayout4_16}  hasFeedback >
          {
            getFieldDecorator('gatewayAppId',{rules: [{ required: true}]})
            (<Input placeholder="应用唯一id"  />)
          }
        </FormItem>
        <FormItem label='绑定权限' labelCol={{ span: 4 }}  wrapperCol={{ span: 16 }} help='绑定权限后只有此权限的用户才能访问此应用' >
        {
          getFieldDecorator('permissionIds')
          (<PermissionSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}}  />)
        }
        </FormItem>
        <FormItem
          label="密钥"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='本应用可能对外或对内调用API时使用的数据加密密钥(如:企业微信应用的密钥等)'
        >{
          getFieldDecorator('secretKey')
          (<Input type='password' />)
          }
        </FormItem>
        <FormItem
          label="认证用户id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="后端API接口需要认证时用户id(需要配合控制策略使用)"
        >{
          getFieldDecorator('userId')
          (<Input addonBefore={<Icon type="user" />} />
          )}
        </FormItem>
        <FormItem
          label="认证密码"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="后端API接口需要认证则时的密码(需要配合控制策略使用)"
        >{
          getFieldDecorator('password')
          (<Input addonBefore={<Icon type="lock" />} type="password" />
          )}
        </FormItem>
        <FormItem
          label="应用负责人"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='在本应的API或路由出现异常或发出警告信息时用来接收提醒消息'
        >{
          getFieldDecorator('owner',{rules: [{ required: false}],initialValue:''})
            (<UserAsynTreeSelect />)
          }
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='应用备注'
        >{
          getFieldDecorator('remark')
          (<Input.TextArea autosize />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewApp = Form.create()(form);

export default NewApp;
