import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover,Radio,Layout} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import NewService from '../../designer/designer/form/NewService';
import RegService from '../form/RegService';
import NewJoinService from '../form/NewJoinService';
import NewServiceModel from '../../designer/designer/form/NewServiceModel';
import ImportService from '../../designer/designer/form/ImportOpenApi';
import NewTest from '../../designer/tester/form/NewTest';
import EditParamsConfig from '../../designer/designer/grid/EditParamsConfigInner';
import ListSelectServiceMapPermission from '../../designer/designer/grid/ListSelectServiceMapPermission';
import ImportWsdl from '../../designer/designer/form/ImportWsdl';
import ShowApiDoc from '../../apidoc/form/ShowApiDoc';
import ImportServices from '../form/ImportServices';

const { Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const LIST_URL=URI.LIST_CORE_SERVICES.list;
const DELETE_URL=URI.LIST_CORE_SERVICES.delete;
const COPY_URL=URI.LIST_CORE_SERVICES.copy;
const SCAN_URL=URI.LIST_CORE_SERVICES.scanServiceBean;
const TreeMenuUrl=URI.CORE_APPSERVICECATEGORY.ListServiceMenuUrl;
const exportServices=URI.LIST_CORE_SERVICES.exportServices; //导出BSON APIURL
const exportServicesExcel=URI.CORE_GATEWAY_ALLLIST.exportExcel;//导出EXCEL APIURL
const exportServicesWord=URI.CORE_GATEWAY_ALLLIST.exportWord;//导出WORD APIURL
//package cn.restcloud.coreservice.config.controller.ActionUrlConfigRest;

class ListServicesByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.gatewayAppId=this.props.gatewayAppId;
    this.searchKeyword=this.props.searchKeyword
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      visible:false,
      serviceId:'',
      tableType:'AllServiceList',
      beanId:'',
      collapsed:false,
      modelId:'',
    }
  }

  componentDidMount(){
    if(this.searchKeyword!==undefined && this.searchKeyword!==''){
      this.search(this.searchKeyword);
    }else{
      this.loadData();
    }
  }

  componentWillReceiveProps=(nextProps)=>{
    this.gatewayAppId=nextProps.gatewayAppId;
    this.searchKeyword=nextProps.searchKeyword;
    if(this.searchKeyword!==undefined && this.searchKeyword!==''){
      this.search(this.searchKeyword);
    }else{
      this.loadData();
    }
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.addTabPane('EditRest',"配置:"+record.configName,record);
    }else if(action==="Test"){
      this.addTabPane("Test","测试:"+record.configName,record);
    }else if(action==='Permission'){
      this.setState({serviceId:record.id,visible: true});
    }else if(action==="EditCode"){
      this.addTabPane('EditCode',"代码:"+record.beanId,record);
    }else if(action==="ShowApiDoc"){
      this.addTabPane('ShowApiDoc',"API文档:"+record.configName,record);
    }
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    if(this.gatewayAppId!=='' && this.gatewayAppId!=='all'){
      filters.gatewayAppId=[this.gatewayAppId]; //过虑只显示网关的应用
    }
    filters.appId=[this.appId]; //过虑只显示gateway应用下的注册API
    // console.log(filters);
    this.searchFilters={}; //先清空搜索条件
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //导出服务(BSON,EXCEL,WORD)
  exportData=(e,eType)=>{
    let ids=this.state.selectedRowKeys.join(",");
    let params={ids:ids};
    let url=exportServices;
    if(e=="excel"){
      url=exportServicesExcel;
      ids=ids==""?"1":ids;
      let apiList="id,methodType,mapUrl,configName,inParams,";
      let apiListName="序号,请求方式,请求URL,API名称,输入参数,";
      let apiListChild="inParams";
      let apiInParams="fieldId,fieldName,defaultValue,required";
      let apiInParamsName="字段ID,字段名称,缺省值,是否必填";
      params={ids:ids,type:eType,apiList:apiList,apiListName:apiListName,apiListChild:apiListChild,apiInParams:apiInParams,apiInParamsName:apiInParamsName};
    }else if(e=="word"){
      url=exportServicesWord;
      params={ids:ids,type:eType};
    }
    this.setState({loading:true});
    AjaxUtils.post(url,params,(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        window.open(URI.baseResUrl+data.msg); //msg为文件路径
      }
    });
  }
  //弹出导入EXCEL框
  addImportTab=()=>{
    this.setState({modelId:'importServices',visible:true});
  }

  //通过ajax远程载入数据
  search=(value)=>{
      let filters={appId:[this.props.appId]};
      // filters.configType=['REG'];
      let sorter={};
      let searchFilters={"mapUrl":value,"beanId":value,configName:value,tags:value};
      sorter={"order":'ascend',"field":'marpUrl'};//使用mapUrl升序排序
      let url=this.url;
      this.state.pagination.current=1;
      GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  //通过Ajax在后端拷贝数据然后重新载入数据
  copyData=(argIds)=>{
     GridActions.copyData(this,COPY_URL,argIds);
  }

  //Tab相关函数
  onTabChange=(tabActiveKey)=>{
      this.setState({ tabActiveKey });
  }
  //Tab的各种触发事件
  onTabEdit=(targetKey, action)=>{
    if(action==="remove"){
        this.tabRemove(targetKey);
    }
  }
  //点击X时关闭点击的Tab
  tabRemove=(targetKey)=>{
      let tabActiveKey = this.state.tabActiveKey;
      let lastIndex;
      this.state.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.state.panes.filter(pane => pane.key !== targetKey);
      if (lastIndex >= 0 && tabActiveKey === targetKey) {
        tabActiveKey = panes[lastIndex].key;
      }else{
        tabActiveKey="home";
      }
      this.setState({ panes, tabActiveKey });
  }
  //关闭当前活动的Tab并刷新Grid数据
  closeCurrentTab=(reLoadFlag)=>{
    this.tabRemove(this.state.tabActiveKey);
    if(reLoadFlag!==false){
      this.loadData();
    }
  }
  //增加一个Tab
  addTabPane=(id,name,record)=>{
      const panes = this.state.panes;
      let tabActiveKey = id;
      let content;
      if(id==='NewService'){
        //新增服务
        content=(<NewService appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='RegService'){
        //注册服务
        content=(<RegService appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='RegWebService'){
        //注册服务
        content=(<ImportWsdl appId={this.props.appId} categoryId={this.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='JoinService'){
        //聚合服务
        content=(<NewJoinService appId={this.props.appId} categoryId={this.state.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='ServiceModel'){
        //设计服务
        content=(<NewServiceModel appId={this.props.appId} categoryId={this.state.categoryId} closeTab={this.closeCurrentTab}/>);
      }else if(id==='EditRest'){
        //修改服务
        tabActiveKey=record.id; //这样避免重复，可以打开多个编辑Tab
        if(record.configType==='REG'){
          content=(<RegService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.configType==='JOIN'){
          content=(<NewJoinService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else if(record.configType==='MODEL'){
          content=(<NewServiceModel appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }else{
          content=(<NewService appId={this.props.appId} id={record.id} closeTab={this.closeCurrentTab}/>);
        }
      }else if(id==='Test'){
        //服务测试
        tabActiveKey="TEST_"+record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<NewTest id="" serviceId={record.id} close={this.closeCurrentTab}/>);
      }else if(id==='ShowApiDoc'){
        //API文档
        tabActiveKey="ApiDoc_"+record.id; //这样避免重复，可以打开多个编辑Tab
        content=(<Card><ShowApiDoc id={record.id} close={this.closeCurrentTab}/></Card>);
      }else{
        content=(<Card title={name}>{name}</Card>);
      }
      const paneItem={ title: name, content: content, key: tabActiveKey };
      if(!this.containsTab(panes,paneItem)){
        if(panes.length>=5){
          panes.splice(-1,1,paneItem);
        }else{
          panes.push(paneItem);
        }
    }
      this.setState({ panes, tabActiveKey});
  }

  containsTab(arr, obj) {
      var i = arr.length;
      while (i--) {
          if (arr[i].key === obj.key) {
              return true;
          }
      }
      return false;
  }
  closeModal=()=>{
      this.setState({visible: false,});
  }
  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  handleRadioChange = (e) => {
    this.setState({ tableType: e.target.value });
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleMenuClick=(e)=>{
    if(e.key=="bson"){
      this.exportData("bson","one");
    }else if(e.key=="excel"){
      this.exportData("excel","one");
    }else if(e.key=="word"){
      this.exportData("word","one");
    }else if(e.key=="all"){
      this.exportData("excel","gateway");
    }
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=(record)=>{
      return (
        <Card  bordered={true} bodyStyle={{padding:8}}>
        <EditParamsConfig appId={this.props.appId} id={record.id} beanId={record.beanId} modelId={record.modelId} closeTab={this.closeCurrentTab}/>
        </Card>
        );
    }
    const menu = (
    <Menu onClick={this.handleMenuClick} >
      <Menu.Item key="bson" >导出BSON格式</Menu.Item>
      <Menu.Item key="excel">导出EXCEL格式</Menu.Item>
      <Menu.Item key="word">导出WORD格式</Menu.Item>
    </Menu>
    );
    const columns=[{
        title: 'Method',
        dataIndex: 'methodType',
        width: '8%',
        render:(text,record) => {
            let method=record.methodType;
            if(method==="POST"){
                return <Tag color="#87d068" style={{width:50}} >POST</Tag>;
            }else if(method==="GET"){
                return <Tag color="#108ee9" style={{width:50}} >GET</Tag>;
            }else if(method==="DELETE" ){
                return <Tag color="#f50" style={{width:50}} >DELETE</Tag>;
            }else if(method==="PUT"){
                return <Tag color="pink" style={{width:50}} >PUT</Tag>;
            }else if(method==="*"){
                return <Tag color="#f50" style={{width:50}} >全部</Tag>;
            }
          },
      },{
        title: 'URI',
        dataIndex: 'mapUrl',
        width: '30%',
        sorter: true,
      },{
        title: 'API名称',
        dataIndex: 'configName',
        width:'20%',
      },{
        title: '所属应用',
        dataIndex: 'gatewayAppId',
        sorter: true,
        width:'10%',
      },{
        title: '权限',
        dataIndex: 'effectiveUser',
        sorter: true,
        width:'10%',
        render:(text,record)=>{
          if(record.anonymousFlag===true){
            return <Tag color='red'>匿名</Tag>
          }else if(record.permission!=='' && record.permission!==undefined){
            return record.permission;
          }else{
            return <Tag color='blue' title={text}>需认证</Tag>;
          }
        }
      },{
        title: '版本',
        dataIndex: 'version',
        width:'6%',
      },{
      title: '状态',
      dataIndex: 'state',
      width:'8%',
      sorter: true,
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
          return (<div style={{textAlign:'center'}}>{stateTags}</div>);
          }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'12%',
        render: (text,record) => {
          return <Dropdown  overlay={
            <Menu style={{width:60}}>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a></Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"ShowApiDoc",record)} >文档</a></Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制吗?",this.onActionClick.bind(this,"Copy",record))} >复制</Menu.Item>
                <Menu.Item  onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</Menu.Item>
                <Menu.Item><a onClick={this.onActionClick.bind(this,"Permission",record)} >权限</a></Menu.Item>
                <Menu.Item><a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Test",record)} >测试</a></Menu.Item>
              </Menu>}
              trigger={['click']}
            >
            <a  href="#">操作 <Icon type="down" /></a>
          </Dropdown>}
      },];

    let contentStyle="";
    if(!this.state.collapsed){
      contentStyle={left:'-1px',minHeight:'500px',padding: '0px 5px',borderLeft:'1px solid #e9e9e9',position:'relative'};
    }
    let modelTitle="绑定权限";
    let formContent=<ListSelectServiceMapPermission serviceId={this.state.serviceId} appId={this.props.appId} closeModal={this.closeModal} />;
    if(this.state.modelId=="importServices"){
        modelTitle="导入设计";
        formContent=<ImportServices  closeModal={this.closeModal} appId={this.props.appId} />;
    }
    return (
      <div>
          <Modal key={Math.random()} title={modelTitle} maskClosable={false}
                width='750px'
                style={{ top: 25 }}
                visible={this.state.visible}
                onCancel={this.handleCancel}
                footer=''
                >
                {formContent}
          </Modal>

          <Tabs
            onChange={this.onTabChange}
            onEdit={this.onTabEdit}
            type="editable-card"
            activeKey={this.state.tabActiveKey}
            animated={false}
            hideAdd={true}
          >
          <TabPane tab="API接口列表" key="home" style={{padding:'0px'}}>
          <div style={{minHeight:'500px',border:'1px #e9e9e9 solid',margin:'0px',paddingLeft:'10px',paddingRight:'10px',paddingTop:'10px',paddingBottom:'10px',borderRadius:'2px'}}>
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12}>
                    <ButtonGroup>
                      <Button  type="primary" onClick={this.addTabPane.bind(this,'RegService','注册API')} icon="api"    >注册API</Button>
                      <Button  type="ghost" onClick={this.addTabPane.bind(this,'JoinService','聚合API')} icon="fork"    >聚合API</Button>
                      <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected}  >删除</Button>
                      <Button  type="upload" onClick={this.addImportTab} icon="upload" >导入API的EXCEL </Button>
                      <Dropdown overlay={menu} disabled={!hasSelected}>
                          <Button icon="download" >
                            导出<Icon type="down" />
                          </Button>
                      </Dropdown>
                      <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出所有到EXCEL配置','导出所有EXCEL配置后可以使用导入所有EXCEL功能重新导入!',this.exportData.bind(this,"excel","gateway"))} icon="download"  > 导出所有至EXCEL  </Button>
                      <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                     </ButtonGroup>
                  </Col>
                  <Col span={12}>
                   <span style={{float:'right'}} >
                     搜索:<Search
                      placeholder="服务url|服务名|标签"
                      style={{ width: 260 }}
                      onSearch={value => this.search(value)}
                    />
                     </span>
                  </Col>
                </Row>
                <Table
                  bordered={false}
                  rowKey={record => record.id}
                  rowSelection={rowSelection}
                  expandedRowRender={expandedRow}
                  dataSource={rowsData}
                  columns={columns}
                  loading={loading}
                  onChange={this.onPageChange}
                  pagination={pagination}
                />
          </div>
          </TabPane>
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
    </div>
    );
  }
}

export default ListServicesByAppId;
