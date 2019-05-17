import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Spin,Tag,Icon,Modal,Card,Input,Tabs,Table} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import EditDemoCode from './EditDemoCode';
import EditDocRemark from './EditDocRemark';
import NewTest from '../../designer/tester/form/NewTest';
import '../css/serviceList.less';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/styles/lowlight';
import OpenApi from './OpenApi';
import APIChangeLogTimeLine from './APIChangeLogTimeLine';
import APIIssueComment from './APIIssueComment';
import ApmLogByApiCharts from '../../monitor/apm/ApmLogByApiCharts';

const serviceDetails=URI.CORE_APIDOC.serviceDetails; // 显示服务的详细信息
const serviceDetailsMore=URI.CORE_APIDOC.serviceDetailsMore; //显示文档的补充信息
const followApiUrl=URI.CORE_APIDOC.addFollow; //关注API
const TabPane = Tabs.TabPane;

class ShowApiDoc extends React.Component{
  constructor(props){
    super(props);
    this.serviceId=this.props.id;
    this.state={
      mask:false,
      visible:false,
      serviceData:{demoCode:''},
      action:'',
      showTestForm:false,
      width:800,
    };
  }

  componentDidMount(){
    this.updateSize();
    window.addEventListener('resize', () => this.updateSize());
    this.loadData();
  }

  updateSize() {
    const parentDom = ReactDOM.findDOMNode(this).parentNode;
    let width = parentDom.offsetWidth-100;
    this.setState({width:width});
  }

