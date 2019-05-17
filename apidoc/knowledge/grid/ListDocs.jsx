import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Layout,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewDoc from '../form/NewDoc';
import ShowDocBody from '../form/ShowDocBody';

const Search = Input.Search;
const { Sider, Content } = Layout;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_KNOWLEDGE_DOC.list; //显示全部文档
const LIST_DEPT_URL=URI.CORE_KNOWLEDGE_DOC.listByDept; //按分类显示
const DELETE_URL=URI.CORE_KNOWLEDGE_DOC.delete;//删除

class ListPersons extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      treeFlag:false,
      currentNodeId:'root',
      action:'',
    }
  }

  componentDidMount(){
    this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    let nodeId=nextProps.location.query.nodeId;
    this.state.currentNodeId=nodeId;
    this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({action:action,visible: true,currentId:''});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({action:action,visible: true,currentId:record.id});
    }else if(action==="Tree"){
      this.setState({action:action,visible: true,currentId:''});
    }else if(action==="Read"){
      this.setState({action:action,visible: true,currentId:record.id});
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let nodeId=this.state.currentNodeId;
    if(nodeId!=='root' && nodeId!=='' && nodeId!==undefined && nodeId!==null){
      let nodeIdArray = [nodeId];
      filters.nodeId=nodeIdArray; //过虑只显示本节点树的文档
    }
    GridActions.loadData(this,this.url,pagination,filters,sorter,this.searchFilters);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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


  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  onTreeNodeSelect=(node)=>{
    let deptCode=node[0];
    this.url=LIST_DEPT_URL.replace("{deptCode}",deptCode);
    this.state.departmentCode=deptCode;
    this.loadData();
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"title":value,"tag":value};
    sorter={"order":'ascend',"field":'title'};//使用userName升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '标签',
        dataIndex: 'tag',
        width: '15%',
        render:(text,record)=>{return <Tag color="green">{text}</Tag>;}
      },{
      title: '标题',
      dataIndex: 'title',
      width:'35%',
      render:(text,record)=>{
          return (<a href='javascript:void(0)' onClick={this.onActionClick.bind(this,"Read",record)}>{text}</a>)
      }
      },{
        title: '作者',
        dataIndex: 'creator',
        width: '15%',
        sorter: true,
      },{
        title: '更新时间',
        dataIndex: 'editTime',
        width: '20%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'15%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a></Menu.Item>
                <Menu.Item>
                  <a href="javascript:void(0)"   >
                   <Popconfirm title="狠心删除?" onConfirm={this.onActionClick.bind(this,"Delete",record)}>删除</Popconfirm>
                  </a>
                </Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">Action <Icon type="down" /></a>
          </Dropdown>}
      },];

    let modalForm;
    let modalTitle;
    if(this.state.action==='New' || this.state.action==='Edit'){
      modalTitle='文档属性';
      modalForm=<NewDoc id={currentId} nodeId={this.state.currentNodeId} close={this.closeModal} />;
    }else if(this.state.action==='Read'){
      modalTitle='阅读内容';
      modalForm=<ShowDocBody id={currentId} close={this.closeModal} />;
    }
    return (
      <Card title="文档列表" style={{minHeight:'500px'}}>
            <Modal key={Math.random()} title={modalTitle} maskClosable={false}
                visible={this.state.visible}
                width='900px'
                style={{ top: 10 }}
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                {modalForm}
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增文档</Button>{' '}
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 <Search
                  placeholder="搜索标题"
                  style={{ width: 200 }}
                  onSearch={value => this.search(value)}
                />
                 </span>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.id}
              dataSource={rowsData}
              columns={columns}
              rowSelection={rowSelection}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
            />
      </Card>
    );
  }
}

export default ListPersons;
