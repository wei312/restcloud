export const workflowHost="http://47.92.110.139:8081/workflow";

//工作流引擎前端
export const WORKFLOW_FRONTEND={
  RunProcess:workflowHost+'/r?wf_num=R_S003_B035',
  DelFollows:workflowHost+'/readgridaction',
  ListStartProcess:workflowHost+"/rest/process/applicable",
  UserToDoCount:workflowHost+"/rest/task/count",
  ListToDos:workflowHost+'/r?wf_num=D_S005_J001',
  ListReadDocs:workflowHost+'/r?wf_num=D_S005_J002',
  ListDoneDocs:workflowHost+'/r?wf_num=D_S005_J003',
  ListMyStartDocs:workflowHost+'/r?wf_num=D_S005_J004',
  ListAllApprovals:workflowHost+'/r?wf_num=D_S005_J005',
  ListClosedDocs:workflowHost+'/r?wf_num=D_S005_J006',
  ListEntrustedDocs:workflowHost+'/r?wf_num=D_S005_J007',
  ListDraftDocs:workflowHost+'/r?wf_num=D_S005_J008',
  ListFollowDocs:workflowHost+'/r?wf_num=D_S005_J010',
}

//工作流引擎
export const CORE_WORKFLOW={
  listByPage:host+"/rest/workflow/process/list",
  delete:host+"/rest/workflow/process/delete",
  copy:host+"/rest/workflow/process/copy",
  publish:host+"/rest/workflow/process/publish",
}
//流程监控
export const CORE_WORKFLOWMONITOR={
  listTasks:host+"/rest/workflow/monitor/tasks",
  deleteTask:host+"/rest/workflow/monitor/task/delete",
}

//工作流业务规则
export const CORE_WORKFLOWRULE={
  listByPage:host+"/rest/workflow/rule/list",
  delete:host+"/rest/workflow/rule/delete",
  copy:host+"/rest/workflow/rule/copy",
  update:host+"/rest/workflow/rule/update",
}
