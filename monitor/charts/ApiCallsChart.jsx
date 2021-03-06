import * as echarts from 'echarts';
import React from 'react';
import {Spin,Row,Col,Radio} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
const dataUrl=URI.LIST_MONITOR.apiCallsByMinute;

//api每5分钟统计量

class ApiCallsChart extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      mask:false,
      minute:5,
      point:60,
      data:{}
    };
  }

  componentDidMount(){
    this.loadData();
    const self = this;
    this.intervalId=setInterval(function(){
        self.loadData();
    }, 20000);
  }

  //清除定时器
  componentWillUnmount(){
    window.clearInterval(this.intervalId);
  }

  loadData=()=>{
   this.setState({mask:false});
   let url=dataUrl+"?minute="+this.state.minute+"&point="+this.state.point;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({data:data,mask:false});
           this.initChart(data.date,data.data);
         }
     });
 }

 initChart=(date,data)=>{
       var chart = echarts.init(document.getElementById('ApiCallsChart'));
       let option  = {
         grid: {
             left: '5%',
             right: '5%',
             bottom: '12%',
             containLabel: false
         },
         tooltip: {
            trigger: 'axis'
         },
          xAxis: {
              type: 'category',
              data: date,
          },
          yAxis: {
              type: 'value',
          },
          series: [{
              name:'调用量',
              data: data,
              type: 'line',
              lineStyle:{normal:{color:'rgba(88,160,253,1)'}},
              areaStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0, color: 'rgba(88,160,253,1)'
                        }, {
                            offset: 0.5, color: 'rgba(88,160,253,0.7)'
                        }, {
                            offset: 1, color: 'rgba(88,160,253,0)'
                        }])
              }
          }]
      };
      chart.setOption(option);
 }

 handleSizeChange = (e) => {
    this.state.minute=e.target.value;
    this.loadData();
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <center>
          <Radio.Group value={this.state.minute} onChange={this.handleSizeChange} >
            <Radio.Button value={1}>1分钟</Radio.Button>
            <Radio.Button value={5}>5分钟</Radio.Button>
            <Radio.Button value={15}>15分钟</Radio.Button>
          </Radio.Group>
        </center>
        <div style={{height:0,fontSize:'12px',fontFamily:'微软雅黑',color:'#000',position:'relative',top:'20px',left:'30px',textAlign:'left'}}>每{this.state.minute}分钟API调用量</div>
        <div id='ApiCallsChart'  style={{ width: '100%', height: 400}} ></div>
      </Spin>
    );
  }
}

export default ApiCallsChart;
