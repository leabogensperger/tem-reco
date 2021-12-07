var C_EXPORTED_INSTANCES_NODE_NAME = 'ExportedInstances';
var C_EXPORTED_MOSAIC_NODE_NAME = 'Mosaic';
var C_EXPORTED_CARRIER_NODE_NAME = 'Carrier';
var C_EXPORTED_IMAGE_NODE_NAME = 'Image';
var C_EXPORTED_SESSION_NODE_NAME = 'Session';
var C_EXPORTED_PROJECT_NODE_NAME = 'AtlasProject';
var C_EXPORTED_DATA_NODE_NAME = 'Data';
var C_EXPORT_INFO_NODE_NAME = 'ExportInfo';
var C_IMAGE_INFO_NODE_NAME = 'Image';
var C_CHANNELS_NODE_NAME = 'Channels';
var C_CHANNEL_NODE_NAME = 'Channel';
var C_SYNCH_INFO_NODE_NAME = 'SynchInfo';

/*
	An exported instance is a basic placeable in the terms of Atlas 5 nomenclature.
	It must contain at least one image in the Seadragon image format. (TChannelInfo)
	An TAtlasViewport will be created for each instance of TChannelInfo.
*/

TExportedInstance =  Class.extend({
	init: function($node){
		this.pChannelList = new Array();
		this.pSynchInfo = null;
		this.dExportedPixelSize= -1; 
		this.ExportedInstanceType = TExportedInstanceType.Unknown;
		this.pExportInfoSet = new TExportInfoSet();
		this.fromXML($node);		
	},
	addChannelInfo: function(pChannelInfo){
		this.pChannelList.push(pChannelInfo);	
	},
	fromXML: function($node){
		// get all the channels of the exported instance.
		var $csN = $node.find(C_CHANNELS_NODE_NAME);
		if ($csN.length == 0)
			throw 'The exported data does not contains any channels.';
		
		var me = this;
		$UIDNode = $node.children('uid');
		if($UIDNode != null) // TODO WHY html() does not work with IExplorer.
			this.uid = $UIDNode.text();
		else
			this.uid = guid();
		
		// load the synch info
		var $synchN = $node.children(C_SYNCH_INFO_NODE_NAME);
		if ($synchN.length == 0)
			throw 'The exported data must have synch information.';
		
		this.pSynchInfo = new TSynchInfo();
		this.pSynchInfo.fromXML($synchN);
		
		if (this.pSynchInfo.bGetInfoFromExportInstance){
			this.pSynchInfo.loadFromExportedInstance($node);	
		}
			
		
		if($node.get(0).nodeName == C_EXPORTED_MOSAIC_NODE_NAME)
			this.ExportedInstanceType = TExportedInstanceType.Mosaic;
		else if($node.get(0).nodeName == C_EXPORTED_DATA_NODE_NAME)
			this.ExportedInstanceType = TExportedInstanceType.SingleImage;
		else if($node.get(0).nodeName == C_EXPORTED_IMAGE_NODE_NAME)
			this.ExportedInstanceType = TExportedInstanceType.SingleImage;
		else if($node.get(0).nodeName == C_EXPORTED_SESSION_NODE_NAME)
			this.ExportedInstanceType = TExportedInstanceType.Session;	
		else if($node.get(0).nodeName == C_EXPORTED_CARRIER_NODE_NAME)
			this.ExportedInstanceType = TExportedInstanceType.Carrier;	
			
		
		$csN.find(C_CHANNEL_NODE_NAME).each(function(){
			// a channel function must have its parent synchInfo 
			// since the synchInfo could be stored in its parent.
			var pC = new TChannelInfo($(this), me.pSynchInfo);
			me.addChannelInfo(pC);
		});	
				
		// if the synch info are still NaN, now use the Seadragon Export info.
		// it will be centered at (0,0) but it will have the right width and height.
		if ((!this.pSynchInfo.isValid()) 
			|| (!this.pSynchInfo.isConsistantWithSDInfo(this.pChannelList[0].sdInfo))){
			
			console.log('Exported instance synch info does not match the Seadragon info!');
			this.pSynchInfo.loadFromSeadragonInfo(this.pChannelList[0].sdInfo);
			
			// it must copy them to all of its channels
			for(var i = 0; i < this.pChannelList.length; i++){
				this.pChannelList[i].pSynchInfo.copy(this.pSynchInfo);
			}	
		}	
		
		// Load the ExportInfo
		this.pExportInfoSet.fromXML($node.children(C_EXPORT_INFO_NODE_NAME));		
	},
	toXML: function($node){
		var $n = null;
		if(($node.get(0).nodeName.toLowerCase() != C_EXPORTED_MOSAIC_NODE_NAME.toLowerCase()) 
			&& ($node.get(0).nodeName.toLowerCase() != C_EXPORTED_CARRIER_NODE_NAME.toLowerCase())
			&& ($node.get(0).nodeName.toLowerCase() != C_EXPORTED_IMAGE_NODE_NAME.toLowerCase())
			&& ($node.get(0).nodeName.toLowerCase() != C_EXPORTED_SESSION_NODE_NAME.toLowerCase())){
				if(this.ExportedInstanceType == TExportedInstanceType.Mosaic)
					$n = newXMLNode(C_EXPORTED_MOSAIC_NODE_NAME).appendTo($node);
				else if(this.ExportedInstanceType == TExportedInstanceType.SingleImage)
					$n = newXMLNode(C_EXPORTED_IMAGE_NODE_NAME ).appendTo($node);
				else if(this.ExportedInstanceType == TExportedInstanceType.Session)
					$n = newXMLNode(C_EXPORTED_SESSION_NODE_NAME ).appendTo($node);
				else if(this.ExportedInstanceType == TExportedInstanceType.Carrier)
					$n = newXMLNode(C_EXPORTED_CARRIER_NODE_NAME ).appendTo($node);
			}
		else
			$n = $node;
				
		this.pSynchInfo.toXML($n);		
		newXMLNode('Uid').appendTo($n).html(this.uid);
				
		// Save the channels
		$CHSN = newXMLNode(C_CHANNELS_NODE_NAME).appendTo($n);
		for(var i = 0; i < this.pChannelList.length; i++){
			this.pChannelList[i].toXML($CHSN);	
		}
		
		// added the export info
		$EINode = newXMLNode(C_EXPORT_INFO_NODE_NAME).appendTo($n);
		this.pExportInfoSet.toXML($EINode);		
	},
	getChannelCount: function(){
		return this.pChannelList.length;
	}
});

