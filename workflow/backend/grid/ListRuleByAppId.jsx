import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import NewProcessRule from '../form/NewProcessRule';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.CORE_WORKFLOWRULE.listByPage;
const DELETE_URL=URI.CORE_WORKFLOWRULE.delete;
const COPY_URL=URI.CORE_WORKFLOWRULE.copy;

class ListRuleByAppId extends React.Component {
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
  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }
  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?appId="+this.appId;
    GridActions.loadData(this,url,pagination,filters,sorter,this.searchFilters,(data)=>{
      pagination.total=data.total; //总数
      this.setState({rowsData:data.rows,pagination:pagination,selectedRows:[],selectedRowKeys:[],workflowHost:data.customArgs});
    });
  }

  deleteRule=()=>{
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

  copyRule=()=>{
    let docUnids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    let postData={"docUnid":docUnids};
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

  newRule=()=>{
    this.setState({visible:true})
  }
 openRule=(id)=>{
   let url=decodeURIComponent(this.state.workflowHost)+"/designer/editor.jsp?wf_dtype=20&CodeType=EngineRule&wf_docunid="+id;
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

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '规则名称',
      dataIndex: 'RuleName',
      width: '35%',
        render:(text,record)=>{
          return (<a onClick={this.openRule.bind(this,record.WF_OrUnid)} >{text}</a>);
        }
    },{
        title: '规则编号',
        dataIndex: 'RuleNum',
        width:'15%'
      },{
        title: '编译',
        dataIndex: 'CompileFlag',
        width:'10%'
      },{
        title: '创建者',
        dataIndex: 'WF_AddName_CN',
        width: '10%'
      },{
        title: '最后更新',
        dataIndex: 'WF_LastModified',
        width: '20%'
      },{
        title: '状态',
        dataIndex: 'Status',
        width:'10%',
        render:(text,record)=>{if(text=='1'){return <Tag color="green" >已发布</Tag>}else{return <Tag color="red" >未发布</Tag>}}
      }];
      // console.log(selectedRowKeys.length);
    return (
      <div>
        <Modal key={Math.random()} title="规则属性" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='660px'
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewProcessRule appId={this.appId} close={this.closeModal}></NewProcessRule>
        </Modal>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="primary" onClick={this.newRule} icon="plus-circle-o"  >新建规则</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除规则","确定要删除选中规则吗?",this.deleteRule)} icon="delete" disabled={!hasSelected} >删除规则</Button>{' '}
              <Button  type="ghost" onClick={this.copyRule} icon="copy" disabled={!hasSelected}   >复制规则</Button>{' '}
              <Button  type="ghost" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:{' '}<Search
              placeholder="搜索规则名称"
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

export default ListRuleByAppId;
