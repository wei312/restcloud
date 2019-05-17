import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Popover,Icon,AutoComplete,Steps} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import DyAjaxSelect from '../../core/components/DyAjaxSelect';
import TagsSelect from '../../designer/components/FormComponents/TagsSelect';
import AppSelect from '../../core/components/AppSelect';
import RolesSelect from '../../designer/components/FormComponents/RolesSelect';
import ServiceControlPlugsSelect from '../../designer/components/FormComponents/ServiceControlPlugsSelect';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';
import EditAPIMapParams from './EditAPIMapParams';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const listBeansUrl=URI.NEW_SERVICE.listBeans;
const listMethodsUrl=URI.NEW_SERVICE.listMethods;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.load;
const selectDataModels=URI.CORE_DATAMODELS.selectDataModels.replace('{modelType}','all');
const selectMockResponseUrl=URI.CORE_MOCK_RESPONSE.listAllSelect;
const ListAppServiceCategroyUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;
const listAllGatewayAppUrl=URI.CORE_GATEWAY_APPCONFIG.listAll;
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const Step = Steps.Step;

const steps = [{
  title: 'API发布配置',
}, {
  title: '后端API配置',
}, {
  title: '参数映射配置',
}];

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.appId=this.props.appId;
    this.listBeansUrlByAppId=listBeansUrl+"&appId="+this.appId;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.appId+".ServiceCategory&rootName=服务分类";
    this.categoryId=this.props.categoryId;
    if(this.categoryId==='all'){this.categoryId=[];}
    this.state={
      methodReLoadFlag:true,
      mask:true,
      formData:{},
      mockDisplay:'none',
      apiType:'rest',
      current: 0,
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.id;
    if(id===undefined || id===''){
        FormUtils.getSerialNumber(this.props.form,"configId",this.appId,"API");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            if(data.effectiveUser!==undefined && data.effectiveUser!==''  && data.effectiveUser!==null ){
              data.effectiveUser=data.effectiveUser.split(",");
            }else{
              data.effectiveUser=[];
            }
            if(data.tags!==undefined && data.tags!==''&& data.tags!==null){
              data.tags=data.tags.split(",").filter(v=>v!==''); //去掉空数组
            }else{
              data.tags=[];
            }

            //把regServiceUrl中的值重新分出字段值
            this.setRegServiceUrlJson(data);

            // data.regServiceUrl=AjaxUtils.formatJson(data.regServiceUrl);
            this.setState({formData:data,mask:false});

            //去除数据中不存在的表单控件中的数据
            FormUtils.setFormFieldValues(this.props.form,data);

            if(data.state==='4'){this.setState({mockDisplay:''});}
            if(data.scsPlugConfig!==undefined && data.scsPlugConfig!==""  && data.scsPlugConfig!==null){
              this.refs.ServiceControlSel.setSelectedRows(JSON.parse(data.scsPlugConfig)); //设置服务控制策略
            }
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
    let paramsData=this.refs.APIParams.getParamsJsonData();
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.configType='REG'; //标记注册的服务地址
          postData.beanId="ServiceRegisterRest";
          postData.beanMethodName="redirectUrl"; //执行的方法名
          postData.appId=this.appId;
          postData.scsPlugConfig=this.refs.ServiceControlSel.getSelectedRows();
          postData.regServiceUrl=this.getRegServiceUrlJson(); //根据配置值计算注册服务的url json对像
          if(postData.regServiceUrl===false){return;} //检测没有通过
          postData.apiParams=JSON.stringify(paramsData); //要提交的json参数
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag===true){
                  this.props.closeTab();
                }
              }
          });
      }else{
        AjaxUtils.showError("请填写完整后再提交!");
      }
    });
  }

  //获得注册服务的json格式
  getRegServiceUrlJson=()=>{
    let jsonObj={};
    let form=this.props.form;
    jsonObj.method=form.getFieldValue("regSelectMethod");
    jsonObj.url=form.getFieldValue("regUrl");
    let addTransferHeader=form.getFieldValue("addTransferHeader") || "{}";
    jsonObj.headers=JSON.parse(addTransferHeader); //追加或覆盖掉的头json格式
    jsonObj.filterHeaders=form.getFieldValue("filterTransferHeader"); //要过虑掉的头*号表示透传
    jsonObj.timeout=form.getFieldValue("regConnectTimeout");
    jsonObj.requestBody=form.getFieldValue("regRequestBodyFlag");
    jsonObj.userId=form.getFieldValue("regUserId");
    jsonObj.password=form.getFieldValue("regPassword");
    jsonObj.type=form.getFieldValue("regApiType");
    jsonObj.wsdlOperation=form.getFieldValue("regWsdlOperation");
    if(jsonObj.type==='webservice' && jsonObj.wsdlOperation===''){
      AjaxUtils.showError("请指定WebServce服务的操作方法名!");
      return false;
    }
    return JSON.stringify(jsonObj);
  }

  //获得注册服务的json格式
  setRegServiceUrlJson=(data)=>{
    let jsonStr=data.regServiceUrl;
    // console.log(jsonStr);
    let jsonObj=JSON.parse(jsonStr);
    data.regSelectMethod=jsonObj.method;
    data.regUrl=jsonObj.url;
    data.addTransferHeader=JSON.stringify(jsonObj.headers); //要追加的头
    if(data.beanMethodName==='allParameterTransmission'){
        data.filterHeaders="*"; //透传
    }else if(data.beanMethodName==='queryParameterTransmission'){
        data.filterHeaders=""; //不传
    }else{
      data.filterHeaders=jsonObj.filterHeaders; //要过滤的头
    }
    data.regConnectTimeout=jsonObj.timeout;
    data.regRequestBodyFlag=jsonObj.requestBody;
    data.regUserId=jsonObj.userId;
    data.regPassword=jsonObj.password;
    data.regApiType=jsonObj.type;
    data.regWsdlOperation=jsonObj.wsdlOperation;
    this.setState({apiType:jsonObj.type});
  }

  beanSelectChange=(value)=>{
    this.state.methodReLoadFlag=true;
    this.state.formData.beanId=value;
  }

  onServiceStateChange=(e)=>{
    let v=e.target.value;
    if(v==='4'){
      this.setState({mockDisplay:''});
    }else{
      this.setState({mockDisplay:'none'});
    }
  }

  onMethodReLoad=(v)=>{
      this.state.methodReLoadFlag=false;
  }

  changeApiType=(e)=>{
    let apiType=e.target.value;
    this.setState({apiType:apiType});
  }

  next() {
     const current = this.state.current + 1;
     this.setState({ current });
   }

   prev() {
     const current = this.state.current - 1;
     this.setState({ current });
   }

  render() {
    const { current } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const beanId=this.state.formData.beanId;
    let ListBeanMethodsUrl="";
    if(beanId!==undefined){
      ListBeanMethodsUrl=listMethodsUrl.replace("{beanid}",beanId);
    }

    const selectMethod = (
        getFieldDecorator('methodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="*">*全部</Option>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
      );

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
              <div style={{margin:'30px'}} >
                <Steps current={current}  >
                  {steps.map(item => <Step key={item.title} title={item.title} />)}
                </Steps>
              </div>
              <div  style={{display:current===0?'':'none'}}  >
              <FormItem
                label="所属网关应用"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='选择本API所属的网关应用(可以在网关配置中建立应用)'
              >
                {
                  getFieldDecorator('gatewayAppId',{rules: [{ required: true}]})
                  (<AjaxSelect url={listAllGatewayAppUrl}  valueId='gatewayAppId' textId='gatewayAppName' options={{showSearch:true}} />)
                }
              </FormItem>
              <FormItem
                label="服务说明"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义的且能描述本服务的名称"
              >
                {
                  getFieldDecorator('configName', {
                    rules: [{ required: true, message: 'Please input the configName!' }]
                  })
                  (<Input placeholder="配置名称" />)
                }
              </FormItem>
              <FormItem
                label="服务发布URL"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='尽量符合Restful风格,{变量}为Path参数,/rest/目录为必须'
              >
                {
                  getFieldDecorator('mapUrl', {
                    rules: [{ required: true, message: 'Please input the service url!' }],
                    initialValue:'/rest/'+this.props.appId+'/',
                  })
                  (<Input addonBefore={selectMethod} style={{width:'100%'}} />)
                }
              </FormItem>
              <FormItem
                label="服务Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="建议配置唯一Id作为前端Ajax调用的常量"
              >
                {
                  getFieldDecorator('configId')
                  (<Input placeholder="API唯一Id" />)
                }
              </FormItem>
              <FormItem
                label="API版本"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="注册API的版本,在header中传入version可以调用指定版本API"
              >
                {
                  getFieldDecorator('version',{initialValue:'1.0'})
                  (<Input placeholder="API版本" />)
                }
              </FormItem>
              <FormItem label="参数请求类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='调用本服务时参数传入的可选类型'
              >
                {getFieldDecorator('requestBodyFlag',{initialValue:false})
                (
                  <RadioGroup>
                    <Radio value={false}>键值对参数</Radio>
                    <Radio value={true}>RequestBody字符串参数</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="Produces ContentType"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定服务返回的数据类型"
              >{
                getFieldDecorator('produces',{initialValue:'application/json;charset=utf-8'})
                (<AutoComplete  mode='combobox' >
                    <Option value="*">透传注册服务的ContentType</Option>
                    <Option value="application/x-www-form-urlencoded; charset=utf-8">application/x-www-form-urlencoded; charset=utf-8</Option>
                    <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
                    <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
                    <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
                    <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
                    <Option value="application/x-msdownload;charset=utf-8">application/x-msdownload;charset=utf-8</Option>
                  </AutoComplete>
                )}
              </FormItem>
              <FormItem
                label="Consumes ContentType"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定传入参数的数据类型,如果有文件上传时请选择multipart/form-data"
              >{
                getFieldDecorator('consumes',{initialValue:'*'})
                (<AutoComplete   >
                    <Option value="">不限定</Option>
                    <Option value="application/x-www-form-urlencoded; charset=utf-8">application/x-www-form-urlencoded; charset=utf-8</Option>
                    <Option value="multipart/form-data">multipart/form-data</Option>
                    <Option value="application/octet-stream">application/octet-stream</Option>
                    <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
                    <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
                    <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
                    <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
                  </AutoComplete >
                )}
              </FormItem>
              <FormItem label="日记策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='只有数据转发策略才能记录请求和响应数据,地址查询服务只记录本服务的调用次数'
              >
                {getFieldDecorator('logType',{initialValue:1})
                (
                  <Select>
                    <Option value={1} >调用次数及请求地址记录(默认模式)</Option>
                    <Option value={2} >记录全部输入输出数据(适用于错误追踪)</Option>
                    <Option value={0} >不记录(并发量大的服务稳定后可不监控)</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem
                label="匿名调用"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='允许未登录的用户调用本API(允许后其他权限将失效)'
              >{getFieldDecorator('anonymousFlag',{initialValue:false})
                (
                  <RadioGroup>
                    <Radio value={false}>否</Radio>
                    <Radio value={true}>是</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 8 }} >
                {getFieldDecorator('state', {initialValue:'1'})
                (
                  <RadioGroup onChange={this.onServiceStateChange}>
                    <Radio value='1'>启用</Radio>
                    <Radio value='2'>调试</Radio>
                    <Radio value='3'>停止</Radio>
                    <Radio value='4'>模拟</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="绑定模拟配置"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='API处于模拟状态或者执行异常时输出本模拟数据给调用端'
              >{
                getFieldDecorator('mockResponseConfigId')
                (<AjaxSelect url={selectMockResponseUrl} style={{ width: '30%' }}  options={{showSearch:true}} />)
              }
              </FormItem>
              <FormItem label="同步调用模式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='设置本API是否为同步调用模式(默认为同步模式),异步模式时调用本服务的所有请求将会自动加入队列中'
              >
                {getFieldDecorator('syncFlag',{initialValue:true})
                (
                  <RadioGroup>
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </RadioGroup>
                )}
              </FormItem>
               <FormItem
                label="服务控制策略"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                <ServiceControlPlugsSelect ref='ServiceControlSel' />
                }
              </FormItem>
              <FormItem
                label="标签"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='通过标签可以让不同应用的服务聚合到相同的标签或功能点上'
              >
                {
                  getFieldDecorator('tags')
                  (<TagsSelect appId={this.appId}  />)
                }
              </FormItem>
              <FormItem
                label="发布范围"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('effectiveUser')
                (<RolesSelect options={{showSearch:true,mode:'multiple'}} />)
              }
              </FormItem>
              <FormItem
                label="备注"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('remark')
                (<Input.TextArea autosize />)
                }
              </FormItem>
          </div>
              <div  style={{display:current===1?'':'none'}}   >
                <FormItem label="API类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  help='指定要注册API的类型'
                >
                  {getFieldDecorator('regApiType',{initialValue:'rest'})
                  (
                    <RadioGroup  >
                      <Radio value='rest' onClick={this.changeApiType} >Rest API</Radio>
                      <Radio value='webservice' onClick={this.changeApiType} >WebService</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem
                  label="后端API Method"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  style={{display:this.state.apiType==='rest'?'':'none'}}
                  help='建议与基本配置中发布的方法保持一致'
                >
                {
                  getFieldDecorator('regSelectMethod', {
                    rules: [{ required: true}],
                    initialValue:'GET',
                  })
                  (<Select style={{width:120}} >
                        <Option value="GET">GET</Option>
                        <Option value="POST">POST</Option>
                        <Option value="PUT">PUT</Option>
                        <Option value="DELETE">DELETE</Option>
                      </Select>)
                }
                </FormItem>
                <FormItem
                  label="后端API URL"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='请指定要注册的API URL或WSDL如:http://192.168.1.2/testapi 支持服务实例名http://service/rest/api多个时用逗号分隔,可用${变量}获取传入参数作为URL的组成部分'
                >
                  {
                    getFieldDecorator('regUrl', {
                      rules: [{ required: true}],
                      initialValue:'http://',
                    })
                    (<Input  />)
                  }
                </FormItem>
                <FormItem
                  label="操作方法名"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  style={{display:this.state.apiType==='rest'?'none':''}}
                  help='请指定Webservice服务中需要调用的方法名称,也可使用{变量}获取路径参数中的变量作为方法名'
                >
                  {
                    getFieldDecorator('regWsdlOperation', {
                      rules: [{ required: false}],
                      initialValue:'',
                    })
                    (<Input  />)
                  }
                </FormItem>
                <FormItem label="负载均衡策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  help="当后端API有多个时选择负载均衡策略"
                >
                  {getFieldDecorator('loadBalanceId',{initialValue:'WeightRandomServer'})
                  (
                    <AjaxSelect url={listAllBlanceUrl} defaultData={{"configName":"无",configId:""}} valueId='configId' textId='configName' options={{showSearch:true}} />
                  )}
                </FormItem>
                <FormItem
                  label="过滤Header"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='*表示透传所有header到后端，指定值如content-type,user-agent表示可以传递到后端的header多个用逗号分隔,空表示不传'
                >{
                  getFieldDecorator('filterTransferHeader',{initialValue:"*"})
                  (<Input  style={{maxHeight:'450px'}} />)
                  }
                </FormItem>
                <FormItem
                  label="追加Header"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='填写需要固定追加或覆盖到后端的Header可以使{$config.变量名}来引用网关中的变量{$header.}可获取原Header中的值JSON格式如：{token:"tokenvalue",ip:"120.0.0.1"}'
                >{
                  getFieldDecorator('addTransferHeader',{initialValue:'{"content-type":"application/json;charset=utf-8"}'})
                  (<Input.TextArea autosize />)
                }
                </FormItem>
                <FormItem
                  label="请求超时时间"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='执行超时时间(默认30秒)单位毫秒'
                >{
                  getFieldDecorator('regConnectTimeout',{rules: [{ required: true}],initialValue:"30000"})
                  (<InputNumber min={0} />)
                  }
                </FormItem>
                <FormItem
                  label="重试次数"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='调用后端服务失败后是否进行重试(默认0表示不重试)'
                >{
                  getFieldDecorator('retryNum',{rules: [{ required: true}],initialValue:"0"})
                  (<InputNumber min={0} />)
                  }
                </FormItem>
                <FormItem
                  label="重试间隔"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='每次重试时的间隔时间0表示立即重试(单位:豪秒)'
                >{
                  getFieldDecorator('retrySleep',{rules: [{ required: true}],initialValue:"0"})
                  (<InputNumber min={0} />)
                  }
                </FormItem>
                <FormItem label="参数传递类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                  help='调用后端API时参数传入的类型,如果要进行参数映射则保存后在API的参数配置中进行参数映射配置'
                >
                  {getFieldDecorator('regRequestBodyFlag',{initialValue:'1'})
                  (
                    <RadioGroup>
                      <Radio value='1'>透传(与发布的API保持一致)</Radio>
                      <Radio value='2'>后端为键值对参数</Radio>
                      <Radio value='3'>后端为RequestBody字符串参数</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </div>
              <div   style={{marginTop:'20px',marginBottom:'20px',display:current===2?'':'none'}}   >
                <EditAPIMapParams ref="APIParams" id={this.id} appId={this.appId} ></EditAPIMapParams>
              </div>

        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          {
            current < steps.length - 1
            && <Button type="primary" onClick={() => this.next()}>下一步</Button>
          }
          {
            current > 0
            && (
            <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
              上一步
            </Button>
            )
          }
          {
            current === steps.length - 1
            &&   <Button type="primary" style={{ marginLeft: 8 }} onClick={this.onSubmit.bind(this,true)}  >  保存并关闭</Button>
          }
          <Button onClick={this.onSubmit} style={{ marginLeft: 8 }}  >保存</Button>
        </FormItem>

      </Form>

      </Spin>
    );
  }
}

const RegService = Form.create()(form);

export default RegService;
