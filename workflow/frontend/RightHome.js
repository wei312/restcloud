import React from 'react';
import {List, Card,Icon,Spin,Avatar,Badge,Tag} from 'antd';
import { browserHistory } from 'react-router'
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as CURURI  from '../utils/constants';

const loadDataUrl=CURURI.WORKFLOW_FRONTEND.ListStartProcess;
const { Meta } = Card;

class RightHome extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      modules:[],
    };
  }

  componentDidMount(){
    AjaxUtils.get(loadDataUrl,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({modules:data.data,mask:false});
        }
    });
  }

  openUrl=(processId)=>{
    let url=CURURI.workflowHost+"/rule?wf_num=R_S003_B036&wf_processid="+processId;
    window.open(url);
  }

  render() {
    let defaultImg='/res/iconres/images/portal/workflow.png';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <List
          grid={{ gutter: 20, column: 4 }}
          dataSource={this.state.modules.list}
          renderItem={item => (
            <List.Item>
              <Card hoverable={true} style={{padding:'0px 0 0px 0',backgroundColor:item.backgroundColor||'#fff'}} onClick={this.openUrl.bind(this,item.Processid)} >
                <Meta
                   avatar={<Badge count={item.todoCount} overflowCount={999}  style={{ backgroundColor: item.countColor||'#f50' }} ><Avatar size={64}  src={item.src||defaultImg} /></Badge>}
                   title={<b>{item.NodeName}</b>}
                   description={<span>版本:{item.WF_Version} 流程管理员:{item.ProcessOwner} <br/><Tag color='green'>平均办结:{item.totalTime}小时</Tag></span>}
                 />
              </Card>
            </List.Item>
          )}
        />
      </Spin>
    );
  }
}

export default RightHome;
