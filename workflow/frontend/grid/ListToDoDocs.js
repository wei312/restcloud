import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as ContextUtils from '../../../core/utils/ContextUtils';
import * as CURURI  from '../../utils/constants';
import * as GridActions from '../../utils/GridUtils';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=CURURI.WORKFLOW_FRONTEND.ListToDos; //分页显示待办


class ListToDoDocs extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
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
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  //搜索
  search=(value)=>{
    let filters={};
    let sorter={};
    let url=this.url;
    this.state.pagination.current=1;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,value);
  }

 openProcess=(orUnid,taskId)=>{
   let url=CURURI.workflowHost+"/r?wf_num=R_S003_B036&wf_docunid="+orUnid+"&wf_taskid="+taskId;
   window.open(url);
 }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '单号',
      dataIndex: 'WF_DocNumber',
      sorter: true,
      width: '8%',
      render:(text,record)=>{
        return <Tag>{text}</Tag>
      }
      },{
        title: '标题',
        dataIndex: 'Subject',
        width: '20%',
        render:(text,record)=>{
          return <a onClick={this.openProcess.bind(this,record.WF_OrUnid,record.Taskid)}>{text}</a>
        }
      },{
        title: '当前处理人',
        dataIndex: 'WF_Author_CN',
        width: '8%',
      },{
        title: '当前状态',
        dataIndex: 'NodeName',
        width: '15%',
      },{
        title: '申请人',
        dataIndex: 'WF_AddName_CN',
        width: '10%',
      },{
        title: '申请时间',
        dataIndex: 'WF_DocCreated',
        width: '15%',
      },{
        title: '流程名',
        dataIndex: 'WF_ProcessName',
        width: '12%',
      },{
        title: '已到达',
        dataIndex: 'TotalTime',
        width: '8%',
        render:(text,record)=>{
          return <Tag color='green'>{text}</Tag>
        }
      }];

    return (
      <div style={{minHeight:600}}>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  placeholder="请输入关键字"
                  style={{ width: 260 }}
                  onSearch={value => this.search(value)}
                />
                 </span>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.WF_OrUnid}
              dataSource={rowsData}
              columns={columns}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
            />
        </div>
    );
  }
}

export default ListToDoDocs;
