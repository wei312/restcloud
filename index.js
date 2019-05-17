// index.jsx 文件
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory, IndexRoute  } from 'react-router';
import moment from 'moment';
import * as AjaxUtils from './core/utils/AjaxUtils';
import * as URI from './core/constants/RESTURI';

// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const requireAuth = (nextState, replace) => {
    let identitytoken=AjaxUtils.getCookie(URI.cookieId);
    if (identitytoken==="") {
        replace({ pathname: URI.loginUrl })
    }
}
const setTitle = (title) => {
    document.title = title;
}

//系统登录
import Login from './core/login/Login'
import NoRoute from './designer/components/NoRoute';

//Portal首页
import PortalHome from './portal/IndexLayout';
//应用管理主界面
import ApplicationIndex from './designer/ApplicationIndex';
//应用开发主界面
import DesignerIndex from './designer/DesignerIndex';
//组织权限管理
import Org_IndexLayout from './designer/org/index';
//平台监控**********************************
import MonitoIndexLayout from './monitor/MonitoIndexLayout';
//API Doc文档
import APIDOC_Home from './apidoc/APIIndexLayout';
//服务注册与发现路由开始
import Discovery_IndexLayout from './discovery/DisIndexLayout';
//配置中心
import ConfigCenter_IndexLayout from './discovery/config/ConfigIndexLayout';
//API-网关
import NewGatewayIndexLayout from './gateway/IndexLayout';
//apiflow
//import ApiFlowLayout from './apiflow/ApiFlowLayout';
//workflow用户端
import WorkFlowFrontendLayout from './workflow/frontend/IndexLayout';

function App() {
    return (
    <Router history={browserHistory}>
        <Route path={URI.loginUrl} component={Login} ><IndexRoute component={Login} /></Route>
        <Route path={URI.rootPath} component={PortalHome} onEnter={requireAuth} />
        <Route path={URI.rootPath+'/application'} component={ApplicationIndex} />
        <Route path={URI.rootPath+'/designer'} component={DesignerIndex} />
        <Route path={URI.rootPath+'/org'} component={Org_IndexLayout} />
        <Route path={URI.rootPath+'/openapi'} component={APIDOC_Home} />
        <Route path={URI.rootPath+'/discovery'} component={Discovery_IndexLayout} />
        <Route path={URI.rootPath+'/config'} component={ConfigCenter_IndexLayout} />
        <Route path={URI.rootPath+'/gateway'} component={NewGatewayIndexLayout} ></Route>
        <Route path={URI.rootPath+"/monitor"} component={MonitoIndexLayout} />
        <Route path={URI.rootPath+"/workflow"} component={WorkFlowFrontendLayout} />
    </Router>);
}


ReactDOM.render(<App />, document.getElementById('content'));
