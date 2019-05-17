import React from 'react';
import SiderMenu from './menu/SiderMenu';
import { Layout} from 'antd';
const { Sider, Content } = Layout;

//Index是RestUrlManager的入口布局文件
class indexLayout extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    return (
      <Layout style={{ background: '#fff',padding:25,borderRadius:'4px' }}>
        <Sider style={{ background: '#fff'}} >
          <SiderMenu/>
        </Sider>
        <Content style={{left:'-1px',background: '#fff', padding: '5px 25px',borderLeft:'1px solid #e9e9e9',position:'relative'}} >
          {this.props.children}
        </Content>
      </Layout>

      );
  }
}

export default indexLayout;
