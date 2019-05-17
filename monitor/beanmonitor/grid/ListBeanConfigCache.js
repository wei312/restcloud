import React, { PropTypes } from 'react';
import { Table,Icon,Tag,Button} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const LIST_URL=URI.LIST_CORE_BEANS.listAllCacheBeansConfig;
const CLEAR_BEANCACHE_URL=URI.LIST_CORE_BEANS.clearBeanObjCacheUrl;
const CLEAR_ALLCACHE_URL=URI.LIST_CORE_BEANS.clearAllCache;

class ListBeanConfigCache extends React.Component {
  constructor(props) {
    super(props);
    this.beanType="";
    this.appId="";
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true
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

  deleteCache=(record)=>{
    let url=CLEAR_BEANCACHE_URL.replace("{beanId}",record.beanId);
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
      }else{
        AjaxUtils.showInfo("成功从容器中清除缓存");
        this.loadData();
      }
    });
  }

  clearAllCache=(record)=>{
    let url=CLEAR_ALLCACHE_URL;
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
      }else{
        AjaxUtils.showInfo("成功从容器中清除缓存");
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
      title: '',
      dataIndex: '',
      width: '5%',
      render:(text,record)=>{return <Icon type="file" />;}
    },{
      title: '缓存配置的BeanId',
      dataIndex: 'beanId',
      width: '25%',
    },{
      title: '名称',
      dataIndex: 'beanName',
      width: '30%'
    },{
      title: '所属应用',
      dataIndex: 'appId',
      width: '10%'
    },{
      title: '属性',
      dataIndex: 'singleton',
      width:'25%',
      render:(text,record)=>{
        let singTags;
        if(record.singleton===true){
          singTags=<Tag color="cyan" >单例</Tag>;
        }else if(record.singleton===false){
          singTags=<Tag color="red" >多例</Tag>;
        }
        let typeTags=<Tag color="cyan" >{record.beanType}</Tag>;
        let hotType;
        if(record.useClassLoader){
          hotType=<Tag color="green" >Hot</Tag>;
        }
        return (<div>{typeTags}{singTags}{hotType}</div>);
      }
    },{
      title: '缓存',
      dataIndex: 'cacheFlag',
      key: 'x',
      width:'20%',
      render: (text,record) => {
          return (<Tag color="blue" onClick={this.deleteCache.bind(this,record)}><Icon type="close" />清除</Tag>);
      }
    }];

    return (
      <div>
        <div style={divStyle}>
          <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"操作确认","全部清除并重载?",this.clearAllCache)} icon="close" >全部清除并重载</Button>{' '}
          <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
        </div>
        <Table
          bordered={true}
          rowKey={record => record.beanId}
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
export default ListBeanConfigCache;
