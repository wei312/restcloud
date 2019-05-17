import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Modal,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import ChangeServer from '../core/components/ChangeServer';
import PageFooter from '../core/components/PageFooter';
import LeftMenu from './LeftMenu';

//任务看板等
import RightHome from './RightHome';
import LogCalendar from '../designer/AppManager/grid/DevLogCalendar';
import ListAllApps from '../designer/AppManager/grid/ListAllApps';
import ListDevLogs from '../designer/AppManager/grid/ListDevLogs';
import TaskBoard from '../designer/AppManager/grid/TaskBoard';
import ListTasks from '../designer/AppManager/grid/ListTasks';
import ListNotices from './notice/grid/ListNotices';
import ListMessage from './message/grid/ListMessage';

//系统设置
import Set_platforminfo from '../core/setting/platforminfo';
import Set_NewSN from '../core/setting/form/NewSN';
import Set_ListBusinessSystems from '../core/setting/grid/ListBusinessSystems';
import Set_ListEnvironments from '../core/setting/grid/ListEnvironments';
import Set_ListDataSource from '../core/datasource/grid/ListDataSource';
import Set_ListCategoryType from '../core/setting/grid/ListCategoryType';
import Set_ServiceControls from '../core/setting/grid/ListServiceControlStrategy';
import Set_ListLoadBalance from '../core/setting/grid/ListLoadBalance';

//admin-定时任务管理
import Setting_Scheduler from '../core/setting/grid/ListSchedulerTasks';
import Setting_PlatformSetting from '../core/setting/grid/ListPlatformSetting';
import Setting_Langs from '../core/setting/grid/ListMultiLangs';
import Setting_PlatformTemplate from '../core/setting/grid/ListPlatformTemplateCode';

//API开发定制部分
import DesignerRightHome from '../designer/DesignerRigthHome';


//Portal首页
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const CountUrl=URI.CORE_HOMEPAGE.GetPortalTopWarningCount;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId="portal";
    this.menuPath=['Home'];
    this.searchKeyword='';
    this.state={
        key:'home',
        mask:false,
        visible:false,
        collapsed: false,
        userInfo:AjaxUtils.getCookie("userName")+" 您好 "+this.getTime(),
        menuId:'home',
        message:{},
      }
      // window.document.title="API网关-"+window.document.title;
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    AjaxUtils.get(CountUrl,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({message:data,mask:false});
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

  //左则菜单子组件中点击执行本函数
  handleClick=(key)=>{
    this.setState({menuId:key});
  }

  //设置菜单点击执行
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
      browserHistory.push(URI.loginUrl);
    }else if(key==='changeServer'){
      this.setState({visible:true,menuId:key});//切换服务器
    }else if(key==='warning'){
      this.setState({menuId:'WarningMessage'});//切换服务器
    }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    let content,modalForm;
    let modalTitle='';
    let menuId=this.state.menuId;
    if(menuId==='LogCalendar'){
        modalTitle='工作日记';
        content=<LogCalendar menuClick={this.handleClick} />;
    }else if(menuId==='MoreLogCalendar'){
        modalTitle='工作日记/所有日记';
        content=<ListDevLogs  />;
    }else if(menuId==='ListNotices'){
       modalTitle='通知公告';
        content=<ListNotices  />;
    }else if(menuId==='TaskBoard'){
        modalTitle='任务看板';
        content=<TaskBoard menuClick={this.handleClick} />;
    }else if(menuId==='WarningMessage'){
        modalTitle='预警消息';
        content=<ListMessage />
    }else if(this.state.menuId==='Setting_PlatformSetting'){
      modalTitle='平台设置/平台参数设置';
      content=<Setting_PlatformSetting />;
    }else if(this.state.menuId==='Set_ListEnvironments'){
      modalTitle='平台设置/环境管理';
      content=<Set_ListEnvironments />;
    }else if(this.state.menuId==='Set_ListDataSource'){
      modalTitle='平台设置/数据源管理';
      content=<Set_ListDataSource />;
    }else if(this.state.menuId==='Setting_Scheduler'){
      modalTitle='平台设置/定时任务管理';
      content=<Setting_Scheduler />;
    }else if(this.state.menuId==='Set_ListBusinessSystems'){
      modalTitle='平台设置/业务系统注册';
      content=<Set_ListBusinessSystems />;
    }else if(this.state.menuId==='Setting_Langs'){
      modalTitle='平台设置/多语言标签';
      content=<Setting_Langs />;
    }else if(this.state.menuId==='Setting_PlatformTemplate'){
      modalTitle='平台设置/平台模板代码';
      content=<Setting_PlatformTemplate />;
    }else if(this.state.menuId==='Set_ListCategoryType'){
      modalTitle='平台设置/全局分类管理';
      content=<Set_ListCategoryType />;
    }else if(this.state.menuId==='Set_ListLoadBalance'){
      modalTitle='平台设置/负载均衡策略';
      content=<Set_ListLoadBalance />;
    }else if(this.state.menuId==='Set_ControllerStrategy'){
      modalTitle='平台设置/服务控制策略';
      content=<Set_ServiceControls />;
    }else if(this.state.menuId==='Set_platforminfo'){
      modalTitle='关于平台/版权信息';
      content=<Set_platforminfo />;
    }else if(this.state.menuId==='Set_NewSN'){
      modalTitle='关于平台/系统序列号';
      content=<Set_NewSN />;
    }else if(this.state.menuId==='Task_1'){
      modalTitle='任务看板/任务列表';
      content=<ListTasks status='1' />;
    }else if(this.state.menuId==='Task_2'){
      modalTitle='任务看板/待确认任务';
      content=<ListTasks status='2' />;
    }else if(this.state.menuId==='Task_5'){
      modalTitle='任务看板/已关闭任务';
      content=<ListTasks status='5' />;
    }else if(this.state.menuId==='changeServer'){
      modalForm=<ChangeServer close={this.handleCancel} />;
      modalTitle='切换服务器';
      content=<RightHome  />;
    }else if(this.state.menuId==='ApiDesigner'){
      modalTitle='API开发';
      content=<DesignerRightHome appId='pub'  />;
    }else{
        modalTitle='平台首页';
        content=<RightHome  />;
    }
    this.menuPath=modalTitle.split("/");

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Layout >
        <Modal key={Math.random()} title={modalTitle} maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='760px'
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            {modalForm}
        </Modal>
              <Sider
                trigger={null}
                width={240}
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
                  <div  style={{float:'right'}} >
                    <span className='topHeaderButton-b' onClick={this.topMenuClick.bind(this,'warning')} ><Badge count={this.state.message.warningCount} overflowCount={99}  style={{ backgroundColor: '#f50',marginTop:'-6px' }} ><Icon type="bell" style={{fontSize:'16px'}} /></Badge></span>
                    <span className='topHeaderButton-b' onClick={this.topMenuClick.bind(this,'changeServer')} ><Icon type="sync" />切换</span>
                    <span className='topHeaderButton-b' onClick={this.topMenuClick.bind(this,'Logout')} ><Icon type="logout" />退出</span>
                  </div>
                 <div  style={{float:'right',fontSize:'12px',padding:0,margin:'0 20px 0 0'}} >
                        <Avatar src="/res/iconres/images/avatar.png"  size={32} style={{ backgroundColor: '#7265e6' }}  />{' '}
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
