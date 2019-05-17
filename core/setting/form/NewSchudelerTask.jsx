import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,AutoComplete,InputNumber} from 'antd';
import AjaxSelect from '../../components/AjaxSelect';
import DyAjaxSelect from '../../components/DyAjaxSelect';
import AppSelect from '../../components/AppSelect';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const listBeansUrl=URI.CORE_SCHEDULER.listBeans;
const listMethodsUrl=URI.LIST_CORE_BEANS.listAllMethods;
const submitUrl=URI.CORE_SCHEDULER.save;
const loadDataUrl=URI.CORE_SCHEDULER.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      methodReLoadFlag:true,
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
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
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
              if(values[key]!==undefined && values[key]!==null){
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo("服务请求失败,请检查服务接口处于可用状态!");
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

  onMethodReLoad=(v)=>{
      this.state.methodReLoadFlag=false;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const beanId=this.state.formData.beanId;
    let ListBeanMethodsUrl="";
    if(beanId!==undefined && beanId!==null){
      ListBeanMethodsUrl=listMethodsUrl.replace("{beanid}",beanId);
    }

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
          help='应用唯一id'
        >
          {
            getFieldDecorator('appId', {
              rules: [{ required: true, message: 'Please input the appId!' }],
              initialValue:this.props.appId,
            },)
            (<AppSelect/>)
          }
        </FormItem>
        <FormItem
          label="任务说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义的且能描述本定时任务的名称"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input placeholder="任务名称" />)
          }
        </FormItem>

        <FormItem
          label="定时表达式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='格式请参见quartz开源组件的表达式,注意:使用{i}可以表示一个1-60的随机数,可以避免所有服务器在同一时间运行任务'
        >
          {
            getFieldDecorator('expression', {
              rules: [{ required: true, message: '请输入定时表达式' }]})
              (<Select mode='combobox' >
                <Option value='0/10 * * * * ?'>每隔秒数执行</Option>
                <Option value='0 0/3 * * * ?'>每隔分钟数执行</Option>
                <Option value='0 0 12 * * ?'>每天中午12点执行</Option>
                <Option value='0 15 23 * * ?'>每天晚上23点15分执行 </Option>
              </Select>)
          }
        </FormItem>
        <FormItem
          label="运行范围"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='集群时指定任务可运行的服务器,可以填写ServerId或IP来指定可运行的服务器多个用逗号分隔'
        >{
          getFieldDecorator('executeServer', {rules: [{ required: true}]})
          (<AutoComplete  >
              <Option value="AllServer">所有集群服务器均可同时运行</Option>
              <Option value="SingleServer">只有主服务器可运行(主服务器失败时其他服务器接管)</Option>
            </AutoComplete>)
          }
        </FormItem>
        <FormItem
          label="最大并发数"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='同一服务器下前继任务还没有结束后继任务是否能同时执行,0表示不限制,其他数字表示最大并发数'
        >{
          getFieldDecorator('maxRunNum',{rules: [{ required: true}],initialValue:"1"})
          (<InputNumber min={0} />)
          }
        </FormItem>
        <FormItem
          label="Scheduler BeanId"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="Scheduler BeanId是指在本系统容器中注册的类型为Scheduler的Java Bean"
        >
          {
            getFieldDecorator('beanId', {
              rules: [{ required: true }]
            })
            (<AjaxSelect url={listBeansUrl} style={{ width: '30%' }}  onChange={this.beanSelectChange} options={{showSearch:true}} />)
          }
        </FormItem>

        <FormItem
          label="执行方法"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="请指定本服务需要调用的Scheduler Bean的方法"
        >
          {
            getFieldDecorator('methodName', {
              rules: [{ required: true}]})
            (<DyAjaxSelect url={ListBeanMethodsUrl} reLoadFlag={this.state.methodReLoadFlag} onReLoad={this.onMethodReLoad} options={{showSearch:true,combobox:true,filterOption:false }} />)
          }
        </FormItem>
        <FormItem
          label="状态"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='停用后服务器再次启动时不会再安排调度'
        >{
          getFieldDecorator('state',{initialValue:'1'})
          (<RadioGroup>
              <Radio value='1'>启用</Radio>
              <Radio value='0'>停用</Radio>
            </RadioGroup>
          )}
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

const NewSchudelerTask = Form.create()(form);

export default NewSchudelerTask;
