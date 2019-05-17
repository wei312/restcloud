import React from 'react';
import {Spin,Tag,Input,Tabs,Table,Card} from 'antd';
import { Link  } from 'react-router';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import '../css/serviceList.less';
import ShowApiDoc from '../form/ShowApiDoc';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_CORE_SERVICES.listServiceByTagName;
const basePath=URI.rootPath;

class ListServicesByTagName extends React.Component {
  constructor(props) {
      super(props);
      this.appId=this.props.appId;
      this.tagName=this.props.tagName;
      this.state={
        pagination:{},
        mask:true,
        rowsData:[],
      }
  }
  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.tagName!==nextProps.tagName){
        this.tagName=nextProps.tagName;
        this.loadData();
    }
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?tagName="+this.tagName;
    GridActions.loadData(this,url,pagination,filters,sorter,{},(data)=>{
      this.setState({mask:false,rowsData:data});
    });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=(record)=>{
      return (
        <Card title="服务详细说明">
        <ShowApiDoc id={record.id} />
        </Card>
        );
    }

    const columns=[{
      title: 'Method',
      dataIndex: 'methodType',
      width:'6%',
      render:text => {
        if(text==="POST"){
            return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
        }else if(text==="GET"){
            return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
        }else if(text==="DELETE" ){
            return <Tag color="#f50" style={{width:50}} >DEL</Tag>
        }else if(text==="PUT"){
            return <Tag color="pink" style={{width:50}} >{text}</Tag>
        }else if(text==="*"){
            return <Tag color="#f50" style={{width:50}} >全部</Tag>
        }
      },
      },{
        title: 'RestUrl',
        dataIndex: 'mapUrl',
        width: '40%',
        sorter: true,
      },{
        title: '名称',
        dataIndex: 'configName',
        width:'40%',
      },{
        title: '应用Id',
        dataIndex: 'appId',
        sorter: true,
        width:'20%'
      }];


    return (
        <Spin spinning={this.state.mask} tip="Loading..." >
                <Table
                  bordered={false}
                  rowKey={record => record.id}
                  expandedRowRender={expandedRow}
                  dataSource={rowsData}
                  columns={columns}
                  loading={loading}
                />
          </Spin>
    );
   }
}

export default ListServicesByTagName;
