import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Modal,Spin,Button} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../../core/constants/RESTURI';
import * as CURURI  from '../utils/constants';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import Iframe from '../../core/components/Iframe';
import PageFooter from '../../core/components/PageFooter';
import LeftMenu from './LeftMenu';
import RightHome from './RightHome';
import ListToDos from './grid/ListToDoDocs';
import ListReadDocs from './grid/ListReadDocs';
import ListDoneDocs from './grid/ListDoneDocs';
import ListMyStartDocs from './grid/ListMyStartDocs';
import ListAllApprovals from './grid/ListAllApprovals';
import ListClosedDocs from './grid/ListClosedDocs';
import ListEntrustedDocs from './grid/ListEntrustedDocs';
import ListDraftDocs from './grid/ListDraftDocs';
import ListFollowDocs from './grid/ListFollowDocs';

//Portal首页
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;

//home page
class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId="portal";
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
  handleClick=(key)=>{
    if(key==='DesignerFlow'){
      window.open(CURURI.workflowHost+"/r?wf_num=S013",'workflow');
    }else{
      this.setState({menuId:key});
    }
  }

  //顶部菜单点击事件
  topMenuClick=(key)=>{
    if(key==='Logout'){
      AjaxUtils.logout();
      browserHistory.push(URI.loginUrl);
    }else if(key==='Portal'){
      browserHistory.push(URI.adminIndexUrl);
    }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    let content,modalForm;
    let modalTitle='';
    let menuId=this.state.menuId;
    if(menuId==='ListToDos'){
        modalTitle='我的待办';
        content=<ListToDos  />;
    }else if(menuId==='ListReadDocs'){
        modalTitle='我的待阅';
        content=<ListReadDocs  />;
    }else if(menuId==='ListDoneDocs'){
        modalTitle='我的已办';
        content=<ListDoneDocs  />;
    }else if(menuId==='ListMyStartDocs'){
        modalTitle='我申请的流程';
        content=<ListMyStartDocs  />;
    }else if(menuId==='ListAllApprovals'){
        modalTitle='所有审批中的流程';
        content=<ListAllApprovals  />;
    }else if(menuId==='ListClosedDocs'){
        modalTitle='已归档的流程';
        content=<ListClosedDocs  />;
    }else if(menuId==='ListEntrustedDocs'){
        modalTitle='我委托的流程';
        content=<ListEntrustedDocs  />;
    }else if(menuId==='ListDraftDocs'){
        modalTitle='我的草稿箱';
        content=<ListDraftDocs  />;
    }else if(menuId==='ListFollowDocs'){
        modalTitle='我关注的流程';
        content=<ListFollowDocs  />;
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
              <div style={{height:'64px',background:'#108ee9' }}>
                <div className="monitorlogo-w" />
              </div>
                <LeftMenu memuClick={this.handleClick} appId={this.appId} ></LeftMenu>
              </Sider>
              <Layout >
                <Header style={{ background: '#108ee9', padding: 0 }} >
                  <div style={{borderLeft:"1px solid #ebedee",position:'relative',height:"30px",float:'left',top:15}} />
                  <Icon
                    className="monitorTrigger-w"
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.toggle}
                  />
                  <span className='topHeaderText' >微 服 务 流 程 平 台</span>
                  <div  style={{float:'right'}} >
                    <span className='topHeaderButton' onClick={this.topMenuClick.bind(this,'Portal')} ><Icon type="home" />首页</span>
                    <span className='topHeaderButton' onClick={this.topMenuClick.bind(this,'Logout')} ><Icon type="logout" />退出</span>
                  </div>
                 <div  style={{float:'right',fontSize:'12px',padding:0,margin:'0 20px 0 0',color:'#fff'}} >
                        <Avatar src="/res/iconres/images/avatar.png"  size={32} style={{ backgroundColor: '#fff' }}  />{' '}
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
