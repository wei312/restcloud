import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Card} from 'antd';
import ListServiceLog from '../../log/ListServiceLog';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import AppSelect from '../../../core/components/AppSelect';

const Search = Input.Search;
const LIST_URL=URI.LIST_CORE_SERVICES.list;

class ListCoreServices extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.searchFilters={};
    this.state={
      pagination:{pageSize:30,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      appId:'',
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
    if(this.appId!==undefined && this.appId!==''){
      filters.appId=[this.appId];
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"mapUrl":value,"beanId":value};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    this.state.pagination.current=1;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  showModal=(id)=>{
    this.setState({visible: true,currentId:id});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

 handleChange=(value)=>{
   this.appId=value;
   this.state.pagination.current=1;
   this.loadData()
 }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '类型',
        dataIndex: 'configType',
        width:'5%',
        render:(text,record)=>{
          if(text==='JOIN'){return <Icon type="share-alt" />;}
          else if(text==='REG'){return <Icon type="link" />;}
          else {return <Icon type="tag-o" />;}
        }
      },{
        title: 'API URL',
        dataIndex: 'mapUrl',
        width: '25%',
        sorter: true
      },{
        title: '名称',
        dataIndex: 'configName',
        width:'16%',
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'6%',
      },{
        title: '调用次数',
        dataIndex: 'totalAccessNum',
        width:'8%',
        render:(text,record)=>{
          if(text==='0'){
            return "0";
          }else{
            return <Tag color="green" >{text}</Tag>
          }
        }
      },{
        title: '平均响应',
        dataIndex: 'averageResTime',
        width:'8%',
        render:(text,record)=>{
          if(text==='0.000'){
            return "0";
          }else{
            return <Tag color="green" >{text}秒</Tag>
          }
        }

      },{
        title: '并发',
        dataIndex: 'curThreadNum',
        width:'8%',
        render:(text,record)=>{
          if(text===0){
            return "0";
          }else{
            return <Tag color="green" >{text}</Tag>
          }
        }
      }
      ,{
        title: '异常',
        dataIndex: 'exceptionNum',
        width:'8%',
        render:(text,record)=>{
          if(text==='0'){
            return "0";
          }else{
            return <Tag color="red" >{text}</Tag>
          }
        }
      },{
      title: '属性',
      dataIndex: 'state',
      width:'10%',
      render:(text,record)=>{
        let stateTags;
        if(record.state==='2'){
          stateTags=<Tag color="red" >调试</Tag>;
        }else if(record.state==='3'){
          stateTags=<Tag color="red" >停用</Tag>;
        }else if(record.state==='4'){
          stateTags=<Tag color="red" >模拟</Tag>;
        }else{
          stateTags=<Tag color="green" >启用</Tag>;
        }
        let effectiveUserTags;
        if(record.effectiveUser!=='' && record.effectiveUser!==undefined && record.effectiveUser!==null){
          effectiveUserTags=<Tag color="purple" >灰度发布</Tag>;
        }
        let stageTags;
        if(record.stage!==''){
          stageTags=<Tag color="green" >{record.stage}</Tag>;
        }
        return (<div style={{textAlign:'center'}}>{stateTags}{effectiveUserTags}</div>);
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
        <Modal key={Math.random()} title="服务调用日记" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='1024px'
            style={{top:'20px'}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <ListServiceLog id={this.state.currentId} closeModal={this.closeModal} />
        </Modal>

        <Card>
        <Row  gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>{' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             应用:<AppSelect value={this.appId} onChange={this.handleChange} ></AppSelect>
             {' '}
             搜索:{' '}<Search
              placeholder="搜索服务url或beanId"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        </Card>
        <br/>
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

export default ListCoreServices;
