import React, { PropTypes } from 'react';
import { Table,Row, Col,Card,Menu,Icon,message,Tag,Dropdown,Popconfirm,Button,Modal,Input} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
const confirm = Modal.confirm;

const Search = Input.Search;
const LIST_URL=URI.CORE_TRANSACTION_QUEUE.list+"?status=3";
const DELETE_URL=URI.CORE_TRANSACTION_QUEUE.delete;
const Recovery_URL=URI.CORE_TRANSACTION_QUEUE.recovery;

class ListTransactionError extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:10,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
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
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL,"");
  }

  recovery=()=>{
    this.setState({loading:true});
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(Recovery_URL,{ids:ids},(data)=>{
          this.setState({loading:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.loadData();
            AjaxUtils.showInfo("成功调恢复("+data.msg+")个事务到待处理队列中!");
          }
    });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"userId":value,"url":value,"traceId":value};
    sorter={"order":'ascend',"field":'_id'};//使用serverId升序排序
    this.searchFilters=searchFilters;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: 'Method',
      dataIndex: 'method',
      width:'10%',
      render:text => {
        if(text==="POST"){
            return <Tag color="#108ee9">{text}</Tag>
        }else if(text==="GET"){
            return <Tag color="#87d068">{text}</Tag>
        }else if(text==="PUT" || text==="DELETE" || text==="*"){
            return <Tag color="#f50">全部</Tag>
        }
      },
      },{
        title: '请求URL',
        dataIndex: 'url',
        width: '35%',
      },{
        title: '所在服务实例',
        dataIndex: 'serviceName',
        width: '10%',
      },{
      title: '最后协调时间',
      dataIndex: 'lastRunTime',
      width:'15%'
      },{
      title: '请求用户',
      dataIndex: 'creator',
      width:'10%'
      },{
      title: '出错状态码',
      dataIndex: 'code',
      width:'8%',
      },{
      title: '状态',
      dataIndex: 'status',
      width:'10%',
      render:text => {return <Tag color='red'>错误</Tag>}
      }];

      let expandedRow=function(record){
        return (<Card>
                <p><b>请求URL:</b>{record.url}</p>
                <p><b>运行服务器:</b>{record.exeServerIP+":"+record.exeServerPort}</p>
                <p><b>traceId:</b>{record.traceId}-{record.parentSpanId}</p>
                <p><b>上级服务实例名:</b>{record.parentServiceName}</p>
                <p><b>关联API:</b>{record.exeApiConfigId}</p>
                <p><b>出错时间:</b>{record.createTime}</p>
                <p><b>最后调度时间:</b>{record.lastRunTime}</p>
                <p><b>请求数据:</b>{record.requestBody}</p>
      </Card>);
      }

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"恢复确认","需要恢复选中事务吗?",this.recovery)} icon="ok" disabled={!hasSelected}     >恢复选中事务</Button>{' '}
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected}   >删除选中记录</Button>{' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:{' '}<Search
              placeholder="搜索traceId或者url或用户id"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        <Table bordered
          rowKey={record => record.id}
          rowSelection={rowSelection}
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

export default ListTransactionError;
