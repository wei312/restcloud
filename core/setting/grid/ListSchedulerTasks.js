import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';
import NewSchudelerTask from '../form/NewSchudelerTask';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_SCHEDULER.list; //分页显示
const DELETE_URL=URI.CORE_SCHEDULER.delete;//删除
const startTaskJobUrl=URI.CORE_SCHEDULER.startTaskJob;
const stopTaskJobUrl=URI.CORE_SCHEDULER.stopTaskJob;
const runJobUrl=URI.CORE_SCHEDULER.runJob;
const exporConfigUrl=URI.CORE_SCHEDULER.exportConfig;
const ButtonGroup = Button.Group;

class ListSchedulerTasks extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      action:'edit',
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
      this.setState({visible: true,currentId:'',action:'edit'});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:'edit'});
    }else if(action==="Start"){
      this.startTaskJob(record.id);
    }else if(action==="Stop"){
      this.stopTaskJob(record.id);
    }else if(action==="Run"){
      this.runTaskJob(record.id);
    }
  }

  runTaskJob=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(runJobUrl,{id:id},(data)=>{
      //0表示定时任务不存在,1表示启动成功,2表示定时表达式为空,3表示任务已经启动了,4表示任务被禁用中
      if(data.state===true){
        AjaxUtils.showInfo(data.msg);
      }else{
        AjaxUtils.showError(data.msg);
      }
      this.setState({loading:false});
    });
  }

  startTaskJob=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(startTaskJobUrl,{id:id},(data)=>{
      //0表示定时任务不存在,1表示启动成功,2表示定时表达式为空,3表示任务已经启动了,4表示任务被禁用中
      let msg;
      if(data.msg==="0"){
        msg="定时任务不存在";
      }else if(data.msg==="1"){
        msg="定时任务启动成功";
      }else if(data.msg==="2"){
        msg="定时任务表达式为空";
      }else if(data.msg==="3"){
        msg="定时任务已经在运行中了";
      }else if(data.msg==="4"){
        msg="定时任务已经被禁用";
      }
      if(data.msg==="1"){
        AjaxUtils.showInfo(msg);
      }else{
        AjaxUtils.showError(msg);
      }
      this.loadData();
      this.setState({loading:false});
    });
  }

  stopTaskJob=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(stopTaskJobUrl,{id:id},(data)=>{
      //0表示定时任务不存在,1表示启动成功,2表示定时表达式为空,3表示任务已经启动了,4表示任务被禁用中
      if(data.state===true){
        AjaxUtils.showInfo("定时任务已成功停止");
      }else{
        AjaxUtils.showError("定时任务停止失败或者没有运行!");
      }
      this.loadData();
      this.setState({loading:false});
    });
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    AjaxUtils.post(exporConfigUrl,{ids:ids},(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        window.open(URI.baseResUrl+data.msg); //msg为文件路径
      }
    });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showDevLog=(id)=>{
    this.setState({visible: true,currentId:id,action:'read'});
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:如果任务正在调度运行中删除任务并不会停止运行，可以先停止任务后再删除任务!',
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

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"configName":value};
    sorter={"order":'ascend',"field":'createTime'};
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '任务说明',
        dataIndex: 'configName',
        width: '25%'
      },{
        title: '定时表达式',
        dataIndex: 'expression',
        width: '15%',
      },{
        title: '运行次数',
        dataIndex: 'runNum',
        width: '10%',
      },{
        title: '运行范围',
        dataIndex: 'executeServer',
        width: '15%',
        render:(text,record)=>{
          if(text==='SingleServer'){
            return '主服务器';
          }else if(text==='AllServer'){
            return '所有服务器';
          }else{
            return text;
          }
        }
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width: '10%',
      },{
        title: '调度状态',
        dataIndex: 'runingFlag',
        width: '8%',
        render:(text,record)=>{
          if(text){
            return (<Tag color="green" >运行中</Tag>)
          }else{
            return (<Tag color="#f50" >未安排</Tag>)
          }
        }
      },{
        title: '启用',
        dataIndex: 'state',
        width: '8%',
        render:(text,record)=>{
          if(text==="1"){
            return (<Tag color="#87d068" >启用</Tag>)
          }else{
            return (<Tag color="#f50" >停用</Tag>)
          }
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >编辑</a></Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Start",record)} >启动</a></Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Stop",record)} >停止</a></Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Run",record)} >运行</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","如果任务正在调度运行中删除任务并不会停止运行，可以先停止任务后再删除!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">操作 <Icon type="down" /></a>
          </Dropdown>}
      },];

    return (
      <Card title="定时任务管理" style={{minHeight:600}}>
	          <Modal key={Math.random()} title='定时任务' maskClosable={false}
                visible={this.state.visible}
                width='850px'
				        style={{ top: 20}}
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                <NewSchudelerTask id={currentId} close={this.closeModal} />
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup>
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增定时任务</Button>
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  style={{ width: 260 }}
                  placeholder='任务名称'
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

export default ListSchedulerTasks;
