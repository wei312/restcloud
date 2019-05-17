import React from 'react';
import { Layout} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import  NavKnowledgeTree from './menu/SiderMenu';
const { Sider, Content } = Layout;

const loadTreeJsonUrl=URI.CORE_CATEGORYNODE.asynGetSelectControlJson+"?categoryId=Document&nodeId=root&rootName=开发文档";

//Index是RestUrlManager的入口布局文件
class indexLayout extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    return (
      <Layout style={{ minHeight:'600px',background: '#fff',padding:25,borderRadius:'4px' }}>
        <Sider style={{ background: '#fff'}} >
          <NavKnowledgeTree url={loadTreeJsonUrl}/>
        </Sider>
        <Content style={{left:'-1px',background: '#fff', padding: '5px 25px',borderLeft:'1px solid #e9e9e9',position:'relative'}} >
          {this.props.children}
        </Content>
      </Layout>

      );
  }
}

export default indexLayout;
