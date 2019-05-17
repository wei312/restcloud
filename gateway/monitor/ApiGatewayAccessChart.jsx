import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,Row,Col,Icon,Card} from 'antd';
import {Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape } from 'bizcharts';
import { DataSet } from '@antv/data-set';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const loadDataUrl=URI.CORE_GATEWAY_MONITOR.gateWayStatistics;

//测试覆盖率

class ApiGatewayAccessChart extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      mask:true,
      data:{averageResTime:0,totalAccessNum:0,totalFailAccessNum:0,totalAppNum:10,totalServerNum:0,totalRouterNum:0,totalRegNum:0}
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({mask:true});
    AjaxUtils.get(loadDataUrl,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({data:data,mask:false});
         }
     });
 }

  render() {
    const { DataView } = DataSet;
    const { Html } = Guide;
    const data = [
      { item: '累计调用次数', count: this.state.data.totalAccessNum },
      { item: '累计失败次数', count: this.state.data.totalFailAccessNum },
    ];
    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'count',
      dimension: 'item',
      as: 'percent'
    });

    const cols = {
      percent: {
        formatter: val => {
          val = (val * 100) + '%';
          return val;
        }
      }
    }
    let textDivStyle={width:'60%',height:'100%',float:'left',textAlign:'center',position:'relative',top:'10%'};
    let htmlCode='<div style="color:#8c8c8c;font-size:1.16em;text-align: center;width: 10em;">平均响应时间(秒)<br><span style="color:#262626;font-size:2.5em">'+this.state.data.averageResTime+'</span></div>';
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <Row gutter={24} >
            <Col span={6}>
                <div style={{background:'#f4f4f4',height:'80px'}}  >
                  <div style={{width:'40%',float:'left',background:'#CC9966',height:'100%',textAlign:'center'}}>
                          <Icon type="gold" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                  </div>
                  <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.data.totalServerNum}</b></span>
                        <div>集群服务器</div>
                    </div>
                </div>
            </Col>
            <Col span={6} >
              <div style={{background:'#f4f4f4',height:'80px'}}  >
                <div style={{width:'40%',float:'left',background:'#33CC99',height:'100%',textAlign:'center'}}>
                        <Icon type="appstore" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                    </div>
                  <div style={textDivStyle}>
                          <span style={{fontSize:'22px'}}><b>{this.state.data.totalAppNum}</b></span>
                          <div>总接入应用数</div>
                    </div>
                </div>
            </Col>
            <Col span={6}>
                <div style={{background:'#f4f4f4',height:'80px'}}  >
                <div style={{width:'40%',float:'left',background:'#33CCFF',height:'100%',textAlign:'center'}}>
                        <Icon type="api" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                    </div>
                  <div style={textDivStyle}>
                          <span style={{fontSize:'22px'}}><b>{this.state.data.totalRouterNum}</b></span>
                          <div>总路由数(个)</div>
                    </div>
                </div>
            </Col>
            <Col span={6}>
              <div style={{background:'#f4f4f4',height:'80px'}}  >
                <div style={{width:'40%',float:'left',background:'#66CC99',height:'100%',textAlign:'center'}}>
                          <Icon type="tag" style={{fontSize:'40px',color:'#ffffff',paddingTop:'20px'}}/>
                    </div>
                  <div style={textDivStyle}>
                          <span style={{fontSize:'22px'}}><b>{this.state.data.totalRegNum}</b></span>
                          <div>总注册API数(个)</div>
                    </div>
                </div>
            </Col>
          </Row>
          <div style={{height:'40px'}}></div>
          <Card title="API网关性能统计" style={{minHeight:'700px'}}>
            <div style={{marginRight:'200px'}}>
                <Chart height={400} data={dv} scale={cols} padding={[ 0, 0, 0, 0 ]} forceFit>
                        <Coord type={'theta'} radius={0.75} innerRadius={0.7} />
                        <Axis name="percent" />
                        <Tooltip
                          showTitle={false}
                          itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
                          />
                        <Guide >
                          <Html position ={[ '50%', '50%' ]} html={() =>{return htmlCode}} alignX='middle' alignY='middle'/>
                        </Guide>
                        <Geom
                          type="intervalStack"
                          position="percent"
                          color='item'
                          tooltip={['item*percent',(item, percent) => {
                            percent = percent * 100 + '%';
                            return {
                              name: item,
                              value: percent
                            };
                          }]}
                          style={{lineWidth: 1,stroke: '#fff'}}
                          >
                          <Label content='data'
                            formatter={(val, item) => {
                                return item.point.item+":"+item.point.count;
                            }}
                          />
                        </Geom>
                    </Chart>
              </div>
              </Card>
      </Spin>
    );
  }
}

export default ApiGatewayAccessChart;
