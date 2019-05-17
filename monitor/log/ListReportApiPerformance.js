import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Card,DatePicker,Popover} from 'antd';
import ListServiceLog from './ListServiceLog';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AppSelect from '../../core/components/AppSelect';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR.allApiPerformance;
const DELETE_URL=URI.LIST_CORE_SERVICES.delete;

class ListReportApiPerformance extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.startDate=this.getLastSevenDays();
    this.endDate=this.getNowFormatDate();
    this.state={
      pagination:{pageSize:60,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      appId:this.appId,
      loading: false,
    }
  }

  componentDidMount(){
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination,page, pageSize)=>{
    this.setState({pagination:pagination});
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
            newDate = new Date(timestamp - 1 * 24 * 3600 * 1000);
            var month = newDate.getMonth() + 1;
            month = month.toString().length == 1 ? '0' + month : month;
            var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() :newDate.getDate();
            return [newDate.getFullYear(), month, day].join('-');
   }

  //通过ajax远程载入数据
  loadData=()=>{
    this.setState({loading:true});
    let url=LIST_URL+"?appId="+this.state.appId+"&startTime="+this.startDate+"&endTime="+this.endDate;
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
        let pagination=this.state.pagination;
        pagination.total=data.total; //总数
        pagination.current=1; //回到第一页
        this.setState({rowsData:data.rows,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
      }
    });
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

 handleChange=(value)=>{
   this.setState({appId:value});
 }

 onStartDateChange=(date, dateString)=>{
   this.startDate=dateString;
 }

 onEndDateChange=(date, dateString)=>{
   this.endDate=dateString;
 }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: 'Method',
        dataIndex: 'methodType',
        width: '6%',
        render:(text,record) => {
            let method=record.methodType;
            if(method==="POST"){
                return <Tag color="#87d068" style={{width:50}} >POST</Tag>;
            }else if(method==="GET"){
                return <Tag color="#108ee9" style={{width:50}} >GET</Tag>;
            }else if(method==="DELETE" ){
                return <Tag color="#f50" style={{width:50}} >DELETE</Tag>;
            }else if(method==="PUT"){
                return <Tag color="pink" style={{width:50}} >PUT</Tag>;
            }else if(method==="*"){
                return <Tag color="#f50" style={{width:50}} >全部</Tag>;
            }
          },
      },{
        title: 'API地址',
        dataIndex: 'mapUrl',
        width: '20%'
      },{
        title: '名称',
        dataIndex: 'configName',
        width:'18%',
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'6%',
      },{
        title: 'BeanId',
        dataIndex: 'beanId',
        width:'10%',
        render:(text,record)=>{
          if(record.configType==='JOIN'){
              return <Tag>聚合</Tag>;
          }else if(record.configType==='REG'){
              return <Tag>注册</Tag>;
          }else if(record.configType==='MODEL'){
              return <Tag color='blue'>设计</Tag>;
          }else if(record.classPath===''){
              return (<div>{text}<Tag color="red">X</Tag></div>);
          }else{
              return <Popover content={record.classPath+"."+record.beanMethodName+"()"} title="调用方法" >{text}</Popover>;
          }
        }
      },{
        title: '版本',
        dataIndex: 'version',
        width:'6%',
      },{
        title: '平均响应/毫秒',
        dataIndex: 'avgRunTotalTime',
        width:'10%',
        sorter: (a, b) => a.avgRunTotalTime - b.avgRunTotalTime,
        render:(text,record)=>{
          if(text===0){return '0';}
            return <Tag color="green" >{text}</Tag>
        }
      },{
      title: '累计调用次数',
      dataIndex: 'accessTotal',
      width:'10%',
      sorter: (a, b) => a.accessTotal - b.accessTotal,
      render:(text,record)=>{
          if(text===0){return '0';}
          return <Tag color="blue" >{text}</Tag>
      }
    }];

    const expandedRow=function(record){
      return (
        <Card title="调用日记">
        <ListServiceLog id={record.id}  />
        </Card>
        );
    }

    return (
      <div style={{minHeight:'600px'}}>
        <Card style={{marginBottom:5}}  >
             应用(空表示所有):<AppSelect value={this.state.appId} onChange={this.handleChange} ></AppSelect>
             {' '}
             开始日期:<DatePicker  onChange={this.onStartDateChange} defaultValue={moment(this.startDate, dateFormat)}  showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
           结束日期:<DatePicker  onChange={this.onEndDateChange}  defaultValue={moment(this.endDate, dateFormat)} showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间" />{' '}
           <Button  type="primary" onClick={this.loadData} icon="search" >开始查询</Button>{' '}
           <Button  icon="delete" onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.deleteData)}  style={{display:hasSelected?'':'none'}} >删除</Button>
       </Card>
        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          size='small'
          rowSelection={rowSelection}
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListReportApiPerformance;
