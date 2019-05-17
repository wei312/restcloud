import * as echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import React from 'react';
import {Spin,Row,Col,Radio,Card,DatePicker,Button,Select,Input,Icon} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import AjaxEditSelect from '../../core/components/AjaxEditSelect';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';
const dataUrl=URI.LIST_MONITOR.apmTreeLogByServiceName;
const Option = Select.Option;
const listAllServiceNames=URI.CORE_GATEWAY_MONITOR.selectServiceNames;

//客户端调用类型分组统计

class ApmLogByServiceName extends React.Component{
  constructor(props){
    super(props);
    this.appId='';
    this.startDate=this.getLastSevenDays();
    this.endDate=this.getNowFormatDate();
    this.state={
      mask:false,
      option:{},
      serverId:'',
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({mask:true});
   let url=dataUrl+"?startDate="+this.startDate+"&endDate="+this.endDate+"&serviceName="+this.state.serverId;
    AjaxUtils.get(url,(data)=>{
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({mask:false});
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

  initChart=(data)=>{
       let option = {
         title: {
             text: '按服务实例显示依赖关系',
             left: 'center'
         },
         tooltip: {
           padding: 10,
           backgroundColor: '#222',
           borderColor: '#777',
           borderWidth: 1,
           formatter: function (obj) {
               let total = obj.data.total||'0';
               let avg=obj.data.avg||'0';
               let name=obj.data.name;
               return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                   + '服务实例名:'+name
                   + '</div>'
                   + '总调用次数：' + total + '<br>'
                   + '平均响应时间：' + avg + '(毫秒)<br>';
           }
        },
         series: [
                   {
                       type: 'tree',
                       data: [data],
                       top: '1%',
                       left: '15%',
                       bottom: '1%',
                       right: '25%',
                       symbolSize: 25,
                       label: {
                           normal: {
                             formatter: [
                                '{b}\n{c}'
                            ].join('\n'),
                               position: 'left',
                               verticalAlign: 'middle',
                               align: 'right',
                               fontSize: 12
                           }
                       },
                       leaves: {
                           label: {
                               normal: {
                                   position: 'right',
                                   verticalAlign: 'middle',
                                   align: 'left'
                               }
                           }
                       },
                       expandAndCollapse: true,
                       animationDuration: 550,
                       animationDurationUpdate: 750,
                       initialTreeDepth:6,
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

 serverChange=(value)=>{
   this.setState({serverId:value});
 }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Card style={{marginBottom:5}}  >
             服务实例:<AjaxEditSelect url={listAllServiceNames} value={this.state.serverId} onChange={this.serverChange}  valueId='serviceName' textId='serviceName' options={{showSearch:true}} />{' '}
             开始日期:<DatePicker defaultValue={moment(this.startDate, dateFormat)} format={dateFormat}  onChange={this.onStartDateChange} />{' '}
             结束日期:<DatePicker defaultValue={moment(this.endDate, dateFormat)} format={dateFormat}  onChange={this.onEndDateChange} />{' '}
           <Button  type="primary" onClick={this.loadData} icon="search" >开始统计</Button>{' '}
       </Card>
        <ReactEcharts  option={this.state.option}  style={{height: '650px'}} className='react_for_echarts' />
      </Spin>
    );
  }
}

export default ApmLogByServiceName;
