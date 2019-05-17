import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import TreeNodeSelect from './TreeNodeSelect';
// import TreeNodeSelect from '../../components/FormComponents/DeptTreeSelect';

const FormItem = Form.Item;
const loadDataUrl=URI.CORE_KNOWLEDGE_TREE.getById;
const saveDataUrl=URI.CORE_KNOWLEDGE_TREE.save;
const validateUrl=URI.CORE_KNOWLEDGE_TREE.validate;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
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
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.props.form.resetFields();
                this.setState({mask:false});
                this.props.closeModal(true);
              }
          });
      }
    });
  }

  //检测AppId是否有重复值
  checkExist=(rule, value, callback)=>{
    let id=this.state.formData.id||"";
    AjaxUtils.checkExist(rule,value,id,validateUrl,callback);
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form  >
        <FormItem
          label="上级节点"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('parentNodeId',
              {
                rules: [{ required: true, message: '请选择上级节点!' }],
                initialValue:this.props.parentNodeId,
              }
            )
            (<TreeNodeSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="节点名称"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('treeNodeName', {
              rules: [{ required: true, message: '请输入节点名称!' }]
            })
            (<Input placeholder="节点名称" />)
          }
        </FormItem>
        <FormItem
          label="节点ID"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('nodeId',{
              rules: [{validator:this.checkExist}],
              validateTrigger:['onBlur'], //这里是数组
            })
            (<Input placeholder="节点唯一ID保存后不可修改" disabled={this.props.id!==''} />)
          }
        </FormItem>
        <FormItem
          label="同级排序"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('sort', {
              rules: [{ required: true}],
              initialValue:'1',
            })
            (<InputNumber min={1} />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.closeModal.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>

      </Spin>
    );
  }
}

const NewTreeNode = Form.create()(form);

export default NewTreeNode;
