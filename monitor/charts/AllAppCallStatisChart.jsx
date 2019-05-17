import * as echarts from 'echarts';
import React from 'react';
import ReactEcharts from 'echarts-for-react';
import {Spin,Row,Col,Radio,DatePicker,Card,Button,Modal} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as URI from '../../core/constants/RESTURI';
import AppSelect from '../../core/components/AppSelect';
import moment from 'moment';
import ListAppCallStatisTop from '../log/ListAppCallStatisTopDetails';

const dataUrl=URI.LIST_MONITOR.allAppCallStatisChartUrl;
const dateFormat = 'YYYY-MM-DD';

class AllAppCallStatisChart extends React.Component{
  constructor(props){
    super(props);
    this.startDate=this.getLastSevenDays();
    this.endDate=this.getNowFormatDate();
    this.state={
      appId:'',
      day:7,
      barWidth:40,
      mask:true,
      visible:false,
      option:{},
      statisType:0,
    };
  }
  //statisType表示单个应用统计，0表示所有应用
  componentDidMount(){
    this.loadData();
  }


  loadData=()=>{
   this.setState({mask:true});
   let url='';
   if(this.state.statisType===0){
     url=dataUrl+"?startDate="+this.startDate+"&endDate="+this.endDate;
   }else{
     url=dataUrl+"?appId="+this.state.appId+"&startDate="+this.startDate+"&endDate="+this.endDate;
   }
    AjaxUtils.get(url,(data)=>{
         this.setState({mask:false});
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.initChart(data);
         }
     });
 }

 getNowFormatDate=(prvNum)=>{
         let date = new Date();
         var seperator1 = "-";
         var year = date.getFullYear();
         var month = date.getMonth() + 1;
         var strDate = date.getDate();
         if (month >= 1 && month <= 9) {
             month = "0" + month;
         }
         if (strDate >= 0 && strDate <= 9) {
             strDate = "0" + strDate;
         }
         let currentdate = year + seperator1 + month + seperator1 + strDate;
         return currentdate;
  }

  getLastSevenDays=(date)=>{
          var date = date || new Date(),
          timestamp,
          newDate;
           if(!(date instanceof Date)){
               date = new Date(date.replace(/-/g, '/'));
           }
           timestamp = date.getTime();
           newDate = new Date(timestamp - 2 * 24 * 3600 * 1000);
           var month = newDate.getMonth() + 1;
           month = month.toString().length == 1 ? '0' + month : month;
           var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() :newDate.getDate();
           return [newDate.getFullYear(), month, day].join('-');
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }


 initChart=(data)=>{
       let appArray=[];
       let totalArray=[];
       let avgArray=[];
       for(let i=0;i<data.length;i++){
         if(this.state.statisType===1){
           appArray[i]=data[i].accessDate;
         }else{
           appArray[i]=data[i].appId;
         }
         totalArray[i]=data[i].total;
         avgArray[i]=data[i].avg;
       }
       let option = {
          tooltip : {
              trigger: 'axis',
              axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                  type : 'cross'        // 默认为直线，可选为：'line' | 'shadow'
              }
          },
          title: {
              left: 'center',
              text: '应用调用统计(点击图形可以查看明细)',
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
                  data : appArray,
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
                  name:'总调用次数',
                  type:'bar',
                  label: {normal: {position:'top',show: true}},
                  data:totalArray
              },{
                  name:'平均响应时间(毫秒)',
                  type:'bar',
                  label: {normal: {position:'top',show: true}},
                  data:avgArray
              }
          ]
      };
     this.setState({option:option});
 }

 onStartDateChange=(date, dateString)=>{
   this.startDate=dateString;
 }

 onEndDateChange=(date, dateString)=>{
   this.endDate=dateString;
 }

 clickEcharts=(e)=>{
   let appId=e.name;
   if(this.state.statisType===1){
     appId=this.state.appId;
   }
   this.setState({visible: true,appId:appId});
 }

 appHandleChange=(value)=>{
   this.setState({appId:value,statisType:1});
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Modal key={Math.random()} title="查看应用调用TOP明细" maskClosable={false}
                  visible={this.state.visible}
                  width='700px'
                  footer=''
                  onOk={this.handleCancel}
                  onCancel={this.handleCancel} >
                  <ListAppCallStatisTop appId={this.appId} startDate={this.startDate} endDate={this.endDate} close={this.closeModal}  />
        </Modal>
        <Card style={{marginBottom:5}} title='应用调用量统计' >
           应用(空表示所有):<AppSelect value={this.state.appId} onChange={this.appHandleChange} ></AppSelect>
           开始日期:<DatePicker  onChange={this.onStartDateChange} defaultValue={moment(this.startDate, dateFormat)}   format="YYYY-MM-DD" placeholder="请选择时间" />{' '}
           结束日期:<DatePicker  onChange={this.onEndDateChange}  defaultValue={moment(this.endDate, dateFormat)}  format="YYYY-MM-DD" placeholder="请选择时间" />{' '}
           <Button  type="primary" onClick={this.loadData} icon="bar-chart" >开始统计</Button>{' '}
           <p></p>
           <ReactEcharts onEvents={{'click': this.clickEcharts}} option={this.state.option}  style={{height: '550px'}} className='react_for_echarts' />
         </Card>
      </Spin>
    );
  }
}

export default AllAppCallStatisChart;
