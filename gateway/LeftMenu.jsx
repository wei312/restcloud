import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';

//应用开发左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const MenuUrl=URI.CORE_GATEWAY_ROUTER.leftMenus

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:true,
        menuId:'home',
        menuNodeObj:{},
        menuData:[],
      }
  }

  componentDidMount(){
    AjaxUtils.getSystemInfo();
    this.loadData();
    const self = this;
    this.intervalId=setInterval(function(){
        self.loadData();
    }, 10000);
  }

  //清除定时器
  componentWillUnmount(){
    window.clearInterval(this.intervalId);
  }

  //载入菜单
  loadData=()=>{
    let url=MenuUrl+"?appId="+this.appId;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({menuData:data.menus,appName:data.appName});
        }
    });
  }

  handleClick=(item)=>{
    let key=item.key;
    //点击共他菜单时根据key找到点击的菜单对像
    let menuNodeObj; //用户点击的菜单对像
    let findFlag=false;
    let menuItems=this.state.menuData;
    for(let i=0;i<menuItems.length;i++){
      menuNodeObj=this.getMenuObj(menuItems[i],key);
      // console.log("找到一个菜单menuNodeObj="+menuNodeObj);
      if(menuNodeObj!==false){
        findFlag=true;
        break;
      }
      if(findFlag){break;}
    }
    if(menuNodeObj.openType==='2'){
        //在新窗口中打开
        window.open(menuNodeObj.url,menuNodeObj.id);
        return;
    }else if(menuNodeObj.openType==='3'){
        //覆盖当前窗口
        location.href(menuNodeObj.url);
        return;
    }
    this.menuClick(key,menuNodeObj);
  }

  getMenuObj=(menuItem,key)=>{
    let mainMenuObj=false;
    let findFlag=(menuItem.id===key);
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
    //console.log(mainMenuObj);
    return mainMenuObj;
  }

  render(){
    const loop = data => data.map((item) => {
        let icon="appstore";
        if(item.icon!==undefined && item.icon!==null && item.icon!==''){  icon=item.icon;  }
        if (item.children!==undefined) {
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          if(item.parentNodeId!=='root'){title=<span style={{fontSize:'14px'}} >{item.label}</span>;}
          return <SubMenu  key={item.id}  title={title}>
              {loop(item.children)}
           </SubMenu>;
        }else if(item.parentNodeId==='root'){
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          return <Menu.Item key={item.id} style={{fontSize:'14px'}}  >{title}</Menu.Item>;
        }else{
          if(item.count!==undefined){
            return <Menu.Item key={item.id} style={{fontSize:'14px'}} >{item.label}<Badge count={item.count} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></Menu.Item>;
          }else{
            return <Menu.Item key={item.id} style={{fontSize:'14px'}} >{item.label}</Menu.Item>;
          }
        }
    });
    const menus = loop(this.state.menuData);
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
                <Menu  mode="inline"
                  style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px'}}
                  defaultSelectedKeys={['home']}
                  onClick={this.handleClick}
                >
                    <Menu.Item key="home" >
                      <Icon type="home" style={{fontSize:'14px'}} />
                      <span style={{fontSize:'14px'}} >Home</span>
                    </Menu.Item>
                    {menus}
                    <SubMenu  key='gatewayConfig'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>网关配置</span></span>}>
                        <Menu.Item key='GatewayAppList' style={{fontSize:'14px'}} >网关应用管理</Menu.Item>
                        <Menu.Item key='APIControllerStrategy' style={{fontSize:'14px'}} >网关控制策略</Menu.Item>
                        <Menu.Item key='GatewayGrayRelease' style={{fontSize:'14px'}} >灰度发布策略</Menu.Item>
                        <Menu.Item key='LoadBalanceStrategy' style={{fontSize:'14px'}} >负载均衡策略</Menu.Item>
                        <Menu.Item key='MockData' style={{fontSize:'14px'}} >模拟数据管理</Menu.Item>
                        <Menu.Item key='ListBusinessSystems' style={{fontSize:'14px'}} >业务系统注册</Menu.Item>
                        <Menu.Item key='VariantConfig' style={{fontSize:'14px'}} >网关变量配置</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='pluginMgr'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>插件管理</span></span>}>
                        <Menu.Item key='ControlStrategyBeans' style={{fontSize:'14px'}} >网关控制策略插件</Menu.Item>
                        <Menu.Item key='LoadbalanceBeans' style={{fontSize:'14px'}} >路由负载均衡插件</Menu.Item>
                        <Menu.Item key='GrayPluginBeans' style={{fontSize:'14px'}} >路由灰度发布插件</Menu.Item>
                        <Menu.Item key='APIParamsCheckBeans' style={{fontSize:'14px'}} >API参数验证插件</Menu.Item>
                        <Menu.Item key='LocalServiceNamesBeans' style={{fontSize:'14px'}} >本地服务实例维护</Menu.Item>
                    </SubMenu>
                    <SubMenu  key='gatewMonitor'  title={<span style={{fontSize:'14px'}} ><Icon type='appstore' style={{fontSize:'14px'}} /><span>网关监控</span></span>} >
                        <Menu.Item key='TopologicalGraph' style={{fontSize:'14px'}} >网关拓朴图</Menu.Item>
                        <Menu.Item key='LocalServiceCache' style={{fontSize:'14px'}} >服务实例缓存</Menu.Item>
                        <Menu.Item key='ClusterServer' style={{fontSize:'14px'}} >网关集群服务器</Menu.Item>
                        <Menu.Item key='Hystrix' style={{fontSize:'14px'}} >Hystrix监控</Menu.Item>
                    </SubMenu>
                </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
