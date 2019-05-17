var initColor = '#fff';
var animateColor = '#ff0000';
var animateAfterColor = '#00FF99';
var nodePath, index = 0;
var tipMsg = '';
var common;

$(function() {
	//读取配置
	$.ajax({
	    url: "../config/config.json",
	    //同步请求
	    async: false,
	    type: 'get',
	    success: function(data) {
			CONFIG = data;
	    }
	});

	tipMsg = CONFIG.msg.currentProgress;

	common = {
		connector: [CONFIG.conn.connectionType, { gap: CONFIG.conn.connectionGap, cornerRadius: CONFIG.conn.connectionCornerRadius, alwaysRespectStubs: CONFIG.conn.connectionAlwaysRespectStubs }],
		connectorOverlays: [
			['Arrow', { width: CONFIG.arrow.arrowWidth, length: CONFIG.arrow.arrowLength, location: CONFIG.arrow.arrowLocation }]
		],
		paintStyle: {
			strokeStyle: '#1e8151',
			stroke: '#7AB02C',
			strokeWidth: CONFIG.endPonit.endPointStrokeWidth,
			fill: 'pink',
			fillStyle: '#1e8151',
			radius: CONFIG.endPonit.endPointRadius
		},
		hoverPaintStyle: {
			stroke: CONFIG.endPonit.hoverEndPointStroke,
		},
		isSource: true,
		isTarget: true
	}


	$("#shwoFlowId").contextmenu(function(event) {
		event.preventDefault();
	});
	$('#loading', parent.document).remove();
	$('#loading-mask', parent.document).remove();
});

// 初始化流程图
function showFlow(nodeModelObj,insNodeList) {
	removeAll();

	var nodeArr = nodeModelObj.nodeDataArray;
	var linkArr = nodeModelObj.linkDataArray;

	for(var i = 0; i < nodeArr.length; i++) {

		var nodeObj = chooseNodeObjFromType(nodeArr[i].nodeType);
		//节点类型为泳道时特殊初始化处理
		if (nodeArr[i].nodeType == 'broadwiseLane' || nodeArr[i].nodeType == 'directionLane') {
			initLane(nodeObj, nodeArr[i]);
			continue;
		}

		//设置节点
		$("#Container").append('<div id="' + nodeArr[i].key + '" class="' + nodeObj.cla + '" ondblclick="editProperty(\'' + nodeArr[i].key + '\')"></div>');
		$("#" + nodeArr[i].key).offset({ top: nodeArr[i].locTop, left: nodeArr[i].locLeft });
		$("#" + nodeArr[i].key).css('height', nodeArr[i].nodeHeight);
		$("#" + nodeArr[i].key).css('width', nodeArr[i].nodeWidth);
		$("#" + nodeArr[i].key).css('cursor', 'pointer');
		addTextToNode($("#" + nodeArr[i].key),nodeArr[i].text);

		//设置节点的右键菜单
		window.ContextMenu.bind("#" + nodeArr[i].key, nodeMenuJson);

		//将节点添加到图对象中
		graph.setNode(nodeArr[i].key, {
			text: nodeArr[i].text,
			key: nodeArr[i].key,
			nodeType: nodeArr[i].nodeType,
			locTop: nodeArr[i].locTop,
			locLeft: nodeArr[i].locLeft,
			nodeHeight: nodeArr[i].nodeHeight,
			nodeWidth: nodeArr[i].nodeWidth,
			bgColor: nodeArr[i].bgColor,
			isSelected: false
		});

		var selector = '#' + nodeArr[i].key;
		if(nodeArr[i].nodeType!=='textNode'){ //文字节点不增加事件
			$(selector).mouseover(function() {
				// 当节点选中标识为false，也就是未被选中时
					$(this).css('box-shadow', 'rgb(0, 0, 0) 0px 0px 30px 0px');
					$(this).css('border', 'solid #FF6666');
			}).mouseout(function() {
				// 当节点选中标识为false，也就是未被选中时
					$(this).css('box-shadow', '');
					$(this).css('border', '');
			});
		}

		//记录节点id
		recordNodeId(nodeArr[i].key);
	}

	for(var i = 0; i < linkArr.length; i++) {
		//连线
		connectTwoNode(linkArr[i].from, linkArr[i].to, linkArr[i].routerId,linkArr[i].sourceAnchor,linkArr[i].targetAnchor);

		//给路由添加id、右击菜单
		addConnectionId(linkArr[i].from, linkArr[i].to, linkArr[i].routerId);

		window.ContextMenu.bind("#" + linkArr[i].routerId, connectionMenuJson);

		//设置连接线双击打开属性编辑窗口事件
		$('#' + linkArr[i].routerId).dblclick(function(event) {
			editProperty($(this).context.id,'showinfo');
		});

		//给路由添加文本信息,这里不用添加了，后面会显示实时的信息数据
		//addRouterLabel(linkArr[i]);

		//记录连接线id
		recordNodeId(linkArr[i].routerId);
	}

  //insNodeList是ProcessMonitorFrame中传入进来的节点id实时运行状态数据
	initNodeMonitorInfo(insNodeList);
}

function addRouterLabel(routerConfig){
	//给路由添加文本信息
	if (routerConfig.label != '') {
		INSTANCE_JSPLUMB.getConnections({
			source: routerConfig.from,
			target: routerConfig.to
		})[0].setLabel({
			label: routerConfig.label,
			cssClass: 'labelClass'
		});
	}
}

