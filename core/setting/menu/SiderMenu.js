import React from 'react';
import { Menu,Icon} from 'antd';
import { browserHistory } from 'react-router'
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const basePath=URI.rootPath;
const appSettings=basePath+"/monitor/setting/platform/config";
const platforminfo=basePath+"/monitor/setting/platform/info";
const scheduler=basePath+"/monitor/setting/scheduler";
const langs=basePath+"/monitor/setting/langs";
const snUrl=basePath+"/monitor/setting/sn";
const platformTemplateUrl=basePath+"/monitor/setting/platformtemplate";
const serviceControl=basePath+"/monitor/setting/serviceControllers/";
const gatewayRouterUrl=basePath+"/monitor/setting/gateway/loadbalance/";
const getControllerCategorysUrl=URI.CORE_CATEGORYNODE.listAllNodes;
const BusinsessSystem=basePath+"/monitor/setting/businesssystems";
const categorytype=basePath+"/monitor/setting/categorytype";
const envSettings=basePath+"/monitor/setting/environment";
const dataSourceSettings=basePath+"/monitor/setting/datasource";

class SiderMenu extends React.Component{

  constructor(props){
    super(props);
    this.state={
      mask:false,
      current: platforminfo,
      controllerStrategyData:[{id:"all",text:"所有控制策略"}],
      RouterStreategyCategoryData:[{id:"all",text:"所有路由策略"}]
    };
  }

  handleClick=(e)=>{
    browserHistory.push(e.key);
    this.setState({current: e.key});
  }

  componentDidMount(){
      let url=getControllerCategorysUrl+"?categoryId=ControlStrategy";
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({controllerStrategyData:data});
          }
      });
  }

  render() {
    return (
      <Menu onClick={this.handleClick}
        defaultOpenKeys={['systemSet','controllerStrategy','routerSet']}
        selectedKeys={[this.state.current]}
        mode="inline"
      >
        <SubMenu key="systemSet"  title={<span><Icon type="appstore" />系统设置</span>}>
          <Menu.Item key={platforminfo}>平台版权信息</Menu.Item>
          <Menu.Item key={appSettings}>平台参数配置</Menu.Item>
          <Menu.Item key={envSettings}>配置环境管理</Menu.Item>
          <Menu.Item key={dataSourceSettings}>数据源管理</Menu.Item>
          <Menu.Item key={scheduler}>定时任务设置</Menu.Item>
          <Menu.Item key={BusinsessSystem}>业务系统注册</Menu.Item>
          <Menu.Item key={langs}>多语言标签</Menu.Item>
          <Menu.Item key={platformTemplateUrl}>平台模板代码</Menu.Item>
          <Menu.Item key={categorytype}>分类管理</Menu.Item>
          <Menu.Item key={snUrl}>平台序列号</Menu.Item>
        </SubMenu>
        <SubMenu key="controllerStrategy" title={<span><Icon type="appstore" />API控制策略配置</span>}>
           {this.state.controllerStrategyData.map(item => <Menu.Item key={serviceControl+item.nodeId}>{item.nodeText}</Menu.Item>)}
        </SubMenu>
      </Menu>
    );
  }

}

export default SiderMenu;
