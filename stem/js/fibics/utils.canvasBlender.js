/************************************************
*
*	This canvas blender is used to blend several
*	Canvas together onto a destination canvas.
*
*************************************************/

// JavaScript Document
TCanvasBlender = Class.extend({
	init: function(destCanvas){
		this.destCanvas = $("<canvas></canvas>").get(0);
		this.destCanvas.width = 400;
		this.destCanvas.height = 400;

		this.sourceList = new Array();
		this.blendOpacity = 1;
		this.blendingMode = 'overlay';
	//	this.blendingOpts = new Array();
		if(this.destCanvas != undefined)
			this.ctx2d = this.destCanvas.getContext('2d');
	},
	setWidth: function(w){
		this.destCanvas.width = w;
	},
	setDimension: function(w, h){
		this.destCanvas.width = w;
		this.destCanvas.height = h;
	},
	getAspectRatio: function(){
		if (this.destCanvas.height != 0)
		return this.destCanvas.width/this.destCanvas.height;
	},
	setDestCanvas: function(C){
		if(C == undefined) return false;
		this.destCanvas = C;
		this.ctx2d = this.destCanvas.getContext('2d');
	},
	getFitCanvasSize: function() {
		var vpAspR = 1;
		if (G_APPLICATION_CTRL.ATLASViewportController.ATLASViewportList.length > 0){
			var vpW = G_APPLICATION_CTRL.ATLASViewportController.ATLASViewportList[0].getDisplayDim().width;
			var vpH = G_APPLICATION_CTRL.ATLASViewportController.ATLASViewportList[0].getDisplayDim().height;
			vpAspR = vpW/vpH;
		}
		var bh = $(window).height() * .5;
		var bw = bh * vpAspR;
		return {w:bw,h:bh};
	},
	/*
	addBlendingOpt: function(pBOpt){
	this.blendingOpts.push(pBOpt);
	},
	*/
	blend: function(bInfos){
		if(this.destCanvas == undefined) return false;
		if(bInfos.length == 0) return false;
		// clean the canvas
		this.ctx2d.globalCompositeOperation = 'source-over';
		this.ctx2d.globalAlpha = 1;
		src = bInfos[0].canvas;
		this.ctx2d.clearRect(0,0, this.destCanvas.width, this.destCanvas.height);

		if (G_DEBUG) {
			// make sure the destination canvas has the same dimensions as the source
			console.log("destCanvas srcW-H: "+src.width+" | "+src.height);
			//this.setDimension(src.width, src.height);
		}


		var fitSize = this.getFitCanvasSize();
		this.setDimension(fitSize.w, fitSize.h);


		this.ctx2d.drawImage(src, 0, 0, src.width, src.height, 0, 0, this.destCanvas.width, this.destCanvas.height);
		var operandLog = '';
		var i = 1;
		while (i < bInfos.length){
			if(!bInfos[i].visible) {
				i++;
				continue;
			}
			src = bInfos[i].canvas;
			this.ctx2d.globalCompositeOperation =  bInfos[i].blendingMode;
			if (this.ctx2d.globalCompositeOperation !=  bInfos[i].blendingMode)
				console.log(bInfos[i].blendingMode + ' blending mode is not supported');

			this.ctx2d.globalAlpha = bInfos[i].strength;
			this.ctx2d.drawImage(src, 0, 0, src.width, src.height, 0, 0, this.destCanvas.width, this.destCanvas.height);
			i++;
		}
	}
});
