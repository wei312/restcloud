import React from 'react';
import {Button, Spin,Select,Icon,Input} from 'antd';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

class ShowLog extends React.Component{
  constructor(props){
    super(props);
    this.record=this.props.record;
    this.state={
    };
  }

  render() {
    let record=this.record;
    console.log(record);
    return (
      <div>
        <p><b>请求URL:</b>{record.requestUrl}</p>
        <Input.TextArea autosize value={AjaxUtils.formatJson(JSON.stringify(record))} />
      </div>
    );
  }
}

export default ShowLog;
