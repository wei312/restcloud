import React from 'react';
import { Form, Icon, Input, Button, Checkbox,Card,Spin,Select } from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
import { browserHistory } from 'react-router'
import md5 from 'md5'

const FormItem = Form.Item;
const loginApi=URI.CONTEXT.loginApi;
const loginbgUrl="/res/iconres/images/login-bg.png";
const Option = Select.Option;

class NormalLoginForm extends React.Component {

  constructor(props){
    super(props);
    this.state={
      mask:false,
      loginUserId:'',
      serverList:[],
      currentServerHost:host,
    };
  }

  componentDidMount(){
    let loginUserId=AjaxUtils.getCookie("loginUserId");
    //设置可选的服务器列表
    let serverList=localStorage.getItem("serverHost") || "";
    let serverListArray=serverList.split(",");
    let currentServerHost=localStorage.getItem("currentServerHost") || serverListArray[serverListArray.length-1]; //从最后一个登录成功的地址中取
    if(currentServerHost!==undefined && currentServerHost!==""){
      this.setState({currentServerHost:currentServerHost}); //登录地址改为最后一次登录的服务器地址
    }
    this.setState({loginUserId:loginUserId,serverList:serverListArray});
  }

  onSubmit = (e) => {
    let type=this.props.form.getFieldValue("userType");
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let remember=this.props.form.getFieldValue("remember");
          let loginUserId=this.props.form.getFieldValue("userName");
          let serverHost=this.props.form.getFieldValue("serverHost");
          let url=serverHost+loginApi;
          values.password=md5(values.password); //md5加密一次
          if(remember){AjaxUtils.setCookie("loginUserId",loginUserId,300);}
          this.setState({mask:true});
          AjaxUtils.post(url,values,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError("用户名或密码错误!");
              }else{
                let adminIndexUrl=data.adminIndexUrl; //登录成功后的转向页面
                let identitytoken=data[URI.cookieId]; //登录成功后系统返回的token
                AjaxUtils.setCookie(URI.cookieId,identitytoken); //把服务器返回的登录token放置到cookie中去
                AjaxUtils.setCookie("userName",data.userName);
                AjaxUtils.setCookie("userId",data.userId);
                // AjaxUtils.setCookie("deptName",data.deptName);
                // AjaxUtils.setCookie("deptCode",data.deptCode);
                // AjaxUtils.setCookie("jobDesc",data.jobDesc);
                AjaxUtils.addServerHost(serverHost); //追加到成功登录的服务器列表中
                AjaxUtils.setCurrentServerHost(serverHost); //修改全局变量到此服务器
                // alert("login ok="+document.cookie);
                if(adminIndexUrl===undefined || adminIndexUrl===null || adminIndexUrl===''){
                  adminIndexUrl=URI.adminIndexUrl;
                }
                if(serverHost===host){
                  browserHistory.push(adminIndexUrl); //用户登录成功转入admin主界面，没有切换服务器
                }else{
                  location.replace(adminIndexUrl); //切换服务器
                }
              }
          });
      }
    });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const optionsItem = this.state.serverList.map(item => <Option key={item} value={item}>{item}</Option>);
    return (
      <div style={{width:'100%',minHeight:'550px',background:`#ffffff url(${loginbgUrl})`,backgroundPosition:'-35px' }} >
        <div style={{background:'#ffffff',padding:'5px',height:'70px'}} >
          <div style={{float:'left'}}><img src={URI.logoUrl} /> </div>
          <div style={{borderLeft:"1px solid #ebedee",position:'relative',left:'10px',height:"35px",top:'10px',float:'left'}} />
          <div style={{position:'relative',top:'10px',left:'20px',float:'left',fontSize:'22px'}}>系统登录</div>
        </div>

        <Card title="系统登录" style={{position:'absolute',left:'50%',top:'50%',margin:'-260px 0 0 -230px',width:'500px',minHeight:'380px',float:'center'}}>
        <Spin spinning={this.state.mask} tip="Loading..." style={{width:'100%',height:'100%'}}>
          <Form onSubmit={this.onSubmit} style={{margin:'50 50 50 0'}}>
            <FormItem label="服务器:" >
              {getFieldDecorator('serverHost', {
                initialValue:this.state.currentServerHost,
                rules: [{ required: true}],
              })(
                <Select mode='combobox' size='large' >
                 {optionsItem}
                </Select>
              )}
            </FormItem>
            <FormItem label="用户名:" >
              {getFieldDecorator('userName', {
                initialValue: this.state.loginUserId,
                rules: [{ required: true, message: 'Please input your username!' }],
              })(
                <Input size='large' prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" />
              )}
            </FormItem>
            <FormItem label="密码:"  >
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input size='large' prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true,
              })(
                <Checkbox >Remember me</Checkbox>
              )}
              <Button type="primary" size='large' htmlType="submit" style={{width:'100%'}}>
                Login
              </Button>
              建议使用Chrome浏览器登录本系统...
            </FormItem>
          </Form>
          </Spin>
        </Card>
      </div>
    );
  }
}

const LoginForm = Form.create()(NormalLoginForm);

export default LoginForm;
