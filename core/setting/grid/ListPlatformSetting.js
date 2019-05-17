import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';
import NewPlatformSetting from '../form/NewPlatformSetting';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_APPSETTING.list; //分页显示
const DELETE_URL=URI.CORE_APPSETTING.delete;//删除
const exporConfigUrl=URI.CORE_APPSETTING.exportConfig;

class ListPlatformSetting extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
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
    }
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
    if(this.appId!=='' && this.appId!==undefined){
      filters.appId=[this.appId];
    }
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

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"configName":value,"configId":value};
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
        title: '发布环境',
        dataIndex: 'environment',
        width: '10%',
        sorter:true,
        render:(text,record)=>{
          if(text===undefined||text==='ALL'||text===''){
            return <Tag color='green'>所有</Tag>;
          }else{
              return <Tag color='green'>{text}</Tag>;
          }
        }
      },{
        title: '唯一id',
        dataIndex: 'configId',
        width: '25%',
        sorter:true,
      },{
        title: '参数名',
        dataIndex: 'configName',
        width: '22%'
      },{
        title: '应用',
        dataIndex: 'appId',
        width: '10%',
          sorter:true,
      },{
        title: '修改者',
        dataIndex: 'editor',
        width: '10%',
          sorter:true,
      },{
        title: '最后修改时间',
        dataIndex: 'editTime',
        width: '15%',
          sorter:true,
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'8%',
        render: (text,record) => {
                return <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>;
        }
      },];

    return (
      <Card title="平台参数设置" style={{minHeight:600}}>
	          <Modal key={Math.random()} title='平台参数设置' maskClosable={false}
                visible={this.state.visible}
                width='850px'
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                <NewPlatformSetting id={currentId} appId={this.appId} close={this.closeModal} />
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup>
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增设置</Button>
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  style={{ width: 260 }}
                  placeholder='配置名称或Id'
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

export default ListPlatformSetting;
