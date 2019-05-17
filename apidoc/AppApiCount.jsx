import React from 'react';
import {Table,Card,Icon,Row,Col,Tag,Avatar } from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import { browserHistory } from 'react-router'

const LISTURL=URI.CORE_APIDOC.listAllApps;

class AppApiCount extends React.Component {
  constructor(props) {
    super(props);
    this.onMenuSelected=this.props.onMenuSelected; //点击应用时相当于选中菜单
    this.state={
      appList:[],
      mask:true,
    }
  }

  componentDidMount(){
  	this.loadData();
  }

   loadData=()=>{
  	this.setState({mask:true});
	   AjaxUtils.get(LISTURL,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({appList:data,mask:false});
          }
      });
	}

  render(){
    let appCard=this.state.appList.map(item=>{
        return (
               <Card.Grid  key={item.appId} style={{maxHeight:'170px'}}>
                  <Card bodyStyle={{ padding: 0,fontSize:'14px' }} bordered={false}  onClick={this.onMenuSelected.bind(this,'ListApiDocsByAppId',item.appId)}>
                    <Card.Meta
                      title={(
                        <div>
                          <Avatar style={{ backgroundColor:"#2db7f5", verticalAlign: 'middle' }}  size="large" >{item.serviceCount}</Avatar>
                          {' '} {item.appName}
                        </div>
                      )}
                      description={(
                        <span>共
                          <span style={{color:"#108ee9"}}>{item.testCaseCount}</span>个测试用例,
                          测试覆盖率<span style={{color:"#108ee9"}}>{item.overRatePer}</span>
                          通过率<span style={{color:"#108ee9"}}>{item.passRatePer}</span>
                        </span>
                      )}
                    />
                  <br/>
                    <div style={{float:'right',color:'#ccc',fontSize:'12px'}}>
                      所有者:{item.owner}
                    </div>
                  </Card>
                </Card.Grid>);
              });

    return (
      <div>
        <Card
              style={{ marginLeft:'20px',marginRight:"20px",marginTop:'5px',padding:'2px' }}
              bordered={false}
              loading={this.state.mask}
              bodyStyle={{ padding: 0 }}
         >
           {appCard}
       </Card>
        </div>
    );
  }
}

export default AppApiCount;
