import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button,Spin,Card,Modal} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
import SelectTemplateCode from './SelectTemplateCode';
import ListCommitHistorySelect from './ListCommitHistorySelect';

const ButtonGroup = Button.Group;
const getTemplateCode=URI.CORE_CODEREPOSITORY.getTemplateCode;
const getCommitHistoryCode=URI.CORE_CODEHISTORY.getById;
const saveDataUrl=URI.CORE_CODEREPOSITORY.save;
const confirm = Modal.confirm;
const getByBeanIdUrl=URI.LIST_CORE_BEANS.getByBeanId;
const compileCheckUrl=URI.CORE_CODEREPOSITORY.compileCheck;
const readCodeUrl=URI.CORE_CODEREPOSITORY.readCodeClassPath;
const overCodeUrl=URI.CORE_CODEREPOSITORY.overCodeClassPath;

class EditJavaCode extends React.Component{
  constructor(props){
    super(props);
    this.saveEditCode=this.props.saveEditCode; //代码保存方法
    this.record=this.props.record; //本代码所在记录对像,会通过saveEditCode传回给父级组件
    this.code=this.props.code; //显示代码
    this.beanId=this.props.beanId||""; //要进行变量替换的beanId,如果没有可以不用传入
    this.codeType=this.props.codeType||"java"; //代码类型
    this.templateType=this.props.templateType; //模板类型
    this.codeUrl="/res/ace/eventcode.html?codeType="+this.codeType;
    this.state={
      mask:false,
      visible:false,
      action:'showSelectTemplateCode',
    };
  }

  componentDidMount(){
  }

  saveCode=()=>{
    let mframe =this.refs.myframe;
    let code=mframe.contentWindow.getCode();
    let classPath=this.getClassPath(code);
    this.saveEditCode(classPath,code,this.record,true);
  }

  showError=(msg)=>{
    Modal.error({
      title: '编译错误',
      content: (<div dangerouslySetInnerHTML={{__html:msg}} ></div>),
      width:600,
    });
  }

  saveCompile=()=>{
    let mframe =this.refs.myframe;
    let code=mframe.contentWindow.getCode();
    let classPath=this.getClassPath(code);
    this.setState({mask:true});
    AjaxUtils.post(compileCheckUrl,{classPath:classPath,code:code},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          let msg=decodeURIComponent(data.msg);
          this.showError(msg);
        }else{
          AjaxUtils.showInfo("编译成功!");
          this.saveEditCode(classPath,code,this.record,false);
        }
    });
  }

  setCode=()=>{
    if(this.code===undefined){return;}
    let mframe =this.refs.myframe;
    mframe.contentWindow.setCode(this.code);
    mframe.contentWindow.saveEventCode=this.saveCode;
  }

  setCodeValue=(value)=>{
    if(this.code===undefined){return;}
    let mframe =this.refs.myframe;
    mframe.contentWindow.setCode(value);
  }

  showInfo=(msg)=>{
    Modal.info({
      title: '提示消息',
      content: (msg),
      width:600,
    });
  }

  showError=(msg)=>{
    Modal.error({
      title: '编译错误',
      content: (<div dangerouslySetInnerHTML={{__html:msg}} ></div>),
      width:600,
    });
  }

  //选择ok后执行模板代码获取，并设置到编辑器中去
  closeModal=(templateId)=>{
      this.setState({visible: false});
      if(templateId===undefined || templateId===''){return;}
      let url=getTemplateCode+"?beanId="+this.beanId+"&templateId="+templateId;
      // console.log("url="+url);
      this.setState({mask:false});
      AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          let mframe =this.refs.myframe;
          mframe.contentWindow.setCode(data.code);
        }
      });
  }

  //选择提交代码的历史记录后的ok后从提交记录中获取代码
  closeCommitHistoryCodeModal=(id)=>{
      this.setState({visible: false});
      if(id===undefined || id===''){return;}
      let url=getCommitHistoryCode+"?id="+id;
      this.setState({mask:false});
      AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          let mframe =this.refs.myframe;
          mframe.contentWindow.setCode(data.commitCode);
        }
      });
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //选择模板代码
  showSelectTemplateCode=()=>{
    this.setState({visible: true,action:'showSelectTemplateCode'});
  }

  showCommitHistory=()=>{
    this.setState({visible: true,action:'showCommitHistory'});
  }

  showConfirm=()=>{
      let self=this;
      confirm({
      title: '警告',
      content: '注意:覆盖Java源文件后不可恢复!',
      onOk(){
        self.overFileCode();
      },
      onCancel() {},
      });
  }

  getClassPath=(code)=>{
    //先获得包名
    let startStr="package ";
    let endpos=code.indexOf(";");
    let spos=code.indexOf(startStr);
    let packageName=code.substring(spos+startStr.length,endpos).trim();

    startStr="public class ";
    endpos=code.indexOf(" implements");
    spos=code.indexOf(startStr);
    let className=code.substring(spos+startStr.length,endpos).trim();
    let classPath=packageName+"."+className;
    return classPath;
  }

  overFileCode=()=>{
    let mframe =this.refs.myframe;
    let code=mframe.contentWindow.getCode();
    let classPath=this.getClassPath(code);
    this.setState({mask:false});
    AjaxUtils.post(overCodeUrl,{code:code,classPath:classPath},(data)=>{
      this.setState({mask:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showConfirm("覆盖成功",data.msg);
      }
    });
  }

  readFileCode=()=>{
    let mframe =this.refs.myframe;
    let code=mframe.contentWindow.getCode();
    let classPath=this.getClassPath(code);
    this.setState({mask:false});
    let url=readCodeUrl+"?classPath="+classPath;
    AjaxUtils.get(url,(data)=>{
      this.setState({mask:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        mframe.contentWindow.setCode("");
        mframe.contentWindow.insertCode(data.code);
        AjaxUtils.showInfo("读取成功!");
      }
    });
  }

  render() {
    let modalForm;
    let modalTitle="";
    if(this.state.action==='showCommitHistory'){
      modalTitle="提交历史记录";
      modalForm=<ListCommitHistorySelect  configId={this.record.id} close={this.closeCommitHistoryCodeModal} />;
    }else{
      modalTitle="从模板选择代码";
      modalForm=<SelectTemplateCode templateType={this.templateType}  close={this.closeModal} />;
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <Modal key={Math.random()} title={modalTitle} maskClosable={false}
          visible={this.state.visible}
          width='850px'
          footer=''
          style={{top:'20px'}}
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
            {modalForm}
          </Modal>
          <div style={{margin:'0 0 5px 0',padding:'5px',border:'solid 1px #ccc',borderRadius:'5px'}}>
            <ButtonGroup>
              <Button type="primary" icon='save' onClick={this.saveCode}>保存(Ctr+S)</Button>
              <Button icon='check-circle-o' onClick={this.saveCompile}>编译</Button>
              <Button icon='sync' onClick={this.readFileCode}>读取Java文件源码</Button>
              <Button icon='exception' onClick={this.showConfirm}>覆盖Java文件源码</Button>
              <Button icon='exception' onClick={this.showSelectTemplateCode}>从模板选择代码</Button>
              <Button icon='profile' onClick={this.showCommitHistory}>历史版本</Button>
            </ButtonGroup>
          </div>
          <div style={{border:'1px #cccccc solid',margin:'0px',borderRadius:'2px'}}>
            <iframe ref='myframe' onLoad={this.setCode} src={this.codeUrl} style={{minHeight:'600px',width:'100%',border:'none'}}/>
          </div>
      </Spin>
    );
  }
}

export default EditJavaCode;
