// JavaScript Document
TFibicsProject = Class.extend({
	init: function(){
	 this.initVar();
	},
	initVar: function(){
		this.name = '';
		this.version = 0;
		this.uid = guid();
		// possible values: zeiss, fibics, none
		this.publisher = 'fibics';
		// array with all the different images of the project.
		this.pExportedInstances = new Array();  // formely aAtlasInfos
	},
	clear: function(){
		this.initVar();
	},
	fromXML: function($n){
		if($n == undefined)
			throw 'Invalid Fibics Project node.';

		this.name = $n.children('Name').text();
		this.description = $n.children('Description').text();
		this.version = parseFloat($n.children('Version').text());
		this.uid = $n.children('Uid').text();
		this.publisher = $n.children('Publisher').text();
		if(this.publisher == undefined) this.publisher = 'fibics'
		var me = this;

		$expInsN = $n.find('ExportedInstances');
		if($expInsN.length == 0) {
			// try to load it the old way
			if(!this.fromXMLOld($n))
				throw 'Your project does not contains any exported data.';
		}
		else{
			if (isNaN(this.version))
				this.version = '2.2';
		}

		$expInsN.children().each(function(){
			// Should Create a different Instance based on the Node Name
			// Mosaic
			if((this.nodeName == C_EXPORTED_MOSAIC_NODE_NAME)
					|| (this.nodeName == C_EXPORTED_SESSION_NODE_NAME)
					|| (this.nodeName == C_EXPORTED_DATA_NODE_NAME)
					|| (this.nodeName == C_EXPORTED_CARRIER_NODE_NAME)
					|| (this.nodeName == C_EXPORTED_PROJECT_NODE_NAME)
					|| (this.nodeName == C_EXPORTED_IMAGE_NODE_NAME)){
				var pM = new TExportedAcquiredData($(this));
				me.pExportedInstances.push(pM);
			}
			else{
				jAlert('Unsupported exported data.');
			}
		});
	},
	fromXMLOld: function($n){

		if($n == undefined) throw 'Invalid Fibics Project node.';
		this.name = $n.children('Name').text();
		this.description = $n.children('Description').text();
		this.uid = $n.children('Uid').text();
		this.publisher = $n.children('Publisher').text();
		if(this.publisher == undefined) this.publisher = 'fibics'
		var me = this;
		$n.find('Images').children('Image').each(function(){
			aInfo =  new TChannelInfo(this);
			me.pExportedInstances.push(aInfo);
		});
		return true;
	},
	toXML: function($n){
		$projN = $($.parseXML('<Project />').documentElement);
		$n.append($projN);
		$projN.append(newXMLNode('Name').html(this.name));
		$projN.append(newXMLNode('Version').html(this.version));
		$projN.append(newXMLNode('Uid').html(this.uid));
		$projN.append(newXMLNode('Description').html(this.description));
		$projN.append(newXMLNode('Publisher').html(this.publisher));
		$imgsNode = newXMLNode(C_EXPORTED_INSTANCES_NODE_NAME).appendTo($projN);

		for(var i = 0; i < this.pExportedInstances.length; i++){
			this.pExportedInstances[i].toXML($imgsNode);
		}
	},
	getChannelCount: function(){
		var iChannel = 0;
		//return this.pExportedInstances.length;
		/////////////////////////////////////////////////////
		for(var i = 0; i < this.pExportedInstances.length; i++){
			iChannel += this.pExportedInstances[i].getChannelCount();
		}
		return iChannel;
	},
	getChannel: function(iChannel){
		var kdx = 0;
		for(var idx = 0; idx < this.pExportedInstances.length; idx++){
			for (var jdx = 0; jdx < this.pExportedInstances[idx].getChannelCount(); jdx++){
				if (kdx == iChannel){
					return this.pExportedInstances[idx].pChannelList[jdx];
				}
				kdx++;
			}
		}
	},
	getLargestExtendChannel: function(){
		return this.getLargestExtendChannelShown(false);
	},
	getLargestExtendChannelShown: function(onlyshown=true){
		if(this.pLargestChannel != null) {
			if(this.pLargestChannel.isVisible) {
				return this.pLargestChannel;
			}
		}
		var maxArea = -1;
		var maxIdx = "";

		for(idx = 0; idx < this.pExportedInstances.length; idx++){
			for(jdx = 0; jdx < this.pExportedInstances[idx].pChannelList.length; jdx++){
				var area = this.pExportedInstances[idx].pChannelList[jdx].pSynchInfo.size.width * this.pExportedInstances[idx].pChannelList[jdx].pSynchInfo.size.height;
				if (area > maxArea) {
					if (onlyshown && !(this.pExportedInstances[idx].pChannelList[jdx].isVisible))
					 	continue;
					this.pLargestChannel = this.pExportedInstances[idx].pChannelList[jdx];
					maxArea = area;
					maxIdx = idx + jdx;
				}
			}
		}
		this.pLargestChannel.idx = maxIdx;
		return this.pLargestChannel;
	}
});