TExportedInstanceType = {Unknown:0, SingleImage:1, Mosaic:2, Session:3};


/*

Exported AcquiredData is a child of TExportedInstance.
For Atlas 5, this is Mosaic and Images.

*/

TExportedAcquiredData =  TExportedInstance.extend({																	
	init: function($node){
		this._super($node);		
	},
	fromXML: function($node){
		this._super($node);
	}, 
	toXML: function($node){
		this._super($node);	
	}
});

/*
	
  That defines the position of the export instances in the world.
	This is usefull to sync 2 data sets that have different pixel size, position, width and height.
	It can transform coordinates from the normalized Seadragon Space to the World Coordinates.
	
	The SynchInfo contains information about how to synchronize 
	2 differents channels.
	
		- ExportedPixelSize

*/
TSynchInfo = Class.extend({
	init: function(){
		this.bGetInfoFromExportInstance = false;
		this.center = new paper.Point(0,0);
		this.size = new paper.Size(1, 1);
		// map from SD normalized to the world.
		this.matrix = new paper.Matrix(1,0,0,1,0,0);
		this.transMat = new paper.Matrix(1,0,0,1,0,0);
		this.localMat = new paper.Matrix(1,0,0,1,0,0);
		this.localMat.reset();
		this.localMat.translate(-0.5, 0.5);
		this.scaleMat = new paper.Matrix(1,0,0,1,0,0);
		this.sizePix = new paper.Size(1,1);	
		this.updateMatrix();		
	},
	fromXML: function($node){
		if ($node == null) return false;
		if ($node == undefined) return false;
		this.dExportedPixelSize =  parseFloat($node.children('ExportedPixelSize').text());
		$bbNode = $node.find('BoundingBox');
		// This is to support the older file format.
		// Where the bounding box of the export was not store into the BoundingBox Node.
		if (($bbNode ==  null) || ($bbNode.length == 0)) {
			this.bGetInfoFromExportInstance = true;
			return false;
		}

		var minX = $bbNode.children('MinX').text();
		minX = parseFloat(minX);
		var minY = parseFloat($bbNode.children('MinY').text());
		var maxX = parseFloat($bbNode.children('MaxX').text());
		var maxY = parseFloat($bbNode.children('MaxY').text());
		
		this.center.x  = ( maxX + minX )/2; 
		this.center.y  = ( maxY + minY )/2; 
		this.size.width = (maxX - minX); 
		this.size.height = (maxY - minY); 
		this.updateMatrix();		
	}, 
	toXML: function($node){
		$n = newXMLNode(C_SYNCH_INFO_NODE_NAME).appendTo($node);
		$expN = newXMLNode('ExportedPixelSize').appendTo($n);
		$expN.text(this.getExportedPixelSize());		
		$BBNode =  newXMLNode('BoundingBox').appendTo($n);
		$n = newXMLNode('MinX').appendTo($BBNode);
	  $n.text(this.center.x - (this.size.width/2));
		$n = newXMLNode('MinY').appendTo($BBNode);
	  $n.text(this.center.y - (this.size.height/2));
		$n = newXMLNode('MaxX').appendTo($BBNode);
	  $n.text(this.center.x + (this.size.width/2));
		$n = newXMLNode('MaxY').appendTo($BBNode);
	  $n.text(this.center.y + (this.size.height/2));		
	},
	loadFromExportedInstance: function($node){
		var minX = parseFloat($node.children('MinX').text());
		var minY = parseFloat($node.children('MinY').text());
		var maxX = parseFloat($node.children('MaxX').text());
		var maxY = parseFloat($node.children('MaxY').text());
		
		this.center.x  = ( maxX + minX )/2; 
		this.center.y  = ( maxY + minY )/2; 
		this.size.width = (maxX - minX); 
		this.size.height = (maxY - minY); 
		this.updateMatrix();		
	},
	loadFromSeadragonInfo: function(pSDInfo){
		this.center.x = 0; 
		this.center.y = 0; 
		this.size.width = pSDInfo.totalWidth * this.getExportedPixelSize(); 
		this.size.height =  pSDInfo.totalHeight * this.getExportedPixelSize(); 
	},	
	copy: function(pSource){
		if(pSource == undefined)
			return false;
		this.dExportedPixelSize = pSource.dExportedPixelSize;	
		this.center.x = pSource.center.x;
		this.center.y = pSource.center.y;
		this.size.width = pSource.size.width;
		this.size.height = pSource.size.height;
		this.updateMatrix();
	},
	setSizeInPixel: function(wpx,hpx){
		this.sizePix.width = wpx;
		this.sizePix.height = hpx;	
		this.updateMatrix();
	},
	updateMatrix : function(){
		this.transMat = new paper.Matrix(1,0,0,1,this.center.x, this.center.y);
		this.scaleMat = new paper.Matrix(this.size.width,0,0,this.size.height,0,0);
		this.localMat.reset();		
		this.localMat.translate(-0.5, 0.5);		
		this.localMat.scale(1, -(this.sizePix.width/this.sizePix.height));
		
		this.matrix.reset();
		this.matrix = this.matrix.concatenate(this.transMat);
	},
	isValid: function(){
		var result = true;
		result = result && (!isNaN(this.center.x));
		result = result && (!isNaN(this.center.y));
		result = result && (!isNaN(this.size.width));
		result = result && (!isNaN(this.size.height));
		return result;
	},
	
	/*
	When export with 5.0.48, the bounding box is not valid.
	Therefore, we need to check if the synch info is consistent with the SeadDragon info
	Mainly if the number of pixel times the pixel size has the same width & height as
	the bounding box.
	The 1 µm criteria is pretty abritrary.  
	*/
	
	isConsistantWithSDInfo: function(pSDInfo){
		var dW = pSDInfo.totalWidth * this.getExportedPixelSize()
		var dH = pSDInfo.totalHeight * this.getExportedPixelSize()
		
		if ((Math.abs(dW - this.size.width) > 1)
			||(Math.abs(dH - this.size.height) > 1)) return false;
		return true;		
	},
	toWorldRect: function(pSDNormRect){
		pWorldRect = new Seadragon.Rect(0,0,0,0);
		var pt2 = new paper.Point(pSDNormRect.x, pSDNormRect.y);
		pt2 = this.toWorld(pt2);
		var ptSize = new paper.Point(pSDNormRect.width, pSDNormRect.height);
		ptSize = this.toWorldSize(ptSize);
		pWorldRect.x = pt2.x;
		pWorldRect.y = pt2.y;
		pWorldRect.width = ptSize.x;
		pWorldRect.height = ptSize.y;		
		return pWorldRect;
	},
	toNormRect: function(pWorldRect){
		pNormRect = new Seadragon.Rect(0,0,0,0);
		var pt2 = new paper.Point(pWorldRect.x, pWorldRect.y);
		pt2 = this.toNorm(pt2);
		var ptSize = new paper.Point(pWorldRect.width, pWorldRect.height);
		ptSize = this.toNormSize(ptSize);
		pNormRect.x = pt2.x;
		pNormRect.y = pt2.y;
		pNormRect.width = ptSize.x;
		pNormRect.height = ptSize.y;		
		return pNormRect;		
	},
	toWorldSize : function(pSize){
		var pZero = new paper.Point(0, 0);
		pZero = this.toWorld(pZero);
		pSize = this.toWorld(pSize);
		return new paper.Point(Math.abs(pSize.x - pZero.x), Math.abs(pSize.y - pZero.y));
	},
	getExportedPixelSize: function(){
		return this.dExportedPixelSize;	
	},
	setExportedPixelSize: function(fPS){
	//	this.sizePix = new paper.Size(fPS,fPS);
	//	this.updateMatrix();
	//	this.dExportedPixelSize = fPS;
	},
	toNormSize : function(pSize){
		var pZero = new paper.Point(0, 0);
		pZero = this.toNorm(pZero);
		pSize = this.toNorm(pSize);
		return new paper.Point(Math.abs(pSize.x - pZero.x), Math.abs(pSize.y - pZero.y));
	},
	toWorld: function(pt){
		pt2 = new paper.Point(pt.x, pt.y);
		var tempPt = this.localMat.transform(pt2);
		var tempPt2 = this.scaleMat.transform(tempPt);
		var tempPt3 = this.transMat.transform(tempPt2);
		return tempPt3;
		//return this.matrix.transform(pt);
	},
	toNorm2: function(pt){
		pt2 = new paper.Point(pt.x, pt.y);
		return this.localMat.transform(pt2);
	},
	toNorm: function(pt){
		var pt2 = this.transMat.inverseTransform(pt);
		pt2 = this.scaleMat.inverseTransform(pt2);
		pt2 = this.localMat.inverseTransform(pt2);
		return pt2;	
	}
});


