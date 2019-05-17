import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const Search = Input.Search;
const LIST_URL=URI.SERVICE_CORE_EXCEPTION.list;
const DELETE_URL=URI.SERVICE_CORE_EXCEPTION.delete;
const CLEAR_URL=URI.SERVICE_CORE_EXCEPTION.clear;

class ListServiceExceptions extends React.Component {
  constructor(props) {
    super(props);
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }


  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"actionMapUrl":value,"exceptionDate":value};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL);
  }

  clearData=()=>{
    this.setState({loading:true});
    AjaxUtils.get(CLEAR_URL,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({data:data,loading:false});
            AjaxUtils.showInfo("成功清除所有异常信息!");
            this.loadData();
          }
    });
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
        title: '请求服务',
        dataIndex: 'actionMapUrl',
        width: '44%'
      },{
        title: '产生时间',
        dataIndex: 'createTime',
        width:'15%',
      },{
        title: '服务器ID',
        dataIndex: 'serverId',
        width:'15%',
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width:'10%',
      },{
        title: '请求用户',
        dataIndex: 'creator',
        width:'10%',
      }];

    const expandedRow=function(record){
      let trace=record.exceptionTrace.replace(/\n/gi,'<br>');
      return (<div>
      <p><b>请求URL:{record.methodType+"."+record.requestUrl}</b></p>
      <p>traceId-spanId:{record.traceId+"-"+record.spanId}</p>
      <p>请求头:{record.inHeaderStr}</p>
      <p>请求数据:{record.inParams} {record.inRequestBody}</p>
      <p>异常消息:{record.exceptionMsg}</p>
      <p> <div style={{color:'red'}} dangerouslySetInnerHTML={{__html: trace}} /></p>
      </div>);
    }

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"清空确认","需要清空所有异常数据吗?",this.clearData)} icon="delete"  >清空所有异常信息</Button>{' '}
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除确认","需要删除选中数据吗?",this.deleteData)} icon="delete" disabled={!hasSelected}  >删除异常</Button>{' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>{' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:{' '}<Search
              placeholder="搜索服务url或日期"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        <Table
          bordered={true}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListServiceExceptions;
