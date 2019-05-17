import React from 'react';
import { Form, Select, Input, Button,Spin,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const FormItem = Form.Item;
const Option = Select.Option;
const saveDataUrl=URI.CORE_WORKFLOWRULE.update;
const RadioGroup = Radio.Group;


class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.state={
      mask:false,
      formData:{}
    };
  }

  componentDidMount(){
  }


  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
            this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                 AjaxUtils.showInfo(data.msg);
                 this.props.close(true);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
          hasFeedback
        >
        {this.appId}
        </FormItem>
        <FormItem
          label="规则名称"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="任何能描述本规则的文字"
        >
          {getFieldDecorator('ruleName',{rules: [{ required: true}]})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="规则编号"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='本规则的唯一编号R_appId_P..组成'
        >
          {
            getFieldDecorator('ruleNum', {
              rules: [{ required: true,}],initialValue:'R_'+this.appId+"_P"})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="运行方式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('compileFlag',{initialValue:'0'})
          (<RadioGroup>
              <Radio value='1'>编译后运行</Radio>
              <Radio value='0'>实时运行</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            保存
          </Button>
          {' '}
          <Button  onClick={this.props.close.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewProcessRule = Form.create()(form);

export default NewProcessRule;