/*

	An AtlasViewport will be created for each TChannelInfo object.
	It contains the needed information about the Seadragon 
	and some extra meta data like detectors info.

*/

TChannelInfo = Class.extend({
	init: function(aNode, pParentSynchInfo){		

		this.sdInfo = new TSeadragonInfo(0, 0, 'jpg', 0, 0);
		this.pExportInfoSet = new TExportInfoSet();																						 
		//this.pCustomImageInfo = new Array();		
		this.isVisible = true;
		this.filename = '';
		this.sAlias = '';		
		this.detectorInfo = new TDetectorInfo($(aNode).find('Detector')[0]);		
		this.uid = guid();
		this.pSynchInfo = new TSynchInfo();			
		
		this.fromXML(aNode);
		if(this.sAlias == ''){
			this.sAlias = this.detectorInfo.DetectorName;
		}		
		// if the detector is empty, just call it unknown.
		if(this.sAlias == ''){
			this.sAlias = 'Unknown';	
		}	
		
		this.pSynchInfo.copy(pParentSynchInfo);		
		this.pSynchInfo.setSizeInPixel(this.sdInfo.totalWidth, this.sdInfo.totalHeight);		
	
		if(isNaN(this.pSynchInfo.getExportedPixelSize())){
			try{
				ps = this.pExportInfoSet.exportPixelSize	
				this.pSynchInfo.setExportedPixelSize(ps);
			}
			catch(e){
				jAlert(e);
			}
		}		
		
		if(this.uid == undefined)  
		 	throw 'The exported data must have a UID.';
	},
	fromXML: function(aNode){
		var me = this;
		this.filename = $(aNode).find('Filename').text();
		this.sAlias = $(aNode).find('Alias').text();		
		this.seadragonNode = $(aNode).find('SeadragonInfo');
		this.sdInfo.fromXML(this.seadragonNode);
		this.uid = $(aNode).find('Uid').text();
		if (this.uid == '')
			this.uid = guid();
		
		this.pExportInfoSet.fromXML($(aNode).find(C_EXPORT_INFO_NODE_NAME));			
		
		 if(isNaN(this.pSynchInfo.getExportedPixelSize())){
			var ExportI =  $(aNode).find('ExportInfo');
			if (ExportI != undefined) 
				var ps = parseFloat(ExportI.find('ExportedPixelSize').text());
				this.pSynchInfo.setExportedPixelSize(ps);		
		}
	},
	toXML: function(aNode){
		var channelNode = newXMLNode(C_CHANNEL_NODE_NAME).appendTo(aNode);		
		channelNode.append(newXMLNode('Uid').html(this.uid));
		channelNode.append(newXMLNode('Alias').html(this.sAlias));
		channelNode.append(newXMLNode('Filename').html(this.filename));		
		this.sdInfo.toXML(channelNode);
		$(channelNode).append(newXMLNode('ExportInfo'));		
		this.pExportInfoSet.toXML($(channelNode).find(C_EXPORT_INFO_NODE_NAME));
		this.detectorInfo.toXML(channelNode);	
	}
});

