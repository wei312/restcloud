import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover,Radio,Layout,Breadcrumb,BackTop} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowApiDoc from '../form/ShowApiDoc';


const { Sider, Content,Header } = Layout;
const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_APIDOC.listFollowApi;
const CANCEL_URL=URI.CORE_APIDOC.cancelFollow;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

class ListMyFollowApis extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:30,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      collapsed:false,
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
  loadData=(pagination=this.state.pagination,filters={},sorter={},searchFilters={})=>{
    let url=LIST_URL+"?dataType=FOLLOW";
    GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
      let filters={};
      let sorter={};
      let searchFilters={"mapUrl":value,configName:value};
      sorter={"order":'ascend',"field":'marpUrl'};//使用mapUrl升序排序
      let url=this.url;
      this.searchFilters=searchFilters;
      this.state.pagination.current=1;
      GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  cancelFollowApi=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    if(ids===''){AjaxUtils.showError("请选择一个要取消的API!");return;}
    this.setState({mask:true});
    AjaxUtils.post(CANCEL_URL,{ids:ids},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo("取消成功!");
          this.loadData();
        }
    });
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=(record)=>{
      return (
        <Card >
                <ShowApiDoc id={record.urlConfigId} />
        </Card>
        );
    }

    const columns=[{
      title: 'Method',
      dataIndex: 'method',
      width:'10%',
      sorter: true,
      render:text => {
        if(text==="POST"){
            return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
        }else if(text==="GET"){
            return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
        }else if(text==="DELETE" ){
            return <Tag color="#f50" style={{width:50}} >DEL</Tag>
        }else if(text==="PUT"){
            return <Tag color="pink" style={{width:50}} >{text}</Tag>
        }else if(text==="*"){
            return <Tag color="#f50" style={{width:50}} >全部</Tag>
        }
      },
      },{
        title: 'API URL',
        dataIndex: 'url',
        width: '30%',
        sorter: true,
        render:(text,record) => {
          if(record.state==='0'){
            return <s>{text}</s>;
          }else{
            return text;
          }
        }
      },{
        title: '名称',
        dataIndex: 'serviceName',
        width:'25%',
      },{
        title: '关注时间',
        dataIndex: 'createTime',
        width:'15%',
      },{
        title: '应用Id',
        dataIndex: 'appId',
        sorter: true,
        width:'10%'
      },{
        title: '版本',
        dataIndex: 'version',
        sorter: true,
        width:'10%'
      }];

    return (
        <div style={{ background: '#fff',padding:25,borderRadius:'4px'}} >
           <BackTop />
             <Row style={{marginBottom:5}} gutter={0} >
                 <Col span={12} >
                   <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"取消确认","确认取消关注?",this.cancelFollowApi)} icon="heart" disabled={!hasSelected} loading={loading} >取消关注</Button>{' '}
                   <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                 </Col>
                 <Col span={12}>
                  <span style={{float:'right'}} >
                    API搜索:<Search
                     placeholder="URL|服务名|beanId|标签"
                     style={{ width: 260 }}
                     onSearch={value => this.search(value)}
                   />
                    </span>
                 </Col>
               </Row>

               <Table
                 bordered={false}
                 rowKey={record => record.id}
                 expandedRowRender={expandedRow}
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

export default ListMyFollowApis;
