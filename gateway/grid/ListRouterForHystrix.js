import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider} from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import HystrixInstanceMonitor from '../monitor/HystrixInstanceMonitor';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_GATEWAY_HYXSTRIX.hyxListRouter;
const REST_URL=URI.CORE_GATEWAY_HYXSTRIX.hyxReset;

class ListRouterForHystrix extends React.Component {
  constructor(props) {
    super(props);
    this.appId="gateway";
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      currentRecord:{},
      action:'',
      visible:false,
    }
  }

  componentDidMount(){
      this.loadData();
      const self = this;
      // setInterval(function(){
      //   let data=self.loadData();
      // }, 1000);
  }


  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  hyxReset=()=>{
     this.setState({loading: true,});
     AjaxUtils.get(REST_URL,(data)=>{
          this.setState({loading: false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            AjaxUtils.showInfo("成功重启hystrix");
            this.loadData();
          }
	    });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中规则吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    sorter={"order":'ascend',"field":'routerUrl'};
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
      this.setState({
        visible: false,
      });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"routerUrl":value,"routerName":value,"serviceName":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  openApp=(appId)=>{
      let url=appUrl+"?appid="+appId;
      window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '路由名称',
        dataIndex: 'routerName',
        width: '15%',
        sorter: true,
      },{
        title: 'URL规则',
        dataIndex: 'routerUrl',
        width: '20%',
        sorter: true
      },{
        title: 'Fallback次数',
        dataIndex: 'rollingCountFallbackSuccess',
        width: '15%'
      },{
        title: '当前并发数',
        dataIndex: 'currentConcurrentExecutionCount',
        width:'10%'
      },{
        title: '请求数',
        dataIndex: 'requestCount',
        width:'10%'
      },{
        title: '错误数',
        dataIndex: 'errorCount',
        width:'10%'
      },{
        title: '错误率',
        dataIndex: 'errorPercentage',
        width:'10%',
        render: (text,record)=>{if(text===undefined){return '0';}else{return <span>{text}%</span>};}
      },{
        title: '熔断状态',
        dataIndex: 'isCircuitBreakerOpen',
        width:'10%',
        render: (text,record) => {
          if(text===false){return <Tag color='green'>未熔断</Tag>}
          else if(text===true){return <Tag color='red'>熔断中</Tag>}
          else{return <Tag>未启动</Tag>}
          }
      }];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} bodyStyle={{padding:8}}>
            <HystrixInstanceMonitor id={record.id}  />
          </Card>
          );
      }

    return (
      <Card style={{minHeight:'600px'}} title='Hystrix监控' >
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"重启Hystrix","重新启动Hystrix会全部清空hystrix当前已统计到的数据并立即中断正在排队线程的执行",this.hyxReset)} icon="poweroff" >重启Hystrix</Button>{' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="规则URL|名称|服务实例名"
              style={{ width: 260 }}
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
          loading={loading}
          onChange={this.onPageChange}
          expandedRowRender={expandedRow}
          pagination={pagination}
        />
    </Card>
    );
  }
}

export default ListRouterForHystrix;