//显示节点的监控信息
function initNodeMonitorInfo(insNodeList) {
	//console.log(insNodeList);
	for(var i=0;i<insNodeList.length;i++){
		var nodeObj=insNodeList[i]; //流程实例节点对像
		var nodeId=nodeObj.pNodeId;

		//首先设置节点的北景色,路由线不能设置背景
		if(nodeObj.pNodeType!=='router'){
			var processNodeObj=	$(getJquerySelectorPrefix(nodeId)); //流程节点对像
			if(processNodeObj.length==0){continue;} //说明节点不存在或者被删除了
			if(nodeObj.currentStatus==='current'){
					processNodeObj.css('background-color', '#FF3333');
					processNodeObj.attr('name', 'currentNode');
			}else if(nodeObj.currentStatus==='end'){
					processNodeObj.css('background-color', '#00FF99');
					processNodeObj.attr('name', 'publishNode');
			}else{
					processNodeObj.css('background-color', '#f4f4f4');
			}
		}

		//设置节点上的监控文字
		var countNodeId=nodeId+"_count";
		var nodeMsgObj=$("#" + countNodeId);
		var msg=nodeObj.monitorMsg;
		if(msg!=="" && msg!==undefined){
				if(nodeObj.pNodeType==='router'){
							var routerObj=INSTANCE_JSPLUMB.getConnections({source: nodeObj.sourceId,target: nodeObj.targetId})[0];
							if(routerObj!=undefined){
								routerObj.setLabel({label: msg,cssClass: 'monitorCountText'});
							}
				}else{
						var left=nodeObj.left||25;
						if(nodeMsgObj.length>0){
							nodeMsgObj.text(msg);
						}else{
							$("#Container").append('<div id="' + countNodeId + '" class="monitorCountText" >' +msg+'</div>');
						}
						var offset=processNodeObj.offset();
						$("#" + countNodeId).offset({ top:offset.top+70, left:offset.left+left });//设置节点的位置
				}
		 }

	}
}

function playProcess(insNodeList) {
	var CurrentNodeid="";
	var EndNodeList="";
	for(var i=0;i<insNodeList.length;i++){
		var nodeObj=insNodeList[i]; //流程实例节点对像
		if(nodeObj.currentStatus==='current'){
			if(nodeObj.pNodeId!=='process'){
				if(CurrentNodeid===''){CurrentNodeid=nodeObj.pNodeId;}
				else{CurrentNodeid+=","+nodeObj.pNodeId;}
			}
		}else if(nodeObj.currentStatus===undefined || nodeObj.currentStatus==='end'){
			if(nodeObj.pNodeType==='router'){
				var nodeId=nodeObj.sourceId+"#"+nodeObj.targetId;
				if(EndNodeList===''){EndNodeList=nodeId;}
				else{EndNodeList+=","+nodeId;}
			}else if(nodeObj.pNodeId!=='process'){
				if(EndNodeList===''){EndNodeList=nodeObj.pNodeId;}
				else{EndNodeList+=","+nodeObj.pNodeId;}
			}
		}
	}
	// console.log("CurrentNodeid="+CurrentNodeid);
	// console.log("EndNodeList="+EndNodeList);
	if (CurrentNodeid == '' && EndNodeList == '') {
		return;
	} else if (CurrentNodeid == '' && EndNodeList != '') {
		var a = EndNodeList.lastIndexOf(',');
		if (a != -1) {
			CurrentNodeid = EndNodeList.substring(a + 1, EndNodeList.length).trim();
			EndNodeList = EndNodeList.substring(0, a).trim();
			tipMsg = CONFIG.msg.flowPublish;
		} else {
			return;
		}
	}

	//获取节点路劲，当前节点为路径的最后一个节点
	nodePath = getNodePath(EndNodeList);
	nodePath.push(CurrentNodeid);

	//初始化节点样式
	for (var i = 0; i < nodePath.length; i++) {
		$(getJquerySelectorPrefix(nodePath[i])).css('background-color',initColor);
	}

	nodeAnimate('#f50');
}

/**
 * 获取节点路劲
 * @param {String} endNodeList
 */
function getNodePath(endNodeList) {
	var nodePath = [];
	var flowPath = endNodeList.split(','), i;
	for (i = 0; i < flowPath.length; i++) {
		if (flowPath[i].substring(0, 1) != 'R') {
			nodePath.push(flowPath[i]);
		}
	}
	return nodePath;
}

/**
 * 节点动画
 */
function nodeAnimate(gradientColorArr) {
	var j = 0;
	var connsObj=null;
	var timer = setInterval(function() {
		if (j < gradientColorArr.length) {
			if(nodePath[index].indexOf("#")!=-1){
				// console.log(nodePath[index]);
				 var nodeIdArray=nodePath[index].split("#");
				 var sourceId=nodeIdArray[0];
				 var targetId=nodeIdArray[1];
					conns = INSTANCE_JSPLUMB.getConnections( { source:sourceId,target: targetId } );
					connsObj=conns[0];
					if(connsObj!==undefined){
						connsObj.setPaintStyle({fill:'#ff0000',stroke:'#ff0000',strokeWidth:4});
					}
			}else{
				$(getJquerySelectorPrefix(nodePath[index])).css('background-color','#f50');
			}
			j++;
		} else {
			//清除定时器
			clearInterval(timer);
			//清除线条色彩
			if(connsObj!==null && connsObj!=undefined){
				connsObj.setPaintStyle({fill:'#1e8151',stroke:'#7AB02C',strokeWidth:4});
			}

			//当前节点前的节点
			if (index < nodePath.length - 1) {
				$(getJquerySelectorPrefix(nodePath[index])).css('background-color', animateAfterColor);
				index++;
				nodeAnimate(gradientColorArr);
			} else if (index == nodePath.length - 1) { //当前节点
				layer.tips(tipMsg, getJquerySelectorPrefix(nodePath[index]), {
					tips: [1, '#23262e'],
					time: 2000
				});
				index = 0;
			}
		}
	}, 100);
}
