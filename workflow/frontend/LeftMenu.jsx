import React from 'react';
import { Menu,Icon,Input,Badge,Breadcrumb,Spin} from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as CURURI  from '../utils/constants';

//portal开发左则菜单
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const CountUrl=CURURI.WORKFLOW_FRONTEND.UserToDoCount;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.menuClick=this.props.memuClick;
    this.state={
        mask:false,
        menuId:'home',
        todoCount:0,
        readCount:0,
      }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    AjaxUtils.get(CountUrl,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({todoCount:data.data.todoCount,readCount:data.data.readCount,mask:false});
        }
    });
  }

  //清除定时器
  componentWillUnmount(){

  }

  handleClick=(e)=>{
    this.setState({current: e.key});
    this.menuClick(e.key);
  }


  render(){
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
                <Menu  mode="inline"
                  style={{minHeight:'800px',fontSize:'16px',paddingTop:'20px',background:'#fff'}}
                  defaultSelectedKeys={['home']}
                  onClick={this.handleClick}
                >
                    <Menu.Item key="home" >
                      <Icon type="home" style={{fontSize:'14px'}} />
                      <span style={{fontSize:'14px'}} >流程申请</span>
                    </Menu.Item>
                    <Menu.Item key='ListToDos' style={{fontSize:'14px'}} ><Icon type="profile" style={{fontSize:'14px'}} /><span>我的待办<Badge count={this.state.todoCount} overflowCount={999}  style={{ backgroundColor: '#f50' }} /></span></Menu.Item>
                    <Menu.Item key='ListReadDocs' style={{fontSize:'14px'}} ><Icon type="project" style={{fontSize:'14px'}} /><span>我的待阅<Badge count={this.state.readCount} overflowCount={999}  style={{ backgroundColor: '#f50' }} /></span></Menu.Item>
                    <Menu.Item key='ListDoneDocs' style={{fontSize:'14px'}} ><Icon type="pushpin" style={{fontSize:'14px'}} /><span>我的已办</span></Menu.Item>
                    <Menu.Item key='ListMyStartDocs' style={{fontSize:'14px'}} ><Icon type="user-add" style={{fontSize:'14px'}} /><span>我申请的</span></Menu.Item>
                    <Menu.Item key='ListAllApprovals' style={{fontSize:'14px'}} ><Icon type="profile" style={{fontSize:'14px'}} /><span>所有审批中流程</span></Menu.Item>
                    <Menu.Item key='ListClosedDocs' style={{fontSize:'14px'}} ><Icon type="profile" style={{fontSize:'14px'}} /><span>已归档的流程</span></Menu.Item>
                    <Menu.Item key='ListEntrustedDocs' style={{fontSize:'14px'}} ><Icon type="profile" style={{fontSize:'14px'}} /><span>我委托的</span></Menu.Item>
                    <Menu.Item key='ListDraftDocs' style={{fontSize:'14px'}} ><Icon type="tag" style={{fontSize:'14px'}} /><span>我的草稿箱</span></Menu.Item>
                    <Menu.Item key='ListFollowDocs' style={{fontSize:'14px'}} ><Icon type="star" style={{fontSize:'14px'}} /><span>我关注的</span></Menu.Item>
                    <Menu.Item key='DesignerFlow' style={{fontSize:'14px'}} ><Icon type="appstore" style={{fontSize:'14px'}} /><span>流程设计</span></Menu.Item>
                </Menu>
        </Spin>
    );
  }
}

export default LeftMenu;
