import * as echarts from 'echarts';
import React from 'react';
import {Spin,Row,Col,Radio} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
const dataUrl=URI.CORE_STATIS.getServiceLastWeekStatis;

class ApiCallsByWeekChart extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      day:7,
      barWidth:40,
      mask:false
    };
  }

  componentDidMount(){
    this.loadData();
    const self = this;
    this.intervalId=setInterval(function(){
        self.loadData();
    }, 120000);
  }

  //清除定时器
  componentWillUnmount(){
    window.clearInterval(this.intervalId);
  }

//运行中流程统计
  loadData=()=>{
   this.setState({mask:false});
   let url=dataUrl+"?dayNum="+this.state.day;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({dataSource:data,mask:false});
           this.initChart(data.date,data.failedNum,data.sucessNum);
         }
     });
 }

 initChart=(date,failedNum,sucessNum)=>{
       var chart = echarts.init(document.getElementById('ApiCallsByWeekChart'));
       let option = {
          tooltip : {
              trigger: 'axis',
              axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                  type : 'cross'        // 默认为直线，可选为：'line' | 'shadow'
              }
          },
          color:['#8884d8','#82ca9d'],
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
          },
          xAxis : [
              {
                  type : 'category',
                  data : date,
                  axisLabel: {textStyle: {color: '#000'}}
              }
          ],
          yAxis : [
              {
                  type : 'value',
                  axisLabel: {textStyle: {color: '#000'}}
              }
          ],
          series : [
              {
                  name:'成功',
                  type:'bar',
                  stack: '总量',
                  barWidth : this.state.barWidth,
                  label: {normal: {position:'top',show: true}},
                  data:sucessNum
              },
              {
                  name:'失败',
                  type:'bar',
                  stack: '总量',
                  data:failedNum
              }
          ]
      };
     chart.setOption(option);
 }

 handleSizeChange = (e) => {
    this.state.day=e.target.value;
    if(this.state.day===30){
      this.state.barWidth=20;
    }else{
      this.state.barWidth=40;
    }
    this.loadData();
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <center>
          <Radio.Group value={this.state.day} onChange={this.handleSizeChange} >
            <Radio.Button value={7}>7天</Radio.Button>
            <Radio.Button value={15}>15天</Radio.Button>
            <Radio.Button value={30}>30天</Radio.Button>
          </Radio.Group>
        </center>
        <div id='ApiCallsByWeekChart' style={{height: 400}} ></div>
      </Spin>
    );
  }
}

export default ApiCallsByWeekChart;
