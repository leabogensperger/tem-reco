// JavaScript Document

TWorldCoordsPanel = Class.extend({		
	init: function(pAVP){
		loadCSS('css/worldcoordspanel.css');	
		this.pAVP = pAVP;		
	},
	update: function(){
		this.$mousePx.html(this.pAVP.mousePos.x + ', ' + this.pAVP.mousePos.y);
		var pNPt = this.pAVP.SDConverter.pointFromPixel(this.pAVP.mousePos);
		this.$normPos.html(pNPt.x.toFixed(4) + ', ' + pNPt.y.toFixed(4));
		var pWPt = this.pAVP.pChannelInfo.pSynchInfo.toWorld(pNPt);
		this.$worldPos.html(pWPt.x.toFixed(1) + ', ' + pWPt.y.toFixed(1));
		var pWPt = this.pAVP.pChannelInfo.pSynchInfo.toNorm2(pNPt);
		this.$normPos2.html(pWPt.x.toFixed(4) + ', ' + pWPt.y.toFixed(4));		
		var normRect = this.pAVP.getNormalizedRect();
		var worldRect = this.pAVP.pChannelInfo.pSynchInfo.toWorldRect(normRect);
		this.$worldRect.html('XY:' +  worldRect.x.toFixed(1) + ',' +  worldRect.y.toFixed(1));
		this.$worldRect.html(this.$worldRect.html() +  '<br />WH:' +  worldRect.width.toFixed(1) + ',' +  worldRect.height.toFixed(1));		
		this.$normRect.html('XY:' +  normRect.x.toFixed(1) + ',' +  normRect.y.toFixed(1));
		this.$normRect.html(this.$normRect.html() +  '<br />WH:' +  normRect.width.toFixed(1) + ',' +  normRect.height.toFixed(1));		
		var normRect2 = this.pAVP.pChannelInfo.pSynchInfo.toNormRect(worldRect);
		this.$normRect2.html('XY:' +  normRect2.x.toFixed(1) + ',' +  normRect2.y.toFixed(1));
		this.$normRect2.html(this.$normRect2.html() +  '<br />WH:' +  normRect2.width.toFixed(1) + ',' +  normRect2.height.toFixed(1));		
		
		//;
	},
	buildHTML: function(){
		this.$e = $("<div/>").addClass('WorldCoordsPanel');		
		this.$mousePx = $("<div/>").attr('id', 'AVPMousePosition');
		this.$mousePx.appendTo(this.$e);
		this.$normPos = $("<div/>").attr('id', 'AVPNormalizedPos');
		this.$normPos.appendTo(this.$e);		
		this.$worldPos = $("<div/>").attr('id', 'AVPWorldPos');
		this.$worldPos.appendTo(this.$e);		
		this.$normPos2 = $("<div/>").attr('id', 'AVPNormalizedPos2');
		this.$normPos2.appendTo(this.$e);	
		this.$worldRect = $("<div/>").attr('id', 'WorldRect');
		this.$worldRect.appendTo(this.$e);
		this.$normRect = $("<div/>").attr('id', 'NormRect');
		this.$normRect.appendTo(this.$e);	
		this.$normRect2 = $("<div/>").attr('id', 'NormRect2');
		this.$normRect2.appendTo(this.$e);	
		
		this.pAVP.$e.append(this.$e);
	}
});