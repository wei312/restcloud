import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewTreeNode from '../form/NewTreeNode';

const confirm = Modal.confirm;
const LIST_URL=URI.CORE_KNOWLEDGE_TREE.listAllNodeJson;
const DELETE_URL=URI.CORE_KNOWLEDGE_TREE.delete;

class ListTree extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      parentNodeId:'',
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

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',parentNodeId:''});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
    }else if(action==="NewSubNode"){
      this.setState({visible: true,currentId:'',parentNodeId:record.nodeId});
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,parentNodeId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '节点名称',
      dataIndex: 'treeNodeName',
      width:'50%'
      },{
        title: '节点Id',
        dataIndex: 'nodeId',
        width: '20%',
      },{
        title: '排序',
        dataIndex: 'sort',
        width: '15%'
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'150%',
        render: (text,record) => {
          if(record.departmentLevel==='0'){return "-";}
          return (<Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a></Menu.Item>
                <Menu.Item>
                  <a href="javascript:void(0)"   >
                   <Popconfirm title="狠心删除?" onConfirm={this.onActionClick.bind(this,"Delete",record)}>删除</Popconfirm>
                  </a>
                </Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"NewSubNode",record)} >新增</a></Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">Action <Icon type="down" /></a>
          </Dropdown>)}
      },];

    return (
      <div>
        <Modal key={Math.random()} title="节点属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewTreeNode id={currentId} parentNodeId={parentNodeId} closeModal={this.closeModal} />
        </Modal>
        <div style={divStyle}>
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增节点</Button>{' '}
          <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
        </div>
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          defaultExpandAllRows={true}
        />
    </div>
    );
  }
}

export default ListTree;
