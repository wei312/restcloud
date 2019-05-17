import React from 'react';
import {Spin,Input,Tag} from 'antd';
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/styles/lowlight';

const frontendConstUrl=URI.CORE_APIDOC.frontendConst;

class JsonConstants extends React.Component {
	constructor(props) {
	    super(props);
	    this.state={
	    	mask:true,
	    	htmlBody:'',
	    }
	}
	componentDidMount(){
      this.loadData();
  	}
  	//通过ajax远程载入数据
	loadData=()=>{
	    AjaxUtils.ajax(frontendConstUrl,'','GET','html','',(data)=>{
	    	this.setState({mask:false,htmlBody:data});
	    });
	}

	render(){
	  return (
	  	<Spin spinning={this.state.mask} tip="Loading..." >
              <div style={{minHeight:600}} >
							<Tag>前端可直接引用:/rest/base/apidocs/front/应用id/constants.js  应用id传all表示全部</Tag> <br/><br/>
              <SyntaxHighlighter language='javascript' style={docco}>{this.state.htmlBody}</SyntaxHighlighter>
              </div>
        </Spin>
		);
	 }
}

export default JsonConstants;
