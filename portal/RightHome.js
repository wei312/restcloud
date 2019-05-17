import React from 'react';
import {List, Card,Icon,Spin,Avatar,Badge} from 'antd';
import { browserHistory } from 'react-router'
import * as URI from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

const loadDataUrl=URI.CORE_HOMEPAGE.GetPortalModules;
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
    this.setState({mask:true});
    AjaxUtils.get(loadDataUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({modules:data});
        }
    });
  }

  openUrl=(id)=>{
    let url=URI.rootPath+"/"+id;
    if(id==='daas'){
      window.open(url);
    }else{
      browserHistory.push(url);
    }
  }

  render() {
    let defaultImg='/res/iconres/images/portal/designer.png';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={this.state.modules}
          renderItem={item => (
            <List.Item>
              <Card hoverable={true} style={{padding:'3px 0 3px 0',backgroundColor:item.backgroundColor||'#fff'}} onClick={this.openUrl.bind(this,item.id)} >
              <Meta
                 avatar={<Badge count={item.count} overflowCount={999}  style={{ backgroundColor: item.countColor||'#52c41a' }} ><Avatar size={64}  src={item.src||defaultImg} /></Badge>}
                 title={<b>{item.title}</b>}
                 description={item.description}
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
