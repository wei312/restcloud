import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Modal,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import '../monitor/css/monitor.less';
import ChangeServer from '../core/components/ChangeServer';
import PageFooter from '../core/components/PageFooter';
import Iframe from '../core/components/Iframe';
import Homepage from './RightHomepage';
import ListRouter from './grid/ListRouter';
import ListServicesByAppId from './grid/ListServicesByAppId';
import ListAllGatewayApps from './grid/ListAllApps';
import ListLoadBalance from '../core/setting/grid/ListLoadBalance';
import ListGrayRelease from './grid/ListGrayRelease';
import ListMockResponseConfigs from './grid/ListMockResponseConfigs';
import ListLocalCacheServer from './grid/ListLocalCacheServer';
import ListBeansByInterface from './grid/ListBeansByInterface';
import ListRouterForHystrix from './grid/ListRouterForHystrix';
import TopologicalGraph from './monitor/TopologicalGraph';
import ListClusterServer from './monitor/ListClusterServer';
import ListAPIControlStrategy from '../core/setting/grid/ListServiceControlStrategy';
import Set_ListBusinessSystems from '../core/setting/grid/ListBusinessSystems';
import SettingLayout from './SettingLayout';
import ImportData from '../designer/components/ImportData';
import ListAppPropertiesByAppId from '../designer/designer/grid/ListAppPropertiesByAppId'
import LeftMenu from './LeftMenu';

