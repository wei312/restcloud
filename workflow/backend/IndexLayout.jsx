import React from 'react';
import {Menu,Layout,Icon,Card} from 'antd';
import * as GridUtils from '../../core/utils/GridUtils';
import ListProcessByAppId from './grid/ListProcessByAppId';
import ListRuleByAppId from './grid/ListRuleByAppId';
import ListProcessInstance from './grid/ListProcessInstance';
const { Sider, Content } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class IndexLayout extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.state={
      current:'process',
    }
  }

  handleClick=(e)=>{
    this.setState({current: e.key});
  }

  render(){
    let grid;
    if(this.state.current==='process'){
        grid=<ListProcessByAppId appId={this.appId}></ListProcessByAppId>;
    }else if(this.state.current==='rule'){
        grid=<ListRuleByAppId appId={this.appId}></ListRuleByAppId>;
    }else if(this.state.current==='instance'){
        grid=<ListProcessInstance appId={this.appId}></ListProcessInstance>;
    }
    return (
      <Card  style={{margin:'5px'}}>
      <Layout style={{ background: '#fff',padding:0,borderRadius:'4px' }}>
        <Sider style={{ background: '#fff',margin:0,padding:0}} width={180} >
            <Menu onClick={this.handleClick}
              defaultOpenKeys={['ProcessMenu']}
              selectedKeys={[this.state.current]}
              mode="inline"
              theme='light'
            >
              <SubMenu key="ProcessMenu"  title={<span><Icon type="appstore" />业务流程</span>} >
                <Menu.Item key='process'>业务流程</Menu.Item>
                <Menu.Item key='rule'>业务规则</Menu.Item>
                <Menu.Item key='instance'>流程实例</Menu.Item>
              </SubMenu>
            </Menu>
        </Sider>
        <Content style={{left:'-1px',minHeight:'500px',padding: '0 5px',borderLeft:'1px solid #e9e9e9',position:'relative'}} >
          {grid}
        </Content>
      </Layout>
      </Card>
    );
  }
}

export default IndexLayout;
