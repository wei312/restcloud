//节点右击菜单
var nodeMenuJson = [
	{
		name: "节点属性",
		id: "nodeAttr",
		callback: function(tempId) {
			window.editNodeProps(tempId);
		}
	},
	{
		name: "复制节点",
		id: "copyNode",
		callback: function(tempId) {
			copyNode(tempId);
		}
	},
	{
		name: "删除节点",
		id: "deleteNode",
		callback: function(tempId) {
			deleteNode(tempId);
		}
	},
	{
		name: "显示节点前继路径",
		id: "connRouteFront",
		callback: function(tempId) {
			showConnectionRoute(tempId, 'front');
		}
	},
	{
		name: "显示节点后续路径",
		id: "connRouteBehind",
		callback: function(tempId) {
			showConnectionRoute(tempId, 'behind');
		}
	}
];

//连接线右击菜单
var connectionMenuJson = [
	{
		name: "路由属性",
		id: "connectionAttr",
		callback: function(tempId) {
			//编辑路由属性
			var sourceId = $(tempId).attr('sourceId');
			var targetId = $(tempId).attr('targetId');
			var routerId=graph.edge(sourceId,targetId).id;
			var routerLabel=getRouterLabel(sourceId, targetId);
			var routerObj={sourceId:sourceId,targetId:targetId,nodeId:routerId,eleId:tempId,nodeType:'router',text:routerLabel};
			window.editRouterProps(routerObj);
		}
	},{
		name: "删除连线",
		id: "deleteConnection",
		callback: function(tempId) {
			deleteConnection(tempId);
		}
	},{
			name: "固定源端点至顶部",
			id: "srcTopEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'source','Top');
			}
	},{
			name: "固定源端点至底部",
			id: "srcBottomEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'source','Bottom');
			}
	},{
			name: "固定源端点至左则",
			id: "srcLeftEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'source','Left');
			}
	},{
			name: "固定源端点至右则",
			id: "srcRightEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'source','Right');
			}
	},{
			name: "固定目标端点至顶部",
			id: "targetTopEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'target','Top');
			}
	},{
			name: "固定目标端点至底部",
			id: "targetBottomEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'target','Bottom');
			}
	},{
			name: "固定目标端点至左则",
			id: "targetLeftEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'target','Left');
			}
	},{
			name: "固定目标端点至右则",
			id: "targetRightEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'target','Right');
			}
	}
];

//路由线子菜单


//文字节点菜单
var textNodeMenuJson = [
	{
		name: "修改文字",
		id: "nodeAttr",
		callback: function(tempId) {
			window.editNodeProps(tempId);
		}
	},
	{
		name: "删除文字",
		id: "deleteNode",
		callback: function(tempId) {
			deleteTextNode(tempId);
		}
	}
];

//泳道右击菜单
var laneMenuJson = [
	{
		name: "属性编辑",
		id: "laneAttr",
		callback: function(tempId) {
			//编辑泳道属性
			laneAttr(tempId)
		}
	},
	{
		name: "删除泳道",
		id: "deleteLane",
		callback: function(tempId) {
			deleteLane(tempId);
		}
	}
];

//画布右击菜单
var canvasMenuJson = [
	{
		name: "流程属性",
		id: "processAttribute",
		callback: function(tempId) {
			//编辑过程属性
			window.editProcessProps();
			// editProperty('Process');
		}
	},
	{
		name: "粘贴",
		id: "pasteNode",
		callback: function(tempId) {
			pasteNode();
		}
	},
	{
		name: "全选",
		id: "selectAll",
		callback: function(tempId) {
			selectedAll();
		}
	},
	{
		name: "对齐方式",
		id: "alignWay"
	},
	{
		name: "运行流程",
		id: "runProcess",
		callback: function(tempId) {
			window.runProcess();
		}
	},
	{
		name: "保存流程",
		id: "saveFlowChart",
		callback: function(tempId) {
			window.saveProcess();
		}
	},



	//对齐方式子菜单
	{
		name: "左对齐",
		id: "leftAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				leftAlign(selectedNodeIdArr);
				setTimeout(function(){
					leftAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "垂直居中",
		id: "verticalCenter",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				verticalCenter(selectedNodeIdArr);
				setTimeout(function(){
					verticalCenter(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "右对齐",
		id: "rightAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				rightAlign(selectedNodeIdArr);
				setTimeout(function(){
					rightAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "上对齐",
		id: "upAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				upAlign(selectedNodeIdArr);
				setTimeout(function(){
					upAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "水平居中",
		id: "levelAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				levelAlign(selectedNodeIdArr);
				setTimeout(function(){
					levelAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "下对齐",
		id: "downAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				downAlign(selectedNodeIdArr);
				setTimeout(function(){
					downAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	}
];

//查看流程图画布右击菜单
var showFlowMenuJson = [
	{
		name: "背景切换",
		id: "bgToggle",
		callback: function() {
			console.log('bgToggle...');
		}
	}
];