//API网关布局首页
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId="gateway";
    this.menuPath=['Home'];
    this.searchKeyword='';
    this.state={
        key:'home',
        mask:true,
        visible:false,
        collapsed: false,
        userInfo:AjaxUtils.getCookie("userName")+" 您好 "+this.getTime(),
        menuId:'home',
        appName:'Home',
        menuNodeObj:{},
        menuData:[],
      }
      // window.document.title="API网关-"+window.document.title;
  }

  componentDidMount(){
    AjaxUtils.getSystemInfo(()=>{
      this.setState({  mask: false,});
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

  //左则菜单子组件中点击执行本函数
  handleClick=(key,menuNodeObj)=>{
    this.searchKeyword='';
    this.setState({menuId:key,menuNodeObj:menuNodeObj});
  }

  //顶部菜单点击事件
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
      browserHistory.push(URI.loginUrl);
    }else if(key==='Portal'){
      browserHistory.push(URI.adminIndexUrl);
    }else if(key==='Import'){
      this.setState({visible:true});
    }
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

  searchApi=(e)=>{
    let value=e.target.value;
    let menuNodeObj={props:'Rest',nodeId:'searchApi',label:'API搜索结果',id:'searchApi',menuPath:'API搜索结果',searchKeyword:value};
    this.setState({menuId:'searchApi',menuNodeObj:menuNodeObj});
  }

  render(){
    let content;
    let menuId=this.state.menuId;
    if(this.state.menuNodeObj===false){this.state.menuNodeObj={}}
    if(menuId==='SettingLayout'){
        this.state.menuNodeObj.menuPath="系统设置";
        content=<SettingLayout />;
    }else if(this.state.menuNodeObj.openType!==undefined && this.state.menuNodeObj.openType==='4'){
        content=<Iframe url={this.state.menuNodeObj.url} />;
    }else if(this.state.menuNodeObj.props==='router'){
        let appId=this.state.menuNodeObj.nodeId;
        if(appId==='router.all'){appId='all';}
        content=<ListRouter gatewayAppId={appId} appId={this.appId} />;
    }else if(this.state.menuNodeObj.props==='API'){
        let gatewayAppId=this.state.menuNodeObj.nodeId;
        if(gatewayAppId==='api.all'){gatewayAppId='all';}
        content=<ListServicesByAppId appId={this.appId} gatewayAppId={gatewayAppId} />;
    }else if(menuId==='GatewayAppList'){
        this.state.menuNodeObj.menuPath="网关配置/网关应用管理";
        content=<ListAllGatewayApps />;
    }else if(menuId==='LoadBalanceStrategy'){
        this.state.menuNodeObj.menuPath="网关配置/负载均衡策略";
        content=<ListLoadBalance />;
    }else if(menuId==='GatewayGrayRelease'){
        this.state.menuNodeObj.menuPath="网关配置/灰度发布策略";
        content=<ListGrayRelease />;
    }else if(menuId==='MockData'){
        this.state.menuNodeObj.menuPath="网关配置/模拟数据管理";
        content=<ListMockResponseConfigs appId={this.appId} />;
    }else if(menuId==='VariantConfig'){
        this.state.menuNodeObj.menuPath="网关配置/网关变量配置";
        content=<ListAppPropertiesByAppId appId={this.appId}  />;
    }else if(menuId==='APIControllerStrategy'){
       this.state.menuNodeObj.menuPath="网关配置/网关控制策略";
        content=<ListAPIControlStrategy appId={this.appId} />;
    }else if(menuId==='ListBusinessSystems'){
        this.state.menuNodeObj.menuPath="网关配置/业务系统注册";
        content=<Set_ListBusinessSystems  />;
    }else if(menuId==='TopologicalGraph'){
        this.state.menuNodeObj.menuPath="网关监控/网关拓朴图";
        content=<TopologicalGraph  />;
    }else if(menuId==='LocalServiceCache'){
        this.state.menuNodeObj.menuPath="网关监控/服务实例缓存";
        content=<ListLocalCacheServer  />;
    }else if(menuId==='Hystrix'){
        this.state.menuNodeObj.menuPath="网关监控/Hystrix监控";
        content=<ListRouterForHystrix  />;
    }else if(menuId==='ClusterServer'){
        this.state.menuNodeObj.menuPath="网关监控/网关集群服务器";
        content=<ListClusterServer  />;
    }else if(menuId==='ControlStrategyBeans'){
        this.state.menuNodeObj.menuPath="插件管理/网关控制策略插件";
        content=<ListBeansByInterface beanType='ControlStrategy'  interface='cn.restcloud.framework.core.base.IBaseServiceControlStrategy' />;
    }else if(menuId==='LoadbalanceBeans'){
        this.state.menuNodeObj.menuPath="插件管理/路由负载均衡插件";
        content=<ListBeansByInterface  interface='cn.restcloud.framework.blance.base.ILoadBlanceStrategy' />;
    }else if(menuId==='GrayPluginBeans'){
        this.state.menuNodeObj.menuPath="插件管理/路由灰度发布插件";
        content=<ListBeansByInterface  interface='cn.restcloud.gateway.base.IGrayReleaseStrategy' />;
    }else if(menuId==='APIParamsCheckBeans'){
        this.state.menuNodeObj.menuPath="插件管理/API参数验证插件";
        content=<ListBeansByInterface  beanType='Validate' interface='cn.restcloud.framework.core.base.IBaseValidateBean' />;
    }else if(menuId==='LocalServiceNamesBeans'){
        this.state.menuNodeObj.menuPath="插件管理/本地服务实例维护";
        content=<ListBeansByInterface  interface='cn.restcloud.framework.core.base.ILocalServiceNameCachePlugin' />;
    }else if(this.state.menuNodeObj.nodeId==='searchApi'){
        let searchKeyword=this.state.menuNodeObj.searchKeyword;
        content=<ListServicesByAppId appId={this.appId} gatewayAppId='all' searchKeyword={searchKeyword} />;
    }else{
        this.state.menuNodeObj.menuPath="API网关首页";
        content=<Homepage  />;
    }

    // console.log(this.state.menuNodeObj);
    this.menuPath=this.state.menuNodeObj.menuPath.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Layout >
        <Modal key={Math.random()} title='导入设计' maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='760px'
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <ImportData close={this.handleCancel} />
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
                <LeftMenu memuClick={this.handleClick} appId={this.appId} ></LeftMenu>
              </Sider>
              <Layout>
                <Header style={{ background: '#fff', padding: 0 }}>
                  <div style={{borderLeft:"1px solid #ebedee",position:'relative',height:"30px",float:'left',top:15}} />
                  <Icon
                    className="monitorTrigger"
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.toggle}
                  />
                <Icon style={{paddingLeft:'30px'}} type="search" theme="outlined" />
                  <Input
                   placeholder="在网关中搜索注册的API"
                   className="certain-category-icon"
                   style={{border:'0px',selection:'none',width:'360px'}}
                   onPressEnter={this.searchApi}
                 />
                  <div  style={{float:'right',fontSize:'14px',padding:0,margin:'0 20px 0 0'}} >
                    <div  style={{float:'right'}} >
                      <span className='topHeaderButton-b' onClick={this.topMenuClick.bind(this,'Portal')} ><Icon type="home" />首页</span>
                      <span className='topHeaderButton-b' onClick={this.topMenuClick.bind(this,'Import')} ><Icon type="upload" />导入配置</span>
                      <span className='topHeaderButton-b' onClick={this.topMenuClick.bind(this,'Logout')} ><Icon type="logout" />退出</span>
                   </div>
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
                <Content style={{ margin: '1px 16px', padding:'15px 24px 2px 24px', background: '#fff' }}>
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

export default IndexLayout;
