import React from 'react';
import {Spin,Input,Tag} from 'antd';
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/styles/lowlight';

const codeUrl=URI.CORE_PLATFORMTEMLATE.getConfigValue;

class APIGuide extends React.Component {
	constructor(props) {
	    super(props);
	    this.state={
	    	mask:true,
	    	htmlBody:'',
				javaCode:'',
	    }
	}
	componentDidMount(){
      this.loadData();
  	}
  	//通过ajax远程载入数据
	loadData=()=>{
			AjaxUtils.post(codeUrl,{configId:'FrontendJavaScriptCallAPI'},(data)=>{
	    	this.setState({mask:false,htmlBody:data.configValue});
	    });
			AjaxUtils.post(codeUrl,{configId:'JavaRestClientDemo'},(data)=>{
				this.setState({mask:false,javaCode:data.configValue});
			});
	}

	render(){
	  return (
	  	<Spin spinning={this.state.mask} tip="Loading..." >
              <div style={{minHeight:600}}  className='apidoc' >

								<h2>调用API时的公共参数</h2>
								<table style={{width:'100%'}}><tbody>
								<tr>
									<th style={{width:'15%'}} >公共参数ID</th>
									<th style={{width:'20%'}} >参数名</th>
									<th style={{width:'10%'}} >位置</th>
									<th>备注及参考值</th>
								</tr>
								<tr><td>identitytoken</td><td>身份认证token</td><td>header</td><td>除匿名权限的API外其他API必需传入此参数,可以调用/rest/core/auth/login接口登录后返回此token</td></tr>
								<tr><td>systemid</td><td>调用端系统Id</td><td>header</td><td>由管理员统一分配的业务系统id,根据权限策略自定义是否必传</td></tr>
								<tr><td>systempwd</td><td>调用端系统密码</td><td>header</td><td>由管理员统一分配的业务系统密码,根据权限策略自定义是否必传</td></tr>
								<tr><td>traceid</td><td>调用链跟踪traceid</td><td>header</td><td>一般由系统自动创建并加入</td></tr>
								<tr><td>spanid</td><td>调用链跟踪spanid</td><td>header</td><td>一般由系统自动创建并加入</td></tr>
								<tr><td>callBackURL</td><td>请求异步API后的回调API地址</td><td>query</td><td>请求异步API时传入此参数表示执行成功后回调(可以是API的配置ID或API的url)</td></tr>
								<tr><td>queueWaitTime</td><td>请求异步API后每次调度的时间间隔</td><td>query</td><td>请求异步API时如果API是属于等待类型则可以指定每次调度的间隔时间</td></tr>
								<tr><td>callBackToken</td><td>请求异步API后回调时带上此标识token</td><td>query</td><td>异步API执行成功后回调API时将带上此token</td></tr>
								</tbody></table>

							<br></br><h2>JS前端调用示例</h2>
              	<SyntaxHighlighter language='javascript' style={docco}>{this.state.htmlBody}</SyntaxHighlighter>
							   <br></br><h2>Java后端调用示例</h2>
								<SyntaxHighlighter language='java' style={docco}>{this.state.javaCode}</SyntaxHighlighter>
							</div>
        </Spin>
		);
	 }
}

export default APIGuide;