  loadData=()=>{
      this.setState({mask:true});
      //载入服务文档说明
      let url=serviceDetails;
      AjaxUtils.getjson(url,{id:this.serviceId},(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.state==='1'){
              data.state='启用';
            }else if(data.state==='2'){
              data.state='调试';
            }else if(data.state==='3'){
              data.state='停用';
            }else if(data.state==='4'){
              data.state='模拟';
            }
            if(data.demoCode==='' || data.demoCode===undefined){data.demoCode='-无-'}
            this.setState({serviceData:data});
          }
      });
  }

  openEditor=(action)=>{
    this.setState({action:action,visible:true});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  closeTestForm=()=>{
    this.setState({showTestForm:false});
  }
  showTestForm=()=>{
    this.setState({showTestForm:true});
  }

  followApi=()=>{
    this.setState({mask:true});
    AjaxUtils.post(followApiUrl,{ids:this.state.serviceData.id},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo("关注成功!");
        }
    });
  }

  render() {
    let {serviceData,action}=this.state;
    let permissionsTag=<Tag>未绑定权限</Tag>;
    let permissions=serviceData.permissions;
    if(permissions!==undefined && permissions!==''  && permissions!==null){
        let permissionsArray=permissions.split(",");
        permissionsTag=permissionsArray.map(item=><Tag key={item} color='#87d068' >{item}</Tag>);
    }
    let effectiveUserTag=<Tag>所有用户</Tag>;
    let effectiveUser=serviceData.effectiveUser;
    if(effectiveUser!==undefined && effectiveUser!==''  && effectiveUser!==null){
        let effectiveUserArray=effectiveUser.split(",");
        effectiveUserTag=effectiveUserArray.map(item=><Tag key={item} color='#87d068' >{item}</Tag>);
    }

    let categoryIdsTag=<Tag>未指定分类</Tag>;
    let categoryName=serviceData.categoryName;
    if(categoryName!==undefined && categoryName!==''  && categoryName!==null){
        let categoryNameArray=categoryName.split(",").filter(d=>d!==""); //去空数组
        categoryIdsTag=categoryNameArray.map(item=><Tag key={item}  >{item}</Tag>);
    }

    let serviceTagsTag=<Tag>未打标签</Tag>;
    let tags=serviceData.tags;
    if(tags!==undefined && tags!==''  && tags!==null){
        let tagsArray=tags.split(",").filter(d=>d!==""); //去空数组
        serviceTagsTag=tagsArray.map(item=><Tag key={item}  >{item}</Tag>);
    }

    //显示输入参数
    let allParams=serviceData.inParams||'[]';
    let allParamsArray=JSON.parse(allParams);
    let inParamsArray=allParamsArray.filter((element, index, array)=>{
      return element.paramMode!=='OUT';
    });
    let inParamsTr=inParamsArray.map(item=>{
      let color="";
      if(item.required===true){color='red';}
      let minLength=item.minLength||0;
      let maxLength=item.maxLength||0;
      return (<tr key={item.id} >
            <td  style={{color:'blue'}} >{item.fieldId}</td>
            <td>{item.fieldName}</td>
            <td>{item.in}</td>
            <td  >{item.fieldType}</td>
            <td  style={{color:color}} >{item.required===true?'是':'否'}</td>
            <td>{item.sampleValue}</td>
            <td>{item.defaultValue}</td>
            <td>{item.breakFlag===true?'是':'否'}</td>
            <td>{item.tip}</td>
            <td>{item.validateBeanArgs}</td>
            <td>{item.errorCode}</td>
            <td>{minLength+"至"+maxLength}</td>
            </tr>);
    });

    //显示错误码定义
    let errorCodes=serviceData.errorCodes||'[]';
    let errorCodesArray=JSON.parse(errorCodes);
    let errorCodesTr=errorCodesArray.map(item=>{
      return (<tr key={item.id} >
            <td style={{width:'15%'}}>{item.code}</td>
            <td>{item.message}</td>
            <td>{item.description}</td>
            </tr>);
    });

    //输出参数补充
    let title='';
    let formObj;
    let modelStyle;
    if(action==='docRemark'){
      title='补允说明';
      formObj=<EditDocRemark id={serviceData.apiDocId} serviceId={serviceData.id} close={this.closeModal} />;
    }else if(action==='demoCode'){
      title='示例代码';
      formObj=<EditDemoCode id={serviceData.apiDocId} serviceId={serviceData.id} close={this.closeModal} />;
    }

    let configType=serviceData.configType;
    if(configType==='REG'){configType='注册服务';}
    else if(configType==='JOIN'){configType='聚合服务';}
    else{configType='直接发布';}

    let joinServiceTag;
    let joinRestJson=serviceData.joinRestId;
    if(joinRestJson!=='' && joinRestJson!=='[]' && joinRestJson!==undefined && joinRestJson!==null ){
       joinRestJson=JSON.parse(joinRestJson);
       let i=0;
       joinServiceTag=joinRestJson.map((item)=>{
        i++;
        return <div style={{margin:'5px'}}><Tag key={item.serviceId} color='green' >{i+"."+item.method+"->"+item.url+(item.prevServiceId===''?'':'(有依赖服务)')}</Tag></div>
       });
    }

    let responseSample="";
    if(serviceData.responseSample!==undefined && serviceData.responseSample!==""){
      responseSample=AjaxUtils.formatJsonToHtml(serviceData.responseSample);
    }
    let failResponseSample="";
    if(serviceData.failResponseSample!==undefined && serviceData.failResponseSample!==""){
      failResponseSample=AjaxUtils.formatJsonToHtml(serviceData.failResponseSample);
    }

    let requestBodySampleValue="";
    if(serviceData.RequestBodySampleValue!==undefined && serviceData.RequestBodySampleValue!=="" && serviceData.RequestBodySampleValue!==null){
      requestBodySampleValue=AjaxUtils.formatJsonToHtml(serviceData.RequestBodySampleValue);
    }

    return (
      <div style={{width:this.state.width}} >
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Modal key={Math.random()} title={title} maskClosable={false}
          visible={this.state.visible}
          width='1000px'
          footer=''
          style={modelStyle}
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          {formObj}
      </Modal>

      <Tabs defaultActiveKey="ApiDoc" onChange={this.onTabChange} size='large'  >
          <TabPane tab="API说明文档" key="ApiDoc" animated={false} style={{width:'100%'}} >
                    <div style={{paddingBottom:'10px'}}>
                    <Button type='primary'  onClick={this.followApi}  icon="heart" >关注本API</Button>{' '}
                    </div>
                    <div style={{paddingBottom:'10px'}}>
                      <h2>API名称:{serviceData.configName+" V"+serviceData.version}</h2>
                      <ul style={{lineHeight:'30px',listStyleType:'square',marginLeft:'20px'}} >
                      <li>
                        <Tag color="#2db7f5" >{serviceData.methodType}</Tag> {serviceData.mapUrl}
                      </li>
                      </ul>
                    </div>
                    <div style={{paddingBottom:'20px'}} className='apidoc'  >
                      <h2>参数输入方式</h2>
                      {serviceData.requestBodyFlag?
                          <table style={{width:'100%'}}><tbody>
                          <tr key='out02'><th>配置项</th><th>配置值</th></tr>
                          <tr><td style={{width:'20%'}}>RequestBody输入</td><td>{serviceData.requestBodyFlag?"是":"否"}</td></tr>
                          <tr><td>是否必传</td><td>{serviceData.requestBodyRequired?"是":"否"}</td></tr>
                          <tr><td>数据类型</td><td>{serviceData.requestBodyDataType}</td></tr>
                          <tr><td>引用对像</td><td>{serviceData.requestBodySchemaRef}</td></tr>
                          <tr><td>参考值</td><td><div dangerouslySetInnerHTML={{__html:requestBodySampleValue}} ></div></td></tr>
                        </tbody></table>
                      :<div><ul><li><Tag>键值对输入</Tag></li></ul></div>
                      }
                    </div>

                    <div style={{paddingBottom:'20px'}} className='apidoc'  >
                      <h2>输入参数定义</h2>
                      <table style={{width:'100%'}} key='t12' ><tbody key='t13' >
                        <tr key='in1'>
                        <th>参数id</th>
                        <th>参数名</th>
                        <th>位置</th>
                        <th>类型</th>
                        <th>必填</th>
                        <th width='100px'>参数示例</th>
                        <th>缺省值</th>
                        <th>中断</th>
                        <th>验证提示</th>
                        <th>验证参数</th>
                        <th>错误码</th>
                        <th>长度限制</th>
                        </tr>
                        {inParamsTr}
                      </tbody></table>
                  </div>

                    <div style={{paddingBottom:'20px'}} className='apidoc'  >
                      <h2>输出示例</h2>
                        <table style={{width:'100%'}}><tbody>
                        <tr key='out02'><th>说明</th><th>输出值</th></tr>
                        <tr><td style={{width:'20%'}}>成功返回示例</td><td><div dangerouslySetInnerHTML={{__html:responseSample}} ></div></td></tr>
                        <tr><td>失败返回示例</td><td><div dangerouslySetInnerHTML={{__html:failResponseSample}} ></div></td></tr>
                      </tbody></table>
                    </div>

                    <div style={{paddingBottom:'20px'}} className='apidoc' >
                      <h2>错误码定义</h2>
                      <table style={{width:'100%'}}><tbody><tr><th>错误码</th><th>错误信息</th><th>错误详细描述</th></tr>{errorCodesTr}</tbody></table>
                    </div>

                    <div style={{paddingBottom:'10px'}} className='apidoc' >
                    <h2>调用的Class</h2>
                    <table style={{width:'100%'}}><tbody><tr>
                      <th style={{width:'20%'}} >Controller BeanId</th>
                      <th style={{width:'60%'}} >Class Path</th>
                      <th style={{width:'20%'}}>Method</th>
                      </tr>
                      <tr><td>{serviceData.beanId}</td><td>{serviceData.classPath}</td><td>{serviceData.beanMethodName}</td></tr>
                    </tbody></table>
                    </div>

                    {serviceData.modelId!==''?
                      <div style={{paddingBottom:'10px'}} className='apidoc' >
                        <h2>绑定数据模型</h2>
                        <table style={{width:'100%'}}><tbody>
                          <tr>
                          <th style={{width:'20%'}} >数据模型modeId</th>
                          <th style={{width:'80%'}} >Filters过滤条件</th>
                          </tr>
                          <tr>
                            <td>{serviceData.modelId===''?'-无-':serviceData.modelId}</td>
                            <td>{serviceData.filters}</td>
                        </tr></tbody></table>
                      </div>
                    :''}
                    {serviceData.SqlConfigId!==''?
                      <div style={{paddingBottom:'10px'}} className='apidoc' >
                        <h2>绑定SQL配置</h2>
                        <table style={{width:'100%'}}><tbody>
                          <tr><th  >SQL配置Id</th></tr>
                          <tr><td>{serviceData.sqlConfigId}</td></tr>
                        </tbody></table>
                      </div>
                      :''
                    }

                    <div style={{paddingBottom:'20px'}} className='apidoc' >
                      <h2>其他属性</h2>
                      <table style={{width:'100%'}}><tbody>
                      <tr>
                        <th style={{width:'20%'}}>属性名</th>
                        <th>配置值</th>
                      </tr>
                      <tr><td>服务类型</td><td>{configType}</td></tr>
                      <tr><td>唯一Id</td><td>{serviceData.configId}</td></tr>
                      <tr><td>所属应用</td><td>{serviceData.appId}</td></tr>
                      <tr><td>所属分类及标签</td><td>{categoryIdsTag} {serviceTagsTag}</td></tr>
                      <tr><td>Produces ContentType</td><td>{serviceData.produces}</td></tr>
                      <tr><td>Consumes ContentType</td><td>{serviceData.consumes}</td></tr>
                      <tr><td>参数传入方式</td><td style={{color:'red'}}>{serviceData.requestBodyFlag===true?'RequestBody字符串参数':'键值对参数'}</td></tr>
                      <tr><td>匿名访问</td><td>{serviceData.anonymousFlag===true?<Tag color='red'>是</Tag>:<Tag>否</Tag>}</td></tr>
                      <tr><td>调用权限</td><td>{permissionsTag}</td></tr>
                      <tr><td>发布范围</td><td>{effectiveUserTag}</td></tr>
                      <tr><td>事务支持</td><td>{serviceData.transaction==='N'?<Tag>否</Tag>:<Tag>是</Tag>}</td></tr>
                      <tr><td>熔断支持</td><td>{serviceData.hystrixCommand===true?<Tag>是</Tag>:<Tag>否</Tag>}</td></tr>
                      <tr><td>是否异步</td><td>{serviceData.syncAnnotation===true?<Tag>否</Tag>:<Tag>是</Tag>}</td></tr>
                      <tr><td>日记策略</td><td>{serviceData.logType==='0'?'不记录':'记录'}</td></tr>
                      <tr><td>状态</td><td>{serviceData.state}</td></tr>
                      <tr><td>过期</td><td>{serviceData.deprecated?<Tag>是</Tag>:<Tag>否</Tag>}</td></tr>
                      {serviceData.joinRestId!==undefined?
                        <tr><td>聚合API</td><td>{joinServiceTag}</td></tr>:''
                      }
                      {serviceData.regServiceUrl!==undefined?
                        <tr><td>后端API</td><td>{serviceData.regServiceUrl}</td></tr>:''
                      }
                      <tr><td>创建者</td><td>{serviceData.creator}</td></tr>
                      <tr><td>备注</td><td>{serviceData.remark}</td></tr>
                      </tbody></table>
                    </div>
                    <div style={{paddingBottom:'20px'}} className='apidoc' >
                      <h2>关注本API的用户</h2>
                      <Table dataSource={serviceData.followUserIds} size='small' pagination={false} columns={[{title: '用户id',dataIndex: 'userId'},{title: '关注时间',dataIndex: 'createTime'}]} />
                    </div>
          </TabPane>
          <TabPane tab="测试API" key="testapi" animated={false}>
            <NewTest id='' hiddenCloseButton={true} serviceId={this.serviceId} close={this.closeTestForm} />
          </TabPane>
          <TabPane tab="变更日记" key="ChangeLog" animated={false}>
                  <APIChangeLogTimeLine serviceId={serviceData.id}  />
          </TabPane>
          <TabPane tab="依赖关系" key="APM" animated={false}>
                  <ApmLogByApiCharts id={serviceData.id}  />
          </TabPane>
          <TabPane tab="OpenAPI" key="OpenApi" animated={false}>
                  <OpenApi serviceId={serviceData.id} beanId={serviceData.beanId} appId={serviceData.appId} />
          </TabPane>
      </Tabs>

      </Spin>
      </div>
    );
  }
}
/*
<TabPane tab="API评价" key="Comment" animated={false}>
        <APIIssueComment serviceId={serviceData.id} beanId={serviceData.beanId} appId={serviceData.appId} />
</TabPane>

*/
export default ShowApiDoc;
