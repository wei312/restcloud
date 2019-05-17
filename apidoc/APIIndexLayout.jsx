import React from 'react';
import { Layout,Menu,Icon,Input,Badge,Breadcrumb,Dropdown,Avatar,Card,Row,Col,Popover,Modal,Spin} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../core/constants/RESTURI';
import * as AjaxUtils from '../core/utils/AjaxUtils';
import '../monitor/css/monitor.less';
import ChangeServer from '../core/components/ChangeServer';
import PageFooter from '../core/components/PageFooter';
import Iframe from '../core/components/Iframe';
import AppApiCount from './AppApiCount';
import ListAllApiDocs from './grid/ListAllApiDocs';
import ListAllTagsByAppId from './grid/ListAllTagsByAppId';
import HomePageTotalNum from './form/HomePageTotalNum';
import ListApisByDate from './grid/ListApisByDate';
import ListMyFollowApis from './grid/ListMyFollowApis';
import ListMyTestApis from './grid/ListMyTestApis';
import JsonConstants from './JsonConstants';
import APIGuide from './APIGuide';

//api文档品布局
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Header, Footer, Sider, Content } = Layout;
const TreeMenuUrl=URI.CORE_APIDOC.listSiderMenuUrl;

//home page
class APIIndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.menuPath=['API文档首页'];
    this.menuUrl=URI.CORE_APPMENU_ITEM.menuUrl+"?categoryId=core.apidoc";
    this.searchKeyword='';
    this.state={
        key:'home',
        mask:true,
        visible:false,
        collapsed: false,
        userInfo:AjaxUtils.getCookie("userName")+" 您好 "+this.getTime(),
        menuId:'home',
        menuNodeObj:{},
        menuData:[],
        appMenuData:[],
      }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    this.setState({mask:true});
    AjaxUtils.get(this.menuUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          for(let i=0;i<data.length;i++){
            data[i].key=data[i].nodeId;
          }
          this.loadDataAppMenu(data);
        }
    });
  }

  loadDataAppMenu=(allDatas)=>{
    let url=TreeMenuUrl+"?defaultMenuFlag=0"
    AjaxUtils.get(url,(data)=>{
        this.state.mask=false;
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          for(let x=0;x<data.length;x++){
              allDatas.push(data[x]);
          }
          this.setState({menuData:allDatas});
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
    this.searchKeyword='';
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
    let findFlag=(menuItem.key===key);
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

  onMenuSelected=(menuId,appId)=>{
    this.appId=appId;
    this.searchKeyword='';
    this.setState({menuId:menuId})
  }

  searchApi=(e)=>{
    let value=e.target.value;
    this.appId='';
    this.searchKeyword=value;
    this.setState({menuId:'searchApi'})
  }

  render(){
    const loop = data => data.map((item) => {
        let icon="appstore";
        if(item.icon!==undefined && item.icon!==null && item.icon!=='' ){  icon=item.icon;  }
        if (item.children!==undefined) {
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          if(item.parentNodeId!=='root'){title=<span style={{fontSize:'14px'}} >{item.label}</span>;}
          return <SubMenu  key={item.key}  title={title}>
              {loop(item.children)}
           </SubMenu>;
        }else if(item.parentNodeId==='root'){
          let title=<span style={{fontSize:'14px'}} ><Icon type={icon} style={{fontSize:'14px'}} /><span>{item.label}</span></span>;
          return <Menu.Item key={item.key} style={{fontSize:'14px'}}  >{title}</Menu.Item>;
        }else{
          if(item.serviceCount!==undefined){
            return <Menu.Item key={item.key} style={{fontSize:'14px'}} >{item.label}<Badge count={item.serviceCount} overflowCount={999}  style={{ backgroundColor: '#52c41a' }} /></Menu.Item>;
          }else{
            return <Menu.Item key={item.key} style={{fontSize:'14px'}} >{item.label}</Menu.Item>;
          }
        }
    });
    const menus = loop(this.state.menuData);

    let content;
    let menuId=this.state.menuId;
    if(menuId==='home'){
      this.state.menuNodeObj={};
      this.state.menuNodeObj.menuPath='API文档首页';
      content=<AppApiCount appId={this.appId} onMenuSelected={this.onMenuSelected} />;
    }else if(  this.state.menuNodeObj.openType==='4'){
      content=<Iframe url={this.state.menuNodeObj.url} />;
    }else if(menuId==='ListAllTagsByAppId'){
      this.state.menuNodeObj.menuPath='API按标签分类';
      content=<ListAllTagsByAppId onMenuSelected={this.onMenuSelected} />;
    }else if(menuId==='ListApisByDate'){
      this.state.menuNodeObj.menuPath='今日发布API';
      content=<ListApisByDate />;
    }else if(menuId==='ListMyFollowApis'){
        this.state.menuNodeObj.menuPath='我关注的API';
      content=<ListMyFollowApis   />;
    }else if(menuId==='ListMyTestApis'){
      this.state.menuNodeObj.menuPath='最近API测试记录';
      content=<ListMyTestApis   />;
    }else if(menuId==='ListAllApiDocs'){
      this.state.menuNodeObj.menuPath='所有API列表';
      content=<ListAllApiDocs onMenuSelected={this.onMenuSelected} appId='' categoryId='' />;
    }else if(menuId==='ListApiDocsByAppId'){
      this.state.menuNodeObj.menuPath=this.appId+"的API列表";
      content=<ListAllApiDocs onMenuSelected={this.onMenuSelected} appId={this.appId} categoryId='' />;
    }else if(menuId==='searchApi'){
      this.state.menuNodeObj.menuPath=this.appId+"API搜索结果";
      content=<ListAllApiDocs onMenuSelected={this.onMenuSelected} appId='' categoryId='' keyword={this.searchKeyword} />;
    }else if(menuId==='JSON'){
      this.state.menuNodeObj.menuPath=this.appId+"前端JSON常量";
      content=<JsonConstants  />;
    }else if(menuId==='APIGuide'){
      this.state.menuNodeObj.menuPath=this.appId+"API调用指南";
      content=<APIGuide  />;
    }else{
      //说明是api的分类菜单
      content=<ListAllApiDocs onMenuSelected={this.onMenuSelected} appId={this.state.menuNodeObj.appId} categoryId={this.state.menuNodeObj.nodeId} />;
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
                      <span style={{fontSize:'14px'}} >API Home</span>
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
                <Icon style={{paddingLeft:'30px'}} type="search" theme="outlined" />
                  <Input
                   placeholder="在所有API中搜索"
                   className="certain-category-icon"
                   style={{border:'0px',selection:'none',width:'360px'}}
                   onPressEnter={this.searchApi}
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
               {this.state.menuId==='home'?<HomePageTotalNum onMenuSelected={this.onMenuSelected} />:''}
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

export default APIIndexLayout;
