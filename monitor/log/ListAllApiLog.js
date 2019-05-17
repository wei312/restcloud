import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Card,DatePicker,Select,Tabs} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ListServiceApmLog from './ListServiceApmLog';
import AjaxEditSelect from '../../core/components/AjaxEditSelect';
import ApmChartByTraceId from '../apm/ApmChartByTraceId';
import ShowLog from './ShowLog';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR.apiAccessLogByPage;
const listAllServiceNames=URI.CORE_GATEWAY_MONITOR.selectServiceNames;

class ListAllApiLog extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.startDate='',
    this.endDate='',
    this.userName='';
    this.state={
      pagination:{pageSize:30,current:1,showSizeChanger:false,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      serverId:'',
    }
  }

  componentDidMount(){
    this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
      this.setState({pagination:pagination});
   this.loadData(pagination,filters,sorter);
  }

  search=()=>{
   this.state.pagination.current=1;
   this.loadData();
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination)=>{
    this.setState({loading:true});
    let pageSize=30;
    let pageNo=1;
    if(pagination!==undefined){
      pageNo=pagination.current||1;
      pageSize=pagination.pageSize||20;
    }

    let url=LIST_URL+"?&serverId="+this.state.serverId+"&userName="+this.userName+"&startDate="+this.startDate+"&endDate="+this.endDate+"&pageSize="+pageSize+"&pageNo="+pageNo;
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
        let pagination=this.state.pagination;
        pagination.total=data.total; //总数
        this.setState({rowsData:data.rows,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
      }
    });
  }

  handleChange=(e)=>{
    this.userName=e.target.value;
  }
  serverChange=(value)=>{
    this.setState({serverId:value});
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
        width:'5%',
        render:text => {
          if(text==="POST"){
              return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
          }else if(text==="GET"){
              return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
          }else if(text==="PUT" || text==="DELETE" ){
              return <Tag color="#f50" style={{width:50}} >{text}</Tag>
          }else if(text==="*"){
              return <Tag color="#f50" style={{width:50}} >全部</Tag>
          }
        }
      },{
        title: '用户',
        dataIndex: 'userName',
        width:'10%',
      },{
        title: '操作描述',
        dataIndex: 'actionName',
        width: '20%'
      },{
        title: 'ServiceId',
        dataIndex: 'serverId',
        width: '12%'
      },{
        title: '请求URL',
        dataIndex: 'requestUrl',
        width: '20%',
        render:(text,record)=>{
          let spos=text.indexOf("?");
          if(spos===-1){
            return text;
          }else{
            return text.substring(0,spos);
          }
        }
      },{
        title: '操作时间',
        dataIndex: 'actionTime',
        width:'15%',
      },{
        title: '总耗时/毫秒',
        dataIndex: 'runTotalTime',
        width:'8%',
        render:(text,record)=>{
          if(text==='0'){
            return "0";
          }else{
            return <Tag color="green" >{text}</Tag>
          }
        }
      },{
        title: 'IP',
        dataIndex: 'ip',
        width:'10%',
      }];

      const expandedRow=function(record){
        return (<Card>
          <Tabs defaultActiveKey="RequestInfo"  >
              <TabPane tab="请求信息" key="RequestInfo" animated={false}>
                <ShowLog record={record} ></ShowLog>
              </TabPane>
          <TabPane tab="APM调用链" key="apm" animated={false}>
                <ListServiceApmLog traceId={record.traceId} spanId={record.spanId} />
          </TabPane>
          <TabPane tab="APM调用流程图" key="apmflow" animated={false}>
                <ApmChartByTraceId traceId={record.traceId} spanId={record.spanId} />
          </TabPane>
        </Tabs>
      </Card>);
      }

    return (
      <div style={{minHeight:'600px'}}>
        <Card style={{marginBottom:5}}  >
             用户名：<Input onChange={this.handleChange} style={{width:'150px'}} prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} />{' '}
             服务实例:<AjaxEditSelect url={listAllServiceNames} value={this.state.serverId} onChange={this.serverChange}  valueId='serviceName' textId='serviceName' options={{showSearch:true}} />{' '}
             开始日期：<DatePicker  onChange={this.onStartDateChange} />{' '}
             结束日期：<DatePicker  onChange={this.onEndDateChange} />{' '}
             <Button  type="primary" onClick={this.search} icon="search" >开始查询</Button>{' '}
             <Button  onClick={this.refresh} icon="reload" style={{margin:'0 0 5px 0'}} loading={loading} >刷新</Button>
        </Card>
        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          size='small'
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListAllApiLog;
