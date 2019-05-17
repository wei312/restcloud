import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.CORE_WORKFLOWMONITOR.listTasks;
const DELETE_URL=URI.CORE_WORKFLOWMONITOR.deleteTask;

class ListProcessInstance extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      workflowHost:'',
    }
  }

  componentDidMount(){
      this.loadData();
  }
  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }
  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }
  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }
  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?appId="+this.appId;
    GridActions.loadData(this,url,pagination,filters,sorter,this.searchFilters,(data)=>{
      pagination.total=data.total; //总数
      this.setState({rowsData:data.rows,pagination:pagination,selectedRows:[],selectedRowKeys:[],workflowHost:data.customArgs});
    });
  }

  delete=()=>{
    let docUnids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    let postData={"docUnid":docUnids};
    AjaxUtils.post(DELETE_URL,postData,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={state:['1']};
    let sorter={};
    let searchFilters={};
    searchFilters={"keyWord":value};
    sorter={"order":'ascend',"field":'NodeName'};//使用serverId升序排序
    let url=LIST_URL+"?appId="+this.appId;
    this.searchFilters=searchFilters;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

 openDoc=(processId,docUnid)=>{
   let url=decodeURIComponent(this.state.workflowHost)+"/rule?wf_num=R_S003_B066&Processid="+processId+"&DocUnid="+docUnid;
   this.openUrl(url);
 }
 openUrl=(url)=>{
   var swidth=screen.availWidth;
   var sheight=screen.availHeight;
   let lnum=24;
   let rnum=80;
   var wwidth=swidth-lnum;
   var wheight=sheight-rnum;
   var wleft=(swidth/2-0)-wwidth/2-5;
   var wtop=(sheight/2-0)-wheight/2-25;
   window.open(url,'','Width='+wwidth+'px,Height='+wheight+'px,Left='+wleft+',Top='+wtop+',location=no,menubar=no,status=yes,resizable=yes,scrollbars=auto,resezie=no');
 }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '编号',
      dataIndex: 'WF_DocNumber',
      width: '10%',
    },{
      title: '标题',
      dataIndex: 'Subject',
      width: '25%',
        render:(text,record)=>{
          return (<a onClick={this.openDoc.bind(this,record.WF_Processid,record.WF_OrUnid)} >{text}</a>);
        }
    },{
        title: '当前处理人',
        dataIndex: 'WF_Author_CN',
        width:'10%'
      },{
        title: '申请人',
        dataIndex: 'WF_AddName_CN',
        width:'10%'
      },{
        title: '申请时间',
        dataIndex: 'WF_DocCreated',
        width: '10%'
      },{
        title: '流程名称',
        dataIndex: 'WF_ProcessName',
        width: '15%'
      },{
        title: '当前节点',
        dataIndex: 'WF_CurrentNodeName',
        width:'10%'
      },{
        title: '已耗时',
        dataIndex: 'TotalTime',
        width:'10%'
      }];
      // console.log(selectedRowKeys.length);
    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除流程实例","确定要删除选中流程实例吗?",this.delete)} icon="delete" disabled={!hasSelected} >删除</Button>{' '}
              <Button  type="ghost" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:{' '}<Search
              placeholder="搜索实例标题"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>

        <Table
          bordered={true}
          rowKey={record => record.WF_OrUnid}
          rowSelection={rowSelection}
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

export default ListProcessInstance;
