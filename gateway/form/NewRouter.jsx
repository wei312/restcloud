import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import ServiceControlPlugsSelect from '../../designer/components/FormComponents/ServiceControlPlugsSelect';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_ROUTER.save;
const loadDataUrl=URI.CORE_GATEWAY_ROUTER.getById;
const selectMockResponseUrl=URI.CORE_MOCK_RESPONSE.listAllSelect;
const listAllGrayUrl=URI.CORE_GATEWAY_GRAY.listAll;
const listAllBlanceUrl=URI.CORE_GATEWAY_BLAN.listAll;
const listAllServiceNames=URI.CORE_GATEWAY_MONITOR.selectServiceNames;
const listAllGatewayAppUrl=URI.CORE_GATEWAY_APPCONFIG.listAll;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId||'gateway';
    this.gatewayAppId=this.props.gatewayAppId;
    this.userId=AjaxUtils.getCookie("userId");
    if(this.gatewayAppId==='all'){this.gatewayAppId='';}
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.environment!=='' && data.environment!==undefined){
              data.environment=data.environment.split(",");
            }
            //设置服务控制策略
            if(data.scsPlugConfig!==undefined && data.scsPlugConfig!=="" && data.scsPlugConfig!==null){
              this.refs.ServiceControlSel.setSelectedRows(JSON.parse(data.scsPlugConfig));
            }
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
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
          postData.appId=this.appId;
          postData.scsPlugConfig=this.refs.ServiceControlSel.getSelectedRows();
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功!");
                this.props.close(true);
              }
          });
      }
    });
  }

  beanSelectChange=(value)=>{
    this.state.methodReLoadFlag=true;
    this.state.formData.beanId=value;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <Tabs size="large">
          <TabPane  tab="路由基本属性" key="props"  >
            <FormItem
              label="所属应用"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择本规则所属的应用(可在网关配置中进行应用创建)'
            >
              {
                getFieldDecorator('gatewayAppId',{rules: [{ required: true}],initialValue:this.gatewayAppId})
                (<AjaxSelect url={listAllGatewayAppUrl}  valueId='gatewayAppId' textId='gatewayAppName' options={{showSearch:true}} />)
              }
            </FormItem>
            <FormItem
              label="路由名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='任意描述字符串'
            >
              {
                getFieldDecorator('routerName',{rules: [{ required: true}]})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="URL匹配规则"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              hasFeedback
              help="*表示单层目录匹配,**表示多层目录匹配如:/demo/*,/**/demo/* 同时匹配多个路径请用逗号分隔"
            >
              {
                getFieldDecorator('routerUrl', {rules: [{ required: true}]})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="URL转发模式"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help={<span>全部追加表示请求的URI全部追加到后端服务的BaseUrl后面,否则仅追加**匹配的后继部分 <Tooltip title="
              假定BaseUrl为:http://后端ip/restcloud 匹配规则为:/**/demo/**,请求http://网关ip/api/demo/delete,
                全部追加后转发地址为:http://后端ip/restcloud/api/demo/delete,仅匹配部分时为:http://后端ip/restcloud/delete " >
                <a style={{cursor:'pointer'}}>示例</a>
              </Tooltip></span>}
            >{
              getFieldDecorator('addRuleUrlFlag',{initialValue:true})
              (            <RadioGroup>
                            <Radio value={true}>全部追加</Radio>
                            <Radio value={false}>仅最后的**匹配部分</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="追加固定前缀"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='转发到后端服务时在BaseUrl后面固定追加一个路径示例:/demo,转发路径=BaseUrl+/demo+(请求URL的全部或仅/**匹配部分)'
            >{
              getFieldDecorator('perfixPath')
              (            <Input />)
              }
            </FormItem>
            <FormItem
              label="后端服务路径"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择注册中心的实例名则从服务实例中计算BaseUrl(也可直接定义BaseUrl,如:http://localhost/demo 多个URL请用逗号分隔)'
            >{
              getFieldDecorator('serviceName',{rules: [{ required: true}]})
              (<AjaxSelect url={listAllServiceNames}  valueId='serviceName' textId='serviceName' options={{showSearch:true,mode:'combobox'}} />)
              }
            </FormItem>
            <FormItem
              label="超时时间(毫秒)"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='网关最后转发至后端HTTP服务时的超时设置(默认30秒)'
            >{
              getFieldDecorator('connectTimeout',{rules: [{ required: true}],initialValue:"30000"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="允许匿名访问"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='是表示API网关将不对服务进行鉴权'
            >{
              getFieldDecorator('anonymousFlag',{initialValue:false})
              (<RadioGroup>
                  <Radio value={false}>否</Radio>
                  <Radio value={true}>是</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="负载均衡策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="当服务实例有多个时选择负载均衡策略"
            >
              {getFieldDecorator('loadBalanceId',{initialValue:'WeightRandomServer'})
              (
                <AjaxSelect url={listAllBlanceUrl} defaultData={{"configName":"无",configId:""}} valueId='configId' textId='configName' options={{showSearch:true}} />
              )}
            </FormItem>
            <FormItem label="日记策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }} help='选择是否记录每次请求的日记信息(如果后端API有记录则网关层可以不记录)'
            >
              {getFieldDecorator('logType',{initialValue:0})
              (
                <Select>
                  <Option value={1}>记录请求URL和调用的后端URL</Option>
                  <Option value={2}>记录请求URL及输入输出数据(适用于错误追踪)</Option>
                  <Option value={0}>不记录(默认模式)</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              label="路由控制策略"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              <ServiceControlPlugsSelect ref='ServiceControlSel' />
              }
            </FormItem>
            <FormItem label="绑定模拟数据" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="服务调用失败或被熔断时返回模拟数据给调用者"
            >
              {getFieldDecorator('mockDataId')
              (
                <AjaxSelect url={selectMockResponseUrl} defaultData={{"text":"无",value:""}} options={{showSearch:true}} />
              )}
            </FormItem>
            <FormItem
              label="状态"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('state',{initialValue:"Y"})
              (            <RadioGroup>
                            <Radio value="Y">启用</Radio>
                            <Radio value="N">停用</Radio>
                            <Radio value="D">调试</Radio>
                          </RadioGroup>)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="Hystrix熔断配置" key="Hystrix"  >
              <FormItem
                label="启用Hystrix保护"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='是表示启用Hystrix进行服务保护或降级功能'
              >{
                getFieldDecorator('hystrixCommand',{initialValue:false})
                (<RadioGroup>
                    <Radio value={false}>否</Radio>
                    <Radio value={true}>是</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="配置Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='在多个路由规则中相同的Id会被隔离在同一个保护策略中(建议填写应用appId即按应用进行隔离)'
              >{
                getFieldDecorator('commandKey',{rules: [{ required: false}],initialValue:""})
                (<Input  />)
                }
              </FormItem>
              <FormItem
                label="Hystrix保护模式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('executionIsolationStrategy',{initialValue:false})
                (<RadioGroup>
                    <Radio value={false}>信号量隔离模式(推荐)</Radio>
                    <Radio value={true}>线程隔离模式</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="执行超时时间"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='执行超时时间(默认30秒)单位毫秒,建议与基本属性中的服务调用超时时间保持一至或取更小值'
              >{
                getFieldDecorator('executionTimeoutInMilliseconds',{rules: [{ required: true}],initialValue:"30000"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="线程池大小"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='线程隔离模式下的线程池大小(默认值10个)'
              >{
                getFieldDecorator('threadPoolCoreSize',{rules: [{ required: true}],initialValue:"10"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="信号量隔离最大并发"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='使用信号量隔离时的最大并发数(默认10)'
              >{
                getFieldDecorator('executionIsolationSemaphoreMaxConcurrentRequests',{rules: [{ required: true}],initialValue:"10"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="熔断器开启阀值"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='达到一定的请求量后熔断器才能开始工作(默认20个请求,测试时可设为1)'
              >{
                getFieldDecorator('circuitBreakerRequestVolumeThreshold',{rules: [{ required: true}],initialValue:"20"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="出错百分比阈值"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='默认:50,表示当出错率超过50%后熔断器启动'
              >{
                getFieldDecorator('circuitBreakerErrorThresholdPercentage',{rules: [{ required: true}],initialValue:"50"})
                (<InputNumber min={0} />)
                }
              </FormItem>
              <FormItem
                label="熔断器工作时间"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='熔断器中断60秒后会进入半打开状态,部分流量可通过重试(毫秒)'
              >{
                getFieldDecorator('circuitBreakerSleepWindowInMilliseconds',{rules: [{ required: true}],initialValue:"60000"})
                (<InputNumber min={0} />)
                }
              </FormItem>
          </TabPane>
          <TabPane  tab="更多配置" key="more"  >
            <FormItem
              label="流量镜像"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='选择需要进行流量复制的服务实例,可以直接定义URL如:http://localhost/demo 多个URL请用逗号分隔,可用于复制流量到测试环境'
            >{
              getFieldDecorator('mirroringServiceName',{rules: [{ required: false}]})
              (<AjaxSelect url={listAllServiceNames}  valueId='serviceName' textId='serviceName' options={{showSearch:true,mode:'combobox'}} />)
              }
            </FormItem>
            <FormItem
              label="重试次数"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='路由失败后是否进行重试(默认0表示不重试)'
            >{
              getFieldDecorator('retryNum',{rules: [{ required: false}],initialValue:"0"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="重试间隔"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='每次重试时的间隔时间0表示立即重试(单位:豪秒)'
            >{
              getFieldDecorator('retrySleep',{rules: [{ required: false}],initialValue:"0"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="追加固定后缀"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='请求API网关时url统一使用一个伪装的后缀名如.html,.php等,后缀不会转发给后端服务'
            >{
              getFieldDecorator('urlExtName')
              ( <Input />)
              }
            </FormItem>
            <FormItem
              label="过滤Header"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='*表示透传所有header到后端，指定值如content-type,user-agent表示可以传递到后端的header多个用逗号分隔,空表示不传'
            >{
              getFieldDecorator('transferHeader',{initialValue:"*"})
              (<Input  style={{maxHeight:'450px'}} />)
              }
            </FormItem>
            <FormItem
              label="追加Header"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='填写需要固定追加或覆盖到后端的Header可以使{$config.变量名}来引用网关中的变量{$header.}可获取原Header中的值JSON格式如：{token:"tokenvalue",ip:"120.0.0.1"}'
            >{
              getFieldDecorator('addTransferHeader',{initialValue:""})
              (<Input.TextArea  autosize />)
              }
            </FormItem>
            <FormItem label="灰度策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="根据灰度发布策略决定本路由规则是否匹配"
            >
              {getFieldDecorator('grayReleaseId')
              (
                <AjaxSelect url={listAllGrayUrl} defaultData={{"configName":"无",configId:""}} valueId='configId' textId='configName' options={{showSearch:true}} />
              )}
            </FormItem>
            <FormItem label="灰度策略参数" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
              help="自定义的灰度策略参数,在灰度策略的Bean中可以获取此在数来决定是否匹配本路由规则"
            >
              {getFieldDecorator('grayReleaseProps')
              (
                <Input ></Input>
              )}
            </FormItem>
            <FormItem
              label="支持静态资源"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="默认不支静态资源转发,选择是表示支持文件等资源转发适用于网站以及web业务系统"
            >{
              getFieldDecorator('supportFileUrl',{initialValue:false})
              (            <RadioGroup>
                            <Radio value={false}>不支持</Radio>
                            <Radio value={true}>支持</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="重定向"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="选择请求后端服务时后端服务要求重定向URL时的处理模式"
            >{
              getFieldDecorator('redirectType',{initialValue:1})
              (            <RadioGroup>
                            <Radio value={1}>由网关自动重定向</Radio>
                            <Radio value={0}>由浏览器重定向</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="排序"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='当同时有多个路由规则匹配时越小排序的优先路由'
            >{
              getFieldDecorator('sortNum',{rules: [{ required: true}],initialValue:"100"})
              (<InputNumber min={0} />)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('remark')
              (<Input.TextArea  autosize />)
              }
            </FormItem>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewRouter = Form.create()(form);

export default NewRouter;
