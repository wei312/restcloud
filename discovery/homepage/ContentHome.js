import React from 'react';
import { Row ,Col,Card,Icon} from 'antd';
import ServerNumCharts from './ServerNumCharts';
import ListTopMessage from '../message/ListTopMessage';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//Index页面
class ContentHome extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      mask:true,
      data:{exceptionNum:0,totalAccessNum:0,totalApiNum:0,totalAvgTime:0}
    };
  }

  componentDidMount(){

  }


  render(){
    let textDivStyle={width:'60%',height:'100%',float:'left',textAlign:'center',position:'relative',top:'10%'};
    return (
      <span>
      <Card title="服务实例统计">
        <Row>
          <Col span={12} style={{paddingTop:'50px'}}>
              <ServerNumCharts />
          </Col>
          <Col span={12} style={{padding:'0px'}}>
            <ListTopMessage />
          </Col>
        </Row>
      </Card>
      </span>
      );
  }
}

export default ContentHome;
