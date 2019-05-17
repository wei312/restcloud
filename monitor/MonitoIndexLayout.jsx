import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Modal,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import './css/monitor.less';
import ChangeServer from '../core/components/ChangeServer';
import PageFooter from '../core/components/PageFooter';
import Iframe from '../core/components/Iframe';
import MonitorHomePage from './charts/home';
import ListServices from './apimonitor/grid/ListCoreServices';
import ListException from './apimonitor/grid/ListServiceExceptions';
import ListStopServices from './apimonitor/grid/ListStopServices';
import ListCluserServers from './apimonitor/grid/ListClusterServer';
import ListLocalCacheServer from './apimonitor/grid/ListLocalCacheServer';
import JvmMonitor from './jvm/ShowJvmInfo';
import ASYNCQUEUE_Request from './apimonitor/grid/ListAsyncRequestQueue';
import ASYNCQUEUE_CallBack from './apimonitor/grid/ListCallBackQueue';
import ASYNCQUEUE_Wait from './apimonitor/grid/ListWaitQueue';
import ASYNCQUEUE_Error from './apimonitor/grid/ListAsyncErrorQueue';
import ListBeans from './beanmonitor/grid/ListCoreBeans';
import ListErrorBeans from './beanmonitor/grid/ListErrorBeans';
import ListBeanObjCache from './beanmonitor/grid/ListBeanObjCache';
import ListBeanConfigCache from './beanmonitor/grid/ListBeanConfigCache';
import ListServiceConfigCache from './beanmonitor/grid/ListServiceConfigCache';
import ListAllCaches from './beanmonitor/grid/ListAllCaches';
import ListSpringBean from './beanmonitor/grid/ListSpringBean';
import ListLoadJarFiles from './beanmonitor/grid/ListLoadJarFiles';
import ToDayLog from './apimonitor/form/ToDayLog';
import TestOverRate from './charts/TestOverRate';
import ServiceTypeCharts from './charts/ServiceTypeCharts';
import ListReportApiAccessLog from './log/ListReportApiAccessLog';
import ListAllApiLog from './log/ListAllApiLog';
import ListReportApiPerformance from './log/ListReportApiPerformance';
import ListInvalidApiParams from './apimonitor/grid/ListInvalidApiParams';
import ListInvalidApis from './apimonitor/grid/ListInvalidApis';
import ClientTypeGroup from './charts/ClientTypeGroup';
import ApmLogByUserId from './apm/ApmLogByUserId';
import ApmLogByApi from './apm/ApmLogByApi';
import ApmLogByUserIdAndApi from './apm/ApmLogByUserIdAndApi';
import ApmLogByServiceName from './apm/ApmLogByServiceName';
import ApmServiceNameDependencies from './apm/ApmServiceNameDependencies';
import ApmLogByTraceIdReport from './apm/ApmLogByTraceIdReport';
import ListReportApiPerformanceChart from './charts/ListReportApiPerformanceChart';
import AllServicePerformanceChart from './charts/AllServicePerformanceChart';
import ListTransactionQueue from './transaction/grid/ListTransactionQueue';
import ListTransactionSuccess from './transaction/grid/ListTransactionSuccess';
import ListTransactionError from './transaction/grid/ListTransactionError';
import ListRecycleDocs from './apimonitor/grid/ListRecycleDocs';
import AllAppCallStatisChart from './charts/AllAppCallStatisChart';
import ListApiCallStatisTop from './log/ListApiCallStatisTop';
import UserCallStatisTopChart from './charts/UserCallStatisTopChart';
import SearchApiLogs from './log/SearchApiLogs';

//API监控平台首页

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class MonitoIndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='daas';
    this.menuPath=['监控首页'];
    this.menuUrl=URI.CORE_APPMENU_ITEM.menuUrl+"?categoryId=core.monitor";
    this.state={
        key:'home',
        mask:true,
        visible:false,
        collapsed: false,
        userInfo:AjaxUtils.getCookie("userName")+" 您好 "+this.getTime(),
        menuId:'home',
        menuNodeObj:{},
        menuData:[],
      }
     // window.document.title="API监控平台-"+window.document.title;
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    AjaxUtils.get(this.menuUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({menuData:data});
        }
    });
  }

  toggle = () => {
      this.setState({
        collapsed: !this.state.collapsed,
      });
  }

  getTime=()=>{
    let show_day=new Array('星期日','星期一','星期二','星期三','星期四','星期五','星期六');
    let today=new Date();
    let year=today.getFullYear();
    let month=today.getMonth();
    let date=today.getDate();
    let day=today.getDay();
    let now_time=(month+1)+'月'+date+'日'+' '+show_day[day]+' ';
    return now_time;
  }

  //顶部菜单点击事件
  topMenuClick=(e)=>{
    let key=e.key;
    if(key==='Logout'){
      AjaxUtils.logout();
      browserHistory.push(URI.loginUrl);
    }else if(key==='Portal'){
      browserHistory.push(URI.adminIndexUrl);
    }
  }

  handleClick=(item)=>{
    //直接退出
    if(item.key==='logout'){
      AjaxUtils.logout();
      browserHistory.push(URI.loginUrl);
    }else if(item.key==='changeServer'){
      this.setState({visible:true});//切换服务器
      return;
    }else if(item.key==='Desinger'){
      browserHistory.push(URI.rootPath);
      return;
    }

    //点击共他菜单时根据key找到点击的菜单对像
    let menuNodeObj; //用户点击的菜单对像
    let findFlag=false;
    let menuItems=this.state.menuData;
    for(let i=0;i<menuItems.length;i++){
      menuNodeObj=this.getMenuObj(menuItems[i],item.key);
      // console.log("找到一个菜单menuNodeObj="+menuNodeObj);
      if(menuNodeObj!==false){
        findFlag=true;
        break;
      }
      if(findFlag){break;}
    }
    if(menuNodeObj.openType==='2'){
        //在新窗口中打开
        window.open(menuNodeObj.url,menuNodeObj.nodeId);
        return;
    }else if(menuNodeObj.openType==='3'){
        //覆盖当前窗口
        location.href(menuNodeObj.url);
        return;
    }

    this.setState({menuId:item.key,menuNodeObj:menuNodeObj});
  }

  getMenuObj=(menuItem,key)=>{
    let mainMenuObj=false;
    let findFlag=(menuItem.nodeId===key);
    //console.log(menuItem.id+"==="+key+" =>"+findFlag);
    if(findFlag===true){
      //console.log("找到菜单="+menuItem);
      mainMenuObj=menuItem;
    }else if(menuItem.children!==undefined){
      for(let j=0;j<menuItem.children.length;j++){
        let menuObj=this.getMenuObj(menuItem.children[j],key);
        if(menuObj!==false){
          mainMenuObj=menuObj;
          break;
        }
      }
    }
    //console.log("结果如下");
    //console.log(mainMenuObj);
    return mainMenuObj;
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

  render(){
    const loop = data => data.map((item) => {
        let icon="appstore";
        if(item.icon!==undefined && item.icon!==null && item.icon!=='' ){icon=item.icon;}
        if (item.children!==undefined) {
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          if(item.parentNodeId!=='root'){
            title=<span style={{fontSize:'14px'}} >{item.label}</span>;
          }
          return <SubMenu  key={item.id}  title={title}>
              {loop(item.children)}
           </SubMenu>;
        }else if(item.parentNodeId==='root'){
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          return <Menu.Item key={item.nodeId} style={{fontSize:'14px'}}  >{title}</Menu.Item>;
        }else{
          return <Menu.Item key={item.nodeId} style={{fontSize:'14px'}} >{item.label}</Menu.Item>;
        }
    });
    const menus = loop(this.state.menuData);

    let content;
    let menuId=this.state.menuId;
    if(menuId==='home'){
      this.state.menuNodeObj={};
      this.state.menuNodeObj.menuPath='监控首页';
      content=<MonitorHomePage appId={this.appId} />;
    }else if(  this.state.menuNodeObj.openType==='4'){
      content=<Iframe url={this.state.menuNodeObj.url} />;
    }else if(menuId==='ListServices'){
      content=<ListServices />;
    }else if(menuId==='ListException'){
      content=<ListException />;
    }else if(menuId==='ListStopServices'){
      content=<ListStopServices />;
    }else if(menuId==='ListClusterServer'){
      content=<ListCluserServers />;
    }else if(menuId==='ListLocalCacheServer'){
      content=<ListLocalCacheServer />;
    }else if(menuId==='JvmMonitor'){
      content=<JvmMonitor />;
    }else if(menuId==='ASYNCQUEUE_Request'){
      content=<ASYNCQUEUE_Request />;
    }else if(menuId==='ASYNCQUEUE_CallBack'){
      content=<ASYNCQUEUE_CallBack />;
    }else if(menuId==='ASYNCQUEUE_Wait'){
      content=<ASYNCQUEUE_Wait />;
    }else if(menuId==='ASYNCQUEUE_Error'){
      content=<ASYNCQUEUE_Error />;
    }else if(menuId==='ListBeans'){
      content=<ListBeans />;
    }else if(menuId==='ListErrorBeans'){
      content=<ListErrorBeans />;
    }else if(menuId==='ListBeanObjCache'){
      content=<ListBeanObjCache />;
    }else if(menuId==='ListBeanConfigCache'){
      content=<ListBeanConfigCache />;
    }else if(menuId==='ListServiceConfigCache'){
      content=<ListServiceConfigCache />;
    }else if(menuId==='ListSpringBean'){
      content=<ListSpringBean />;
    }else if(menuId==='ListAllCaches'){
      content=<ListAllCaches />;
    }else if(menuId==='ToDayLog'){
      content=<ToDayLog />;
    }else if(menuId==='TestOverRate'){
      content=<TestOverRate appId='*' />;
    }else if(menuId==='ServiceTypeCharts'){
      content=<ServiceTypeCharts appId='*' />;
    }else if(menuId==='ListReportApiAccessLog'){
      content=<ListReportApiAccessLog appId='*' />;
    }else if(menuId==='ListAllApiLog'){
      content=<ListAllApiLog appId='*' />;
    }else if(menuId==='ListReportApiPerformance'){
      content=<ListReportApiPerformance appId='*' />;
    }else if(menuId==='ListInvalidApiParams'){
      content=<ListInvalidApiParams  />;
    }else if(menuId==='ListInvalidApis'){
      content=<ListInvalidApis  />;
    }else if(menuId==='clientGroupCharts'){
      content=<ClientTypeGroup  />;
    }else if(menuId==='apmbyuser'){
      content=<ApmLogByUserId  />;
    }else if(menuId==='apmbyservice'){
      content=<ApmLogByServiceName  />;
    }else if(menuId==='ServiceNameDependencies'){
      content=<ApmServiceNameDependencies  />;
    }else if(menuId==='apmbytraceId'){
      content=<ApmLogByTraceIdReport  />;
    }else if(menuId==='ApiPerformanceChart'){
      content=<ListReportApiPerformanceChart  />;
    }else if(menuId==='ServicePerformanceChart'){
      content=<AllServicePerformanceChart  />;
    }else if(menuId==='ListTransactionQueue'){
      content=<ListTransactionQueue  />;
    }else if(menuId==='ListTransactionSuccess'){
      content=<ListTransactionSuccess  />;
    }else if(menuId==='ListTransactionError'){
      content=<ListTransactionError  />;
    }else if(menuId==='TrashDoc'){
      content=<ListRecycleDocs  />;
    }else if(menuId==='ListLoadJarFiles'){
      content=<ListLoadJarFiles  />;
    }else if(menuId==='AppCallStatis'){
      content=<AllAppCallStatisChart  />;
    }else if(menuId==='ApiCallStatisTop'){
      content=<ListApiCallStatisTop  />;
    }else if(menuId==='UserCallTopStatis'){
      content=<UserCallStatisTopChart  />;
    }else if(menuId==='SearchApiLog'){
      content=<SearchApiLogs  />;
    }else if(menuId==='ApmUserAndAPI'){
      content=<ApmLogByUserIdAndApi  />;
    }else if(menuId==='ApmBySystemName'){
      content=<ApmLogByApi  />;
    }

    // console.log(this.state.menuNodeObj);
    this.menuPath=this.state.menuNodeObj.menuPath.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Layout >
        <Modal key={Math.random()} title="切换服务器" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='760px'
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <ChangeServer close={this.handleCancel} />
        </Modal>
              <Sider
                trigger={null}
                width={260}
                collapsible
                collapsed={this.state.collapsed}
                style={{ background: '#fff' }}
              >
              <div style={{height:'64px',background:'#fff' }}>
                <div className="monitorlogo" />
              </div>
                <Menu  mode="inline"
                  style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
                  defaultSelectedKeys={['home']}
                  onClick={this.handleClick}
                >
                    <Menu.Item key="home">
                      <Icon type="home" style={{fontSize:'14px'}} />
                      <span style={{fontSize:'14px'}} >监控首页</span>
                    </Menu.Item>
                    {menus}
                </Menu>
              </Sider>
              <Layout>
                <Header style={{ background: '#fff', padding: 0 }}>
                  <div style={{borderLeft:"1px solid #ebedee",position:'relative',height:"30px",float:'left',top:15}} />
                  <Icon
                    className="monitorTrigger"
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.toggle}
                  />
                  <div  style={{float:'right',fontSize:'14px',padding:0,margin:'0 20px 0 0'}} >
                    <Menu  mode="horizontal"
                      defaultSelectedKeys={this.defaultSelectedKeys}
                      style={{lineHeight:'64px',float:'right',fontSize:'14px',padding:0,minWidth:'160px'}}
                      onClick={this.topMenuClick}
                    >
                          <Menu.Item key='Portal'><Icon type="home" />首页</Menu.Item>
                          <Menu.Item key="Logout"><Icon type="logout" />退出</Menu.Item>
                    </Menu>
                 </div>
                 <div  style={{float:'right',fontSize:'12px',padding:0,margin:'0 20px 0 0'}} >
                        <Avatar src="/res/iconres/images/avatar.png"  size="small" style={{ backgroundColor: '#7265e6' }}  />{' '}
                        <Popover content={URI.currentServerHost} title="当前服务器">
                           {this.state.userInfo}
                        </Popover>{' '}
                  </div>

                </Header>
                <div style={{ margin: '2px 0 2px 0 ', padding: 15,  }}>
                <Breadcrumb style={{margin:'0 0 0 10px'}}>
                   {this.menuPath.map((item)=>{
                     return <Breadcrumb.Item key={item} >{item}</Breadcrumb.Item>;
                   })}
                 </Breadcrumb>
               </div>
                <Content style={{ margin: '1px 16px', padding: 24, background: '#fff' }}>
                  {content}
                </Content>
                <Footer style={{  padding: 15, minHeight: 90,background: '#f0f2f5' }} >
                  <PageFooter />
                </Footer>
              </Layout>
        </Layout>
      </Spin>
    );
  }
}

export default MonitoIndexLayout;