TSeadragonInfo = Class.extend({
		init: function(tileSize, overlap, format, totalWidth, totalHeight){
			this.tileSize = tileSize;
			this.overlap = overlap;
			this.format = format;
			this.totalWidth = totalWidth;
			this.totalHeight = totalHeight;
		},
		toXML: function(aNode){
			$sdNode = newXMLNode('SeadragonInfo').appendTo(aNode);
			$imgNode = newXMLNode('Image').attr({'TileSize':this.tileSize, 
																					 'Overlap': this.overlap,
																					 'Format': this.format,
																					 'xmlns': 'http://schemas.microsoft.com/deepzoom/2008'});	
			$imgNode.appendTo($sdNode);
			$imgNode.append(newXMLNode('Size').attr({'xmlns':'', 
																							'Width': this.totalWidth,
																							'Height': this.totalHeight}));
		},
		fromXML: function(aNode){
			$imgNode = aNode.find('Image');
			this.tileSize = parseFloat($imgNode.attr('TileSize'));
			this.overlap = parseFloat($imgNode.attr('Overlap'));
			this.format = ($imgNode.attr('Format'));
			this.totalWidth = parseFloat($imgNode.find('Size').attr('Width'));
			this.totalHeight = parseFloat($imgNode.find('Size').attr('Height'));
		}
});


TDetectorInfo = Class.extend({
	init: function(aNode){
		this.DetectorName = $(aNode).find('DetectorName').text();
		this.brightness = parseFloat($(aNode).find('Brightness').text());
		this.contrast = parseFloat($(aNode).find('Contrast').text());
	}, 
	toXML: function(aNode){
		$dNode = newXMLNode('Detector').appendTo(aNode);	
		$dNode.append(newXMLNode('DetectorName').html(this.DetectorName));
		$dNode.append(newXMLNode('Brightness').html(this.brightness));
		$dNode.append(newXMLNode('Contrast').html(this.contrast));
	}
});

/*********************************
*
*		Takes a node and extract the info from it
*		the xml node should have this structure
*			<Info caption='' units='' value='' precision=''>
*
*		Its parent node must be <ExportInfo>
*
*
**********************************/

TExportInfoItem = Class.extend({	
	init: function (xmlNode){	
		this.nodeName = xmlNode.nodeName;
		
		if(this.units == undefined){
			this.units = ''; 
		}
		this.fromXML(xmlNode);
	},
	// add a line to a given table
	appendTo: function($table){
		var	$tr	= $('<tr></tr>').appendTo($table).addClass('miInfoRow');
		$tr.append($('<td></td>').html(this.caption).addClass('miInfoCaption'));
		if(this.precision != undefined)
			$tr.append($('<td></td>').html(this.value.toFixed(this.precision) + ' ' + this.units).addClass('miInfoValue'));
		else
			$tr.append($('<td></td>').html(this.value).addClass('miInfoValue'));
		$tr.find('.miInfoValue').append($('<span/>').html(this.units).addClass('miInfoUnits'));
	},
	getValueStr: function(){		
		if(this.precision != undefined)
			return this.value.toFixed(this.precision) + ' ' + this.units;
		else
			return this.value + ' ' + this.units;	
	},
	fromXML: function(aNode){
		this.caption = $(aNode).attr('caption');
		if(this.caption == undefined) this.caption = $(aNode).attr('Caption');
		this.units = $(aNode).attr('units');
		if(this.units == undefined) this.units = $(aNode).attr('Units');
		this.value = $(aNode).attr('value');
		if(this.value == undefined) this.value = $(aNode).attr('Value');
		this.precision = $(aNode).attr('precision');
		if(this.precision == undefined) this.precision = $(aNode).attr('Precision');		
	},
	toXML: function(aNode){
		n = newXMLNode(this.nodeName).appendTo(aNode);
		n.attr({'caption': this.caption,
					 		'units': this.units,
							'value': this.value,
							'precision': this.precision});
	}
});

/*********************************
*
*		Information about a given image that 
*		is not of interest at an application wise level.
*		Holds a list of TExportInfoItem.
*   Each Node <ExportInfo> should create a TExportInfoSet
*		Right now it can be at the ExportedInstance Level (in a <Mosaic>, <Image>, <Session>)
*		It can also be in the <Channel>
*		
**********************************/

TExportInfoSet = Class.extend({
	init: function (){ 
		this.infoList = new Array();		
	},
	toXML: function($n){
		//	$n = newXMLNode(C_IMAGE_EXPORT_INFO_NODE_NAME);
		for(var i = 0; i < this.infoList.length; i++){
				this.infoList[i].toXML($n);	
		}		
	}, 
	fromXML: function($node){
		// all the child of the xmlnode is an item to add to the list.
		var me = this;
		var i = 0;
		$node.children().each(function(){
			me.infoList.push(new TExportInfoItem(this));	
		});
	}
});