import React from 'react';
import { Form, Select, Input, Button,Spin,Icon,Radio,Row,Col,Tooltip,Popover,Divider,AutoComplete} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as FormUtils from '../../utils/FormUtils';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById=URI.CORE_DATASOURCE.getById; //获取测试服务配置信息的url地址
const SubmitUrl=URI.CORE_DATASOURCE.save; //存盘地址

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.state={
      mask:false,
      RdbDisplay:'',
      DriverDisplay:'none',
      formData:{},
    };
  }

  componentDidMount(){
      if(this.props.id===''){return;}
      let url=GetById.replace("{id}",this.id);
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.selectChange(data.configType);
            this.setState({formData:data});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
  }

  onSubmit = (closeFlag,testConn='') => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let value=values[key];
                if(value instanceof Array){
                  postData[key]=value.join(","); //数组要转换为字符串提交
                }else{
                  postData[key]=value;
                }
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          postData.testConn=testConn;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
                if(closeFlag){
                  this.props.close(true);
                }
              }
          });
      }
    });
  }

  selectChange=(configType)=>{
    // let configType=this.props.form.getFieldValue("configType");
    if(configType==='RDB'){
      this.setState({RdbDisplay:'',DriverDisplay:'none'});
    }else if(configType==='Driver'){
      this.setState({RdbDisplay:'none',DriverDisplay:''});
    }
  }

  insertCode1=()=>{
      let code=`filters=stat
initialSize=5
validationQueryTimeout=1
maxActive=300
maxWait=60000
timeBetweenEvictionRunsMillis=60000
minEvictableIdleTimeMillis=300000
validationQuery=select 1
testWhileIdle=true
testOnBorrow=false
testOnReturn=false
poolPreparedStatements=false
maxPoolPreparedStatementPerConnectionSize=200`;
    this.props.form.setFieldsValue({props:code})
    this.state.formData.props=code;
  }

  insertCode2=()=>{
      let code=`initialPoolSize=10
maxPoolSize=100
minPoolSize=10
maxIdleTime=1800000
maxStatements=1000
acquireIncrement=3
idleConnectionTestPeriod=60
acquireRetryAttempts=30
acquireRetryDelay=1000
breakAfterAcquireFailure=false
testConnectionOnCheckout=true
testConnectionOnCheckin=false`;
this.props.form.setFieldsValue({props:code})
this.state.formData.props=code;
  }

