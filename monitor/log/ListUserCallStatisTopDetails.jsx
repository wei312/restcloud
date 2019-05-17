import React, { PropTypes } from 'react';
import { Table,Icon,Tag,Button,Modal,Card} from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//app应用调用top详细列表

const dataUrl=URI.LIST_MONITOR.allUserCallStatisTopDetailsUrl;

class ListUserCallStatisTopDetails extends React.Component {
  constructor(props) {
    super(props);
    this.userId=this.props.userId;
    this.startDate=this.props.startDate;
    this.endDate=this.props.endDate;
    this.state={
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading:true,
    }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({loading:true});
   let url=dataUrl+"?userId="+this.userId+"&startDate="+this.startDate+"&endDate="+this.endDate;
    AjaxUtils.get(url,(data)=>{
         this.setState({loading:false});
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({rowsData:data});
         }
     });
   }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '序号',
      dataIndex: '',
      width: '5%',
      render:(text,record,index)=>{return <Tag color='blue'>{index+1}</Tag>;}
    },{
      title: '',
      dataIndex: '',
      width: '5%',
      render:(text,record)=>{return <Icon type="user" />;}
    },{
      title: '用户Id',
      dataIndex: '',
      width: '10%',
      render:(text,record,index)=>{return this.userId;}
    },{
      title: '应用',
      dataIndex: 'appId',
      width: '10%',
    },{
      title: 'API名称',
      dataIndex: 'actionName',
      width: '20%',
    },{
      title: 'API URL',
      dataIndex: 'actionMapUrl',
      width: '20%',
    },{
      title: '总调用次数',
      dataIndex: 'total',
      width: '10%'
    },{
      title: '平均响应时间',
      dataIndex: 'avg',
      width: '10%',
      render:(text,record,index)=>{return <span>{text}(毫秒)</span>;}
    }
    ];

    return (
      <div>
        <Table
          bordered={true}
          rowKey={record => record.userName}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          pagination={false}
        />
    </div>
    );
  }
}
export default ListUserCallStatisTopDetails;
