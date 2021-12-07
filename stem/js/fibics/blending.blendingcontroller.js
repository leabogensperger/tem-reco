// JavaScript Document
TBlendingController = Class.extend({
	init: function(pAppCTRL, canvasBlender){
		var me = this;
		if((pAppCTRL == null) || (pAppCTRL == undefined)) {
			throw 'The Viewport controller for the Blending Controller cannot be undefined.';
		}
		if((canvasBlender == null) || (canvasBlender == undefined)) {
			throw 'The Canvas Blender for the Blending Controller cannot be undefined.';
		}
		this.pAppCTRL = pAppCTRL;

		//Register to the onLoadFinalize.
		$(this.pAppCTRL).on('onFinalizeLoad', function(){
			me.initBlendInfo();
		});

		this.canvasBlender = canvasBlender;
		this.blendingInfos = new Array();
	},
	addBlendingInfo: function(anBOpt){
		if(this.blendingInfos.length == 5){
			jAlert('The maximum number of channels to be blended is 5.');
			return false;
		}
		this.blendingInfos.push(anBOpt);
		$(this).trigger('addBlendingInfoCB', [this, anBOpt]);
	},
	deleteBlendingInfo: function(anBOpt){
		$(this).trigger('deleteBlendingInfoCB', [this, anBOpt]);
		this.blendingInfos.removeItem(anBOpt);
	},
	blend: function(){
		this.populateCanvasOfInfo();
		this.canvasBlender.blend(this.blendingInfos);
		$(this).trigger('onBlend', [this]);
	},
	populateCanvasOfInfo: function(){
		for(var i = 0; i < this.blendingInfos.length; i++){
			this.blendingInfos[i].canvas = this.pAppCTRL.ATLASViewportController.ATLASViewportList[this.blendingInfos[i].signal].sdViewer.viewport.canvas;
		}
	},
	getBlendingInfoByID: function(uid){
		for(var i = 0; i < this.blendingInfos.length; i++){
			if(this.blendingInfos[i].uid == uid){
				return this.blendingInfos[i];
			}
		}
		return null;
	},
	// Will generate a default blend so that when the user show the blending form, it will be sometheing there.
	initBlendInfo: function(){
		if (this.pAppCTRL == null) return false;
		if (this.pAppCTRL.project.getChannelCount() < 2) return false;
		var pC = null;
		// generate only 2 blend info
		for(var idx = 0; idx < 2; idx++){
			pC = this.pAppCTRL.project.getChannel(idx);
			var pBI = new TAtlasBlendingInfo();
			pBI.signal = idx;
			this.addBlendingInfo(pBI);
		}
	}
});
