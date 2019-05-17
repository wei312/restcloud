import React from 'react';
import {Spin,Card,Tag,Badge,Button,Radio} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ListServicesByTagName from './ListServicesByTagName';

const loadDataUrl=URI.CORE_TAGS.ListAllTags;
const CheckableTag = Tag.CheckableTag;

class ListAllTagsByAppId extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId||"*";
    this.state={
      mask:false,
      formData:[],
      currentTagName:'',
      buttonId:'ByAppId',
    };
  }

  componentDidMount(){
    this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
      if(this.appId!==nextProps.appId){
        this.appId=nextProps.appId;
        this.loadData();
      }
  }

  loadData=()=>{
      this.setState({mask:true});
      let appId=this.appId;
      if(appId==='' || appId===undefined){appId="*";}
      let url=loadDataUrl+"?appId="+appId;
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data});
          }
      });
  }

  onTagChange=(tagName)=>{
    this.setState({currentTagName:tagName});
  }

  showTags=()=>{
   this.setState({currentTagName:''});
  }

  handleRadioChange=(e)=>{
    this.showTags();
    let buttonId=e.target.value;
    this.setState({buttonId:buttonId}); //按扭状态记录
    if(buttonId==='reload'){
      this.loadData();
    }
  }

  render() {

    let data=[];
    //合并所有应用的标签为一个标签总数
    if(this.state.buttonId==='MergeAppTags'){
      data=[{appName:"所有标签",appId:'allTags',tags:[]}];
      let tagsArray=[];
      this.state.formData.forEach((item)=>{
        item.tags.forEach((item)=>{
          tagsArray.push(item);
        });
      });

    //合并标签名相同的数字
    let arrayAll={};
    tagsArray.forEach((item)=>{
        let tagName=item.tagName;
        if(arrayAll[tagName]===undefined){
          arrayAll[tagName]=item.serviceNum;
        }else{
          arrayAll[tagName]=arrayAll[tagName]+item.serviceNum;
        }
      });

      //重新组成一个合并了标签的数组tags
      let newTagsArray=[];
      Object.keys(arrayAll).forEach((key)=>{
        let itemTag={tagName:key,serviceNum:arrayAll[key]};
        newTagsArray.push(itemTag);
      });
      // console.log(arrayAll);
      data[0].tags=newTagsArray;
    }else{
      //按应用分开显示
      data=this.state.formData;
    }

    //所有标签列表
    let cards=data.map((item,index)=>{
      //先组装card里面的标签
      let tagItems=item.tags.map( (tagItem,index)=>{
          return (
            <span style={{ marginRight:'0px'}} key={"tag_"+index}>
            <Badge count={0}  key={tagItem.tagName} >
            <Card
            onClick={this.onTagChange.bind(this,tagItem.tagName)}
            style={{background:'#f8f8f8',marginRight:'10px',marginTop:'10px',padding:'0px',cursor:'pointer',width:'160px',height:'76px'}}
            >
            <b>{tagItem.tagName}</b><Badge count={tagItem.serviceNum} overflowCount={999} style={{ backgroundColor: '#52c41a' }}  key={tagItem.tagName} />
            </Card>
            </Badge>
            </span>
          );
      });
      //每个应用返回一个 card进行显示
      return (
        <Card title={item.appName} style={{marginTop:'20px'}} key={index}>
          {tagItems}
        </Card>
        );
    });



    if(this.state.formData.length===0){
        cards=<Card style={{marginTop:'20px'}} >本应用未定义标签...</Card>;
    }

    //根据点击的标签显示服务列表
    let content;
    if(this.state.currentTagName!==''){
      let title="标签:"+this.state.currentTagName;
      content=(<Card title={title}  style={{marginTop:'20px'}} >
        <Button  type="ghost" onClick={this.showTags} icon="backward" style={{marginBottom:'10px'}}>返回</Button>
        <ListServicesByTagName appId={this.appId} tagName={this.state.currentTagName}  />
        </Card>);
    }else{
      content=cards;
    }

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Radio.Group  value={this.state.buttonId} onChange={this.handleRadioChange} >
          <Radio.Button  value="reload" icon="reload" >刷新</Radio.Button>
          <Radio.Button  value="ByAppId">按应用显示标签</Radio.Button>
          <Radio.Button  value="MergeAppTags">合并应用标签</Radio.Button>
      </Radio.Group>
      {content}
      </Spin>
    );
  }
}


export default ListAllTagsByAppId;