insertCode3=()=>{
      let code=`initialSize=10
maxActive=100
maxWait=60000
minIdle=5
timeBetweenEvictionRunsMillis=60000
minEvictableIdleTimeMillis=300000
validationQuery=select 1 from dual
validationQueryTimeout=3000
testWhileIdle=false
testOnBorrow=true
testOnReturn=false
removeAbandoned=false
removeAbandonedTimeout=60000
logAbandoned=true
poolPreparedStatements=false
maxOpenPreparedStatements=200`;
this.props.form.setFieldsValue({props:code})
this.state.formData.props=code;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="数据源类型"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定数据源的类型,频繁访问的请选择数据库链接池，偶尔访问的请选择DriverManager连接"
        >
          {
            getFieldDecorator('configType', {initialValue:'RDB'})
            (<Select onChange={this.selectChange} >
              <Option value='RDB'>使用数据库链接池链接</Option>
              <Option value='Driver'>直接使用DriverManager链接</Option>
            </Select>)
          }
        </FormItem>
        <FormItem
          label="配置说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义且能描述本数据源的说明"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true}]
            })
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="数据源唯一Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定一个唯一Id在获取数据库链接时使用(至少要有一个默认为default的数据源)"
        >
          {
            getFieldDecorator('configId', {
              rules: [{ required: true}],initialValue:'default'
            })
            (<Input />)
          }
        </FormItem>
        <FormItem label="用户Id" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定链接数据源的用户Id，没有可以为空值'
        >
          {getFieldDecorator('userId',{initialValue:'root'})
          (
            (<Input />)
          )}
        </FormItem>
        <FormItem label="密码" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定链接数据源的密码,没有可以为空值'
        >
          {getFieldDecorator('password',{initialValue:''})
          (
            (<Input type='password' />)
          )}
        </FormItem>
        <FormItem label="加密密码" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='选择是表示保存时对密码进行一次加密'
        >
          {getFieldDecorator('changePassword',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="数据库连接池" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          style={{display:this.state.RdbDisplay}}
          help='可以根据自已的偏好指定任意一种数据库连接池类型(不同的数据库连接池在性能上有少许差异)'
        >
          {getFieldDecorator('dataSource',{initialValue:'com.alibaba.druid.pool.DruidDataSource'})
          (
            (<Select >
              <Option value='com.alibaba.druid.pool.DruidDataSource'>com.alibaba.druid.pool.DruidDataSource</Option>
              <Option value='org.apache.commons.dbcp.BasicDataSource'>org.apache.commons.dbcp.BasicDataSource</Option>
              <Option value='com.mchange.v2.c3p0.ComboPooledDataSource'>com.mchange.v2.c3p0.ComboPooledDataSource</Option>
            </Select>)
          )}
        </FormItem>
        <FormItem label="数据库驱动Class" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定数据源所需要的驱动类JDBC或者ODBC驱动Class'
        >
          {getFieldDecorator('driverClass',{initialValue:''})
          (
            (<AutoComplete filterOption={true} >
              <Option value='com.mysql.cj.jdbc.Driver'>com.mysql.cj.jdbc.Driver</Option>
              <Option value='oracle.jdbc.OracleDriver'>oracle.jdbc.OracleDriver</Option>
              <Option value='com.microsoft.sqlserver.jdbc.SQLServerDriver'>com.microsoft.sqlserver.jdbc.SQLServerDriver</Option>
              <Option value='org.postgresql.Driver'>org.postgresql.Driver</Option>
              <Option value="sun.jdbc.odbc.JdbcOdbcDriver">sun.jdbc.odbc.JdbcOdbcDriver</Option>
              <Option value="org.apache.hive.jdbc.HiveDriver">org.apache.hive.jdbc.HiveDriver</Option>
              <Option value="com.sap.db.jdbc.Driver">com.sap.db.jdbc.Driver</Option>
              <Option value="org.elasticsearch.xpack.sql.jdbc.jdbc.JdbcDriver">org.elasticsearch.xpack.sql.jdbc.jdbc.JdbcDriver</Option>
              <Option value="org.apache.phoenix.jdbc.PhoenixDriver">org.apache.phoenix.jdbc.PhoenixDriver</Option>
              <Option value="com.pivotal.jdbc.GreenplumDriver">com.pivotal.jdbc.GreenplumDriver</Option>
            </AutoComplete>)
          )}
        </FormItem>
        <FormItem label="链接数据源URL" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='指定链接数据源的jdbc Url配置'
        >
          {getFieldDecorator('jdbcUrl',{initialValue:''})
          (
            (<AutoComplete filterOption={true} >
              <Option value='jdbc:mysql://localhost:3306/dbname'>jdbc:mysql://localhost:3306/testdb</Option>
              <Option value='jdbc:sqlserver://127.0.0.1;databasename=dbname'>jdbc:sqlserver://127.0.0.1;databasename=testdb</Option>
              <Option value='jdbc:oracle:thin:@127.0.0.1:1521:orcl'>jdbc:oracle:thin:@127.0.0.1:1521:orcl</Option>
              <Option value='jdbc:postgresql://127.0.0.1:5432/dbname'>jdbc:postgresql://127.0.0.1:5432/dbname</Option>
              <Option value="jdbc:odbc:dbname">jdbc:odbc:dbname</Option>
              <Option value="jdbc:hive2://127.0.0.1:10000/default">jdbc:hive2://127.0.0.1:10000/default</Option>
              <Option value="jdbc:sap://127.0.0.1:30015?reconnect=true">jdbc:sap://127.0.0.1:30015?reconnect=true</Option>
              <Option value="jdbc:es://127.0.0.1:9200">jdbc:es://127.0.0.1:9200</Option>
              <Option value="jdbc:dm://127.0.0.1:Port/Database">jdbc:dm://127.0.0.1:Port/Database</Option>
              <Option value="jdbc:phoenix:server1,server2:3333">jdbc:phoenix:server1,server2:3333</Option>
              <Option value="jdbc:pivotal:greenplum://host:port;DatabaseName=">jdbc:pivotal:greenplum://host:port;DatabaseName=</Option>
            </AutoComplete>)
          )}
        </FormItem>
        <FormItem
          label="驱动包所在路径"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.state.DriverDisplay}}
          help='指定驱动包jar文件所在的路径或目录，空表示使用默认的驱动包及版本'
        >{
          getFieldDecorator('driverJarPath')
          (<Input.TextArea autosize />)
          }
        </FormItem>
        <FormItem
          label="数据库连接池配置"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.state.RdbDisplay}}
          help={<span><a style={{cursor:'pointer'}} onClick={this.insertCode1}>DBCP示例</a> <Divider type="vertical" />
        <a style={{cursor:'pointer'}} onClick={this.insertCode2}>C3P0示例</a> <Divider type="vertical" />
          <a style={{cursor:'pointer'}} onClick={this.insertCode3}>Druid示例</a></span>}
        >{
          getFieldDecorator('props')
          (<Input.TextArea autosize />)
          }
        </FormItem>
        <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          {getFieldDecorator('state',{initialValue:'1'})
          (
            <RadioGroup>
              <Radio value='1'>启用</Radio>
              <Radio value='0'>停用</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='注意:当类型为数据库链接池时一旦数据库链池链接上后，再修改属性必须重启tomcat才能生效'
        >{
          getFieldDecorator('remark')
          (<Input.TextArea autosize />)
          }
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true,'')}  >保存退出</Button>{' '}
          <Button type="ghost" onClick={this.onSubmit.bind(this,false,'testConn')}  >保存并测试链接</Button>{' '}
          <Button onClick={this.props.close.bind(this,false)}  >关闭</Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewRdbsDataSource = Form.create()(form);

export default NewRdbsDataSource;
