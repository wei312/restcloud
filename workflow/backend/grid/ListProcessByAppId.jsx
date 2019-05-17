import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.CORE_WORKFLOW.listByPage;
const DELETE_URL=URI.CORE_WORKFLOW.delete;
const COPY_URL=URI.CORE_WORKFLOW.copy;
const PUBLISH_URL=URI.CORE_WORKFLOW.publish;

class ListProcessByAppId extends React.Component {
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

  deleteProcess=()=>{
    let processIds=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    let postData={"processId":processIds};
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

  copyProcess=()=>{
    let processIds=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    let postData={"processId":processIds};
    AjaxUtils.post(COPY_URL,postData,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
  }

  publishProcess=(publish)=>{
    let processIds=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    let postData={"processId":processIds,publish:publish};
    AjaxUtils.post(PUBLISH_URL,postData,(data)=>{
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

  newProcess=()=>{
    let url=decodeURIComponent(this.state.workflowHost)+"/rule?wf_num=R_S002_B001&&WF_Appid="+this.appId;
    this.openUrl(url);
  }
 openProcess=(id)=>{
   let url=decodeURIComponent(this.state.workflowHost)+"/rule?wf_num=R_S002_B001&Processid="+id;
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
      title: '流程名称',
      dataIndex: 'NodeName',
      width: '45%',
        render:(text,record)=>{
          return (<a onClick={this.openProcess.bind(this,record.Processid)} >{text}</a>);
        }
    },{
        title: '设计者',
        dataIndex: 'WF_AddName_CN',
        width:'15%'
      },{
        title: '最后更新',
        dataIndex: 'WF_LastModified',
        width: '20%'
      },{
        title: '版本',
        dataIndex: 'WF_Version',
        width:'10%'
      },{
        title: '状态',
        dataIndex: 'Status',
        width:'10%',
        render:(text,record)=>{if(text=='1'){return <Tag color="green" >已发布</Tag>}else{return <Tag color="red" >未发布</Tag>}}
      }];
      // console.log(selectedRowKeys.length);
    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="primary" onClick={this.newProcess} icon="plus-circle-o"  >新建流程</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除流程","确定要删除选中流程吗?",this.deleteProcess)} icon="delete" disabled={!hasSelected} >删除流程</Button>{' '}
              <Button  type="ghost" onClick={this.copyProcess} icon="copy" disabled={!hasSelected}   >复制流程</Button>{' '}
                <Button  type="ghost" onClick={this.publishProcess.bind(this,"1")} icon="check" disabled={!hasSelected}   >发布</Button>{' '}
                  <Button  type="ghost" onClick={this.publishProcess.bind(this,"0")} icon="pause" disabled={!hasSelected}   >停止</Button>{' '}
              <Button  type="ghost" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:{' '}<Search
              placeholder="搜索流程名称"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>

        <Table
          bordered={true}
          rowKey={record => record.Processid}
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

export default ListProcessByAppId;
