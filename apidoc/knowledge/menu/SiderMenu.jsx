import React from 'react';
import { Menu, Icon,Badge  } from 'antd';
import { browserHistory } from 'react-router'
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class SiderMenu extends React.Component{
  constructor(props){
    super(props);
    this.url=this.props.url;
    this.state={
      mask:false,
      data:[],
      current: 'home',
    };
  }

  componentDidMount(){
      AjaxUtils.get(this.url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({data:data});
          }
      });
  }

  handleClick=(e)=>{
    this.setState({current: e.key});
    if(e.key!==''){
      let url=URI.rootPath+"/apidocs/documents?nodeId="+e.key;
      browserHistory.push(url);
    }
  }

  render() {
    const loop = data => data.map((item) => {
        if (item.children!==undefined) {
          return <SubMenu key={item.key} title={item.label} >{loop(item.children)}</SubMenu>;
        }
        if(item.count!==undefined){
          return <Menu.Item key={item.key} >{item.label}
            (<span style={{color:'blue'}} >{item.count}</span>)
          </Menu.Item>;
        }else{
          return <Menu.Item key={item.key} >{item.label}</Menu.Item>;
        }
    });
    const menus = loop(this.state.data);

    return (
      <Menu onClick={this.handleClick}
        defaultOpenKeys={['root']}
        selectedKeys={[this.state.current]}
        mode="inline"
        inlineIndent='16'
      >
        {menus}
      </Menu>
    );
  }
}

export default SiderMenu;
