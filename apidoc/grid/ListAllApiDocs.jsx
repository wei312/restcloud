import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover,Radio,Layout,Breadcrumb,BackTop} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowApiDoc from '../form/ShowApiDoc';


const { Sider, Content,Header } = Layout;
const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_APIDOC.listAllService;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

class ListAllApiDocs extends React.Component {
  constructor(props) {
    super(props);
    this.categoryId=this.props.categoryId||'';
    this.appId=this.props.appId||'';
    this.keyword=this.props.keyword||''; //全局搜索的关键字
    this.searchKeywords=''; //本grid搜索的关键字
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
    if(this.keyword!==''){
      this.appId='';
      this.search(this.keyword);
    }else{
      this.loadData();
    }
  }

  componentWillReceiveProps=(nextProps)=>{
    this.state.pagination.current=1;
    if(this.keyword!==nextProps.keyword && nextProps.keyword!==undefined){
       this.appId='';
       this.keyword=nextProps.keyword;
       this.search(this.keyword);
    }else if(nextProps.categoryId!==this.categoryId || this.appId!==nextProps.appId){
        this.categoryId=nextProps.categoryId;
        this.appId=nextProps.appId;
        this.loadData();
    }
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
  loadData=(pagination=this.state.pagination,filters={},sorter={})=>{
    if(this.searchKeywords!==''){return this.search(this.searchKeywords,pagination);} //本grid搜索优先
    if(this.keyword!==''){return this.search(this.keyword,pagination);} //全局搜索优先
    let searchFilters={};
    if(this.categoryId!=='' && this.categoryId!=='all'){
      searchFilters={"categoryId":this.categoryId+","};
    }
    if(this.appId!==''){
      filters.appId=[this.appId];
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
  }

  //通过ajax远程载入数据
  search=(value,pagination=this.state.pagination)=>{
      let filters={};
      let sorter={};
      let searchFilters={"mapUrl":value,"beanId":value,configName:value,tags:value};
      sorter={"order":'ascend',"field":'marpUrl'};//使用mapUrl升序排序
      let url=this.url;
      this.searchFilters=searchFilters;
      if(this.appId!==''){
        filters.appId=[this.appId];
      }
      this.state.pagination.current=1;
      GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
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
        <Card>
                <ShowApiDoc id={record.id} />
        </Card>
        );
    }

    const columns=[{
      title: 'Method',
      dataIndex: 'methodType',
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
        title: 'API URI',
        dataIndex: 'mapUrl',
        width: '30%',
        sorter: true,
        render:(text,record)=>{
          if(record.anonymousFlag===true){
            return <span><Icon type="user-delete"  title='匿名访问' />{text}</span>;
          }else if(record.permission!=='' && record.permission!==undefined){
            let title="绑定权限:"+record.permission;
            return <span><Icon type="lock" title={title} />{text}</span>;
          }else{
            return text;
          }
        }
      },{
        title: '名称',
        dataIndex: 'configName',
        width:'25%',
      },{
        title: '所属分类',
        dataIndex: 'categoryName',
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
        width:'8%'
      }];

    return (
        <div style={{ background: '#fff',padding:25,borderRadius:'4px'}} >
           <BackTop />
             <Row style={{marginBottom:5}} gutter={0} >
                 <Col span={12} >
                   <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                 </Col>
                 <Col span={12}>
                  <span style={{float:'right'}} >
                    API搜索:<Search
                     placeholder="URL|服务名|beanId|标签"
                     style={{ width: 260 }}
                     onSearch={value => this.search(value)}
                     onChange={e=>{this.searchKeywords=e.target.value}}
                   />
                    </span>
                 </Col>
               </Row>

               <Table
                 bordered={false}
                 rowKey={record => record.id}
                 expandedRowRender={expandedRow}
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

export default ListAllApiDocs;
