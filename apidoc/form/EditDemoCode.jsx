import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import Editor from '../../designer/components/FormComponents/Editor';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_APIDOC.getAttachApiDocById;
const saveDataUrl=URI.CORE_APIDOC.saveAttachApiDoc;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.serviceId=this.props.serviceId;
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    let id=this.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      this.setState({mask:true});
      //载入表单数据
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
	          // this.refs.editor.setText(data.demoCode);
          }
      });
    }
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
          postData.urlConfigId=this.serviceId;
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.setState({mask:false});
                this.props.close(true);
              }
          });
      }
    });
  }

  editorChange=(content)=>{
    this.state.formData.demoCode=content;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 2 },wrapperCol: { span: 22 },};
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
        <FormItem  label="调用示例" help='客户调用的Ajax代码或Java代码' {...formItemLayout4_16}>

           {
            getFieldDecorator('demoCode')
            (<Input.TextArea autosize style={{minHeight:'450px'}} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 6, offset: 2 }}>
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

const EditDemoCode = Form.create()(form);

export default EditDemoCode;
