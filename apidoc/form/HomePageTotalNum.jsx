import React from 'react';
import { Icon,Badge,Card,Row,Col} from 'antd';
import { browserHistory } from 'react-router'
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import '../css/serviceList.less';

const URL=URI.CORE_APIDOC.getApiTotalNum;

const textDivStyle={textAlign:'center',position:'relative',top:'15%',lineHeight:'36px'};
const textStyle={fontSize:'14px',color:'#222',fontFamily:'微软雅黑'};
const numStyle={fontSize:'32px',color:'#222',fontFamily:'微软雅黑'};

//home page
class HomePageTotalNum extends React.Component {
  constructor(props) {
    super(props);
    this.onMenuSelected=this.props.onMenuSelected;
    this.state={
        mask:true,
        visible:false,
        data:{},
      }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    AjaxUtils.get(URL,(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  render(){
    return (
        <div style={{ margin: '0 16px 16px 16px', padding: 24, background: '#fff' }}>
               <Row gutter={25} >
                 <Col span={5}>
                     <div className="apiTotalDiv" onClick={this.onMenuSelected.bind(this,'ListApisByDate')}  >
                       <div style={textDivStyle}>
                             <span style={numStyle}>{this.state.data.todayNum}</span>
                             <div style={textStyle}>今日发布</div>
                         </div>
                     </div>
                 </Col>
                 <Col span={5}>
                     <div className="apiTotalDiv" onClick={this.onMenuSelected.bind(this,'ListMyFollowApis')} >
                       <div style={textDivStyle}>
                             <span style={numStyle}>{this.state.data.followNum}</span>
                             <div style={textStyle}>我关注的</div>
                         </div>
                     </div>
                 </Col>
                 <Col span={5}>
                     <div className="apiTotalDiv"  onClick={this.onMenuSelected.bind(this,'ListMyTestApis')} >
                       <div style={textDivStyle}>
                             <span style={numStyle}>{this.state.data.testNum}</span>
                             <div style={textStyle}>最近测试的</div>
                         </div>
                     </div>
                 </Col>
                 <Col span={5}>
                     <div className="apiTotalDiv"  onClick={this.onMenuSelected.bind(this,'ListAllApiDocs')} >
                       <div style={textDivStyle}>
                             <span style={numStyle}>{this.state.data.totalApiNum}</span>
                             <div style={textStyle}>API总数</div>
                         </div>
                     </div>
                 </Col>
                 <Col span={4}>
                     <div className="apiTotalDiv"  >
                       <div style={textDivStyle}>
                             <span style={numStyle}>{this.state.data.totalAppNum}</span>
                             <div style={textStyle}>总应用数</div>
                         </div>
                     </div>
                 </Col>
               </Row>
          </div>
    );
  }
}

export default HomePageTotalNum;
