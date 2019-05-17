import React from 'react';
import { Form, Input, Button, Spin,Select,Icon,Upload,message } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import Editor from '../../../designer/components/FormComponents/Editor';
import TreeNodeSelect from './TreeNodeSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.CORE_KNOWLEDGE_DOC.getById;
const saveDataUrl=URI.CORE_KNOWLEDGE_DOC.save;
const uploadUrl=URI.CORE_FILE.uploadResource+"?appId=knowledge";
const deleteUrl=URI.CORE_FILE.deleteFile;

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
      fileList:[],
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      this.setState({mask:true});
      //载入附件数据
      FormUtils.getFiles(id,(fileList)=>{
        if(fileList.length>0){
          this.setState({ fileList:fileList });
        }
      });
      //载入表单数据
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            this.setState({formData:data,mask:false});
              FormUtils.setFormFieldValues(this.props.form,data);
            this.refs.editor.setText(data.body);
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
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );
          postData.fileList=this.state.fileList.map((file) => {if(file.parentDocId==='0'){return file.uid;}}).join(",");//附件id要上传
          postData=Object.assign({},this.state.formData,postData);
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

  onFileChange=(info)=>{
          let fileList = info.fileList;
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            return;
          }
          fileList = fileList.map((file) => {
            if (file.response) {
              file.uid=file.response[0].id;
              file.url = URI.baseResUrl+file.response[0].filePath;
              file.parentDocId='0';
            }
            return file;
          });
          this.setState({ fileList });
  }

  onFileRemove=(file)=>{
    let fileId=file.uid;
    let postData={ids:fileId};
    if(!window.confirm("删除附件?")){
      return false;
    }else{
      AjaxUtils.post(deleteUrl,postData,(data)=>{
        message.success(`${file.name} deleted successfully`);
      });
    }
  };

  editorChange=(content)=>{
    this.state.formData.body=content;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 2 },wrapperCol: { span: 22 },};
    const formItemLayout4_12 = {labelCol: { span: 2 },wrapperCol: { span: 12 },};
    const uploadProps={
        name: 'file',
        action: uploadUrl,
        headers: {identitytoken:AjaxUtils.getCookie(URI.cookieId),},
        onRemove:this.onFileRemove,
        onChange:this.onFileChange,
        fileList:this.state.fileList,
    };

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form style={{marginRight:'20px'}}>
        <FormItem
          label="所属节点"
          {...formItemLayout4_16}
          hasFeedback
        >
          {
            getFieldDecorator('nodeId',
              {
                rules: [{ required: true, message: '请选择所属文件夹!' }],
                initialValue:this.props.nodeId,
              }
            )
            (<TreeNodeSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem  label="标题"  {...formItemLayout4_16} hasFeedback>
          {
            getFieldDecorator('title',{
             rules: [{ required: true,message:'请输入标题'}],
            })
            (<Input  style={{width:'100%'}}/>)
          }
        </FormItem>
        <FormItem  label="标签"  {...formItemLayout4_12} hasFeedback>
          {
            getFieldDecorator('tag',{
             rules: [{ required: true,message:'请输入标签'}],
             initialValue:'原创',
            })
            (<Select  mode='combobox' allowClear={true} >
              <Option value="经验">经验</Option>
              <Option value="问题">问题</Option>
              <Option value="原创">原创</Option>
              <Option value="转发">转发</Option>
              <Option value="其他">其他</Option>
            </Select>)
          }
        </FormItem>
       <FormItem  label="附件"  {...formItemLayout4_16}>
          <Upload {...uploadProps}>
            <Button>
              <Icon type="upload" /> 点击上传附件
            </Button>
          </Upload>
        </FormItem>
        <FormItem  label="内容"  {...formItemLayout4_16}>
           <Editor ref="editor" options={{style:{height:'300px',marginBottom:'50px'}}} onChange={this.editorChange} />
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

const NewDoc = Form.create()(form);

export default NewDoc;
