import React from 'react';
import ReactDOM from 'react-dom';
import {TreeSelect} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const loadTreeJsonUrl=URI.CORE_CATEGORYNODE.asynGetSelectControlJson+"?rootName=所有文档&categoryId=Document";

//树异步模式

class TreeNodeSelect extends React.Component {
  constructor(props){
    super(props);
    //console.log(props);
    this.state = {
      treeData:[{
  label: 'Node1',
  value: '0-0',
  key: '0-0',
  children: [{
    label: 'Child Node1',
    value: '0-0-1',
    key: '0-0-1',
  }, {
    label: 'Child Node2',
    value: '0-0-2',
    key: '0-0-2',
  }],
}, {
  label: 'Node2',
  value: '0-1',
  key: '0-1',
}],
    }
  }

  componentDidMount=()=>{
    //发送ajax请求
    AjaxUtils.get(loadTreeJsonUrl,(data)=>{this.setState({treeData:data});});
  }

  handleChange=(value, label, extra)=>{
    this.props.onChange(value, label, extra);
  }

  render() {
    const value=this.props.value;
    const option=this.props.options||{};
    return (
          <TreeSelect
              {...option}
              placeholder="Please select"
              treeData={this.state.treeData}
              value={value}
              onChange={this.handleChange}
          />
        );
  }

}

export default TreeNodeSelect;
