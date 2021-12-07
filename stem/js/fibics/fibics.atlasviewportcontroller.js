// Global Default Value
DEFAULT_MAGNIFICATION_MODE = 'screen';// screen or polaroid


TATLASViewportController =  TBaseController.extend({
	init: function (pAppC){
		this._super();
		this.ATLASViewportList = new Array();
		this.animationStartVP = null;
		this.activeVP = null;
		this.displayMode = 'continuum';//'synch';   // 'continuum' is the other mode.
		this.displayMode = 'synch';
		this.displayLayout = 'side'; // 'stack', 'side' is the other value;
		this.displayDim = new Seadragon.Rect(0,0,0,0);
		this.$e = $('#MasterATLASViewportCTNR').appendTo($('body'));
		var avc = this;
		this.pAppC = pAppC;
		this.measurementController = pAppC.measurementController;
		this.waypointController = pAppC.waypointController;
		this.initATLASViewportDraw();
		this.mouseIn = false;
		this.magnificationMode = DEFAULT_MAGNIFICATION_MODE;
		this.didAnimationFinish = false;
		this.didAnimationStart = false;
		this.scaleBar = new THTMLScaleBar(this);
		this.$e.append(this.scaleBar.$e);
	},
	createATLASViewport : function(DOMid, pImgInfo){
		var me = this;
		this.$e.append($('<div></div>').addClass('ATLASViewport').attr('id', DOMid));
		avp = new TATLASViewport(DOMid, pImgInfo, this.pAppC);
		// here we make sure that everything is ready when
		//  we add to the list of viewport of the controller.
		//  this is because some object who register on the callback "OnAddViewport" needs to have then
		//  viewport & source ready.
		$(avp).on('onLoad', function(e, pAVP){
			me.addATLASViewport(pAVP);
			me.fitViewportSize();
		});
		return avp;
	},
	setDisplayDim: function(w,h){
		this.displayDim.width = w;
		this.displayDim.height = h;
		this.$e.width(w);
		this.$e.height(h);
		this.fitViewportSize();
		$(this).trigger('changeSize', [this]);

	},
	setCenter: function(umPt,immediately=false){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].setCenter(umPt,immediately);
			i++;
		}
	},
	setMode: function(aMode){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].setMode(aMode);
			i++;
		}
	},
	getMinImageScale : function(){
		var i = 0;
		var theMin = 0;
		while(i < this.ATLASViewportList.length){
			theMin = Math.max(this.ATLASViewportList[i].getMinImageScale(), theMin);
			i++;
		}
		return theMin;
	},
	getZoomLevel: function(){
		if(this.ATLASViewportList.length > 0)
			return this.getFirstVisibleViewport().getZoomLevel();
		return 0;
	},
	panTo : function(pt){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].panTo(pt);
			i++;
		}
	},
	getCenterUm : function(){
		if(this.ATLASViewportList.length > 0)
			return this.getFirstVisibleViewport().getCenterUm();
	},
	getCenter : function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null){
			var bb = avp.sdViewer.viewport.getBounds();
			return new Seadragon.Point(bb.x + (bb.width/2), bb.y + (bb.height/2));
		}
	},
	setDisplayLayout: function(DM){
		if((DM != 'stack') && (DM != 'side')){
			jAlert('Unknown "' +  DM + '" display mode.');
		}
		var avpc = this;
		//if(this.displayLayout == DM) return false;
		if(this.displayLayout != DM){
			this.$e.fadeOut(200, function(){
				avpc.fitViewportSize();
				avpc.$e.fadeIn(200);
			});
		}
		else {
			avpc.fitViewportSize();
		}
		this.displayLayout = DM;
	},
	setDisplayMode: function(dM){
		if (this.displayMode == dM) return false;

		this.displayMode = dM;
		var pAVP = this.getFirstVisibleViewport();
		var pB = pAVP.getBoundsUm();
		// here if the mode is continuum,
		if(this.displayMode == 'continuum'){
			if (this.displayLayout == 'side')
				pB.x = pB.x - (pB.width*(this.getVisibleViewportCount() -1)/2);
			else
				pB.y = pB.y - (pB.height*(this.getVisibleViewportCount() -1)/2);
		}
		else{
			if (this.displayLayout == 'side')
				pB.x = pB.x + (pB.width*(this.getVisibleViewportCount() -1)/2);
			else
				pB.y = pB.y + (pB.height*(this.getVisibleViewportCount() -1)/2);
		}

		pAVP.setBoundsUm(pB);
		this.animationStartVP = pAVP;
		this.synchViewports(pAVP);
	},
	getATLASViewportWithID : function(id){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			if(this.ATLASViewportList[i].id == id)
				return this.ATLASViewportList[i];
			i++;
		}
	},
	getFirstVisibleViewport: function(){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			if(this.ATLASViewportList[i].pChannelInfo.isVisible)
				return this.ATLASViewportList[i];
			i++;
		}
	},
	setActiveViewport: function(aVP){
		this.activeVP = aVP;

		// here the minZoomRatio of Seadragon must be changed to accommodate the smallest
		this.updateMaxZoom(this.activeVP);
		this.updateMinZoom(this.activeVP);

	},
	addATLASViewport : function(avp){
		this.ATLASViewportList.push(avp);
		avp.iVPIndex = this.ATLASViewportList.length - 1;

		var me = this;

		// make sure all the callbacks are registered.
		avp.$e.mouseenter(function(){
			me.setActiveViewport(me.getATLASViewportWithID(parseFloat($(this).attr('ViewportID'))));
		});

		avp.$e.on(TouchMouseEvent.MOVE, function(e){
			$(me).trigger(TouchMouseEvent.MOVE, e);
		});

		$(avp.canvas).mouseenter(function(e){
			if(e.buttons != 1)
				me.setActiveViewport(me.getATLASViewportWithID(parseFloat($(this).attr('ViewportID'))));
		});

		$(avp.canvas).on(TouchMouseEvent.DOWN, function(){
			me.setActiveViewport(me.getATLASViewportWithID(parseFloat($(this).attr('ViewportID'))));
		});

		$(avp.canvas).on(TouchMouseEvent.MOVE, function(e){
			$(me).trigger(TouchMouseEvent.MOVE, e);
		});

		avp.sdViewer.addEventListener("animationfinish", function(sdV){
			if (!sdV.isVisible()) return false;
			//me.animationStartVP = null;
			me.fireATLASViewportAnimationFinish();
		});

		avp.sdViewer.addEventListener("animationstart", function(sdV){
			if (!sdV.isVisible()) return false;
			var aniVP =  me.getATLASViewportWithID(parseFloat($(sdV.elmt.offsetParent).attr('ViewportID')));
			if( aniVP == me.activeVP)
			me.animationStartVP = aniVP;
			me.fireATLASViewportAnimationStart();
		});

		avp.sdViewer.addEventListener("animation", function(/*e,*/ theVP){
			if (!theVP.isVisible()) return false;
			me.onATLASViewportAnimate(theVP);
		});

		// Trigger the on Animate when loading the mosaic so that everything is updated properly...
		avp.sdViewer.addEventListener("open", function(e, theVP){
			me.onATLASViewportAnimate(e);
		});

		$(this).trigger('onAddATLASViewport', avp);
	},
	onATLASViewportAnimate: function(sd){
		var i = 0;
		var avpid = parseFloat($(sd.elmt.parentNode).attr('ViewportID'));
		var avp = this.getATLASViewportWithID(avpid);
		if(this.activeVP == null)
			this.setActiveViewport(avp);

		if(!this.activeVP.loaded) return null;
		if(!this.activeVP.sdViewer.isVisible()) return null;

		var r = this.activeVP.getNormalizedRect();
		if((this.animationStartVP == null) ||((this.animationStartVP != null)
					&&( this.animationStartVP.id != avp.id))) return false;
		this.synchViewports(this.animationStartVP);
		this.scaleBar.draw();
		$(this).trigger('onChange', this);
	},
	synchViewports: function(pSourceVP){
		if (this.displayMode == 'synch'){
			var worldRec = pSourceVP.pChannelInfo.pSynchInfo.toWorldRect(pSourceVP.sdViewer.viewport.getBounds(true));
			var normRect = null;
			for(var idx = 0; idx < this.ATLASViewportList.length; idx++){
				// don't sync if it the current viewport.
				if(this.animationStartVP == this.ATLASViewportList[idx]) continue;
				if(!this.ATLASViewportList[idx].loaded) continue;
				normRect =  this.ATLASViewportList[idx].pChannelInfo.pSynchInfo.toNormRect(worldRec);
				this.ATLASViewportList[idx].setNormalizedRect(normRect);
			}
		}
		else{
			var worldRec = pSourceVP.pChannelInfo.pSynchInfo.toWorldRect(pSourceVP.sdViewer.viewport.getBounds(true));
			var jVisibleIdx = 0;
			for(var idx = 0; idx < this.ATLASViewportList.length; idx++){
				if(!this.ATLASViewportList[idx].visible) continue;
				// which slot is it in the visible VP list.
				if (this.ATLASViewportList[idx].id == pSourceVP.id){
					break;
				}
				jVisibleIdx++;
			}
			if (this.displayLayout == 'side')
				worldRec.x = worldRec.x - (worldRec.width * jVisibleIdx);
			else
				worldRec.y = worldRec.y + (worldRec.height * jVisibleIdx);

			for(var idx = 0; idx < this.ATLASViewportList.length; idx++){
				if(this.animationStartVP == this.ATLASViewportList[idx]){
					if (this.displayLayout == 'side')
						worldRec.x = worldRec.x + worldRec.width;
					else
						worldRec.y = worldRec.y - worldRec.height;
					continue;
				}
				if(!this.ATLASViewportList[idx].loaded) continue;
				if(!this.ATLASViewportList[idx].visible) continue
				normRect =  this.ATLASViewportList[idx].pChannelInfo.pSynchInfo.toNormRect(worldRec);
				this.ATLASViewportList[idx].setNormalizedRect(normRect);
				if (this.displayLayout == 'side')
						worldRec.x = worldRec.x + worldRec.width;
					else
						worldRec.y = worldRec.y - worldRec.height;
			}
		}
	},
	updateMaxZoom: function(pActiveVP){
		// change the global Seadragon.Config.maxZoomPixelRatio so that you will be able to zoom in as much as the max pixel size of any viewport.
		fMinPixelSize = this.getMinExportedPixelSize();
		Seadragon.Config.maxZoomPixelRatio = pActiveVP.pChannelInfo.pSynchInfo.getExportedPixelSize()/fMinPixelSize;
	},
	updateMinZoom: function(pActiveVP){
		// change the global Seadragon.Config.maxZoomPixelRatio so that you will be able to zoom in as much as the max pixel size of any viewport.
		fMaxPixelSize = this.getMaxExportedPixelSize();
		Seadragon.Config.minZoomImageRatio = pActiveVP.pChannelInfo.pSynchInfo.getExportedPixelSize()/fMaxPixelSize;
	},
	fireATLASViewportAnimationFinish: function(){
		if(!this.didAnimationFinish){
			$(this).trigger('animationfinishVPC');
			this.didAnimationStart = false;
			this.didAnimationFinish = true;
		}
	},
	fireATLASViewportAnimationStart: function(){
		if(!this.didAnimationStart){
			$(this).trigger('animationstartVPC');
			this.didAnimationStart = true;
			this.didAnimationFinish = false;
		}
	},
	getImageScale: function(){
		if(this.ATLASViewportList.length > 0)
			return this.getFirstVisibleViewport().getImageScale();
	},
	getScreenMagnification : function(){
		if(this.screenDPItomm <= 0) return 0;
		var vp = this.getFirstVisibleViewport();
		var screenSizemm = (vp.sdViewer.viewport.getContainerSize().x/G_PIXELTOMM);
		var vpFOVum = vp.getFOVDim();
		var xMag = 1E3 * screenSizemm / vpFOVum.width; //(vp.sdViewer.viewport.getBounds().getSize().x*(vp.pChannelInfo.pSynchInfo.getExportedPixelSize()*vp.sdViewer.source.dimensions.x)*0.001);
		return xMag;
	},
	getPolaroidMagnification : function(){
		var vp = this.getFirstVisibleViewport();
		return vp.getPolaroidMagnification();
	},
	setMagnification : function(aMag){
		var i = 0;
		aMag = parseFloat(aMag);
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].setMagnification(aMag, this.magnificationMode);
			i++;
		}
	},
	getMagnification : function(){
		if(this.ATLASViewportList.length == 0) return 0;
		if(this.magnificationMode == 'screen') return this.getScreenMagnification();
		if(this.magnificationMode == 'polaroid') return this.getPolaroidMagnification();
	},
	isMagCalibrated : function(){
		if(G_PIXELTOMM <= 0)
			return false;
		else
			return true;
	},
	getPixelSize: function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getPixelSize();
	},
	setPixelSize: function(ps){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].setPixelSize(ps);
			i++;
		}
	},
	getBoundsUm: function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getBoundsUm();
	},
	getBounds: function(){
		if(this.ATLASViewportList.length > 0){
			if(this.getFirstVisibleViewport().sdViewer.viewport != null)
				return this.getFirstVisibleViewport().sdViewer.viewport.getBounds();
		}
	},
	getDisplayDim: function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getDisplayDim();
	},
	setImageWidth: function(aW){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].setImageWidth(aW);
			i++;
		}
	},
	getMinExportedPixelSize: function(){
		var minPx = 1E10
		for(var idx = 0; idx < this.ATLASViewportList.length; idx++){
			minPx = Math.min(minPx, this.ATLASViewportList[idx].pChannelInfo.pSynchInfo.getExportedPixelSize());
		}
		return minPx;
	},
	getMaxExportedPixelSize: function(){
		var maxPx = 1E-10
		for(var idx = 0; idx < this.ATLASViewportList.length; idx++){
			maxPx = Math.max(maxPx, this.ATLASViewportList[idx].pChannelInfo.pSynchInfo.getExportedPixelSize());
		}
		return maxPx;
	},
	getMinPixelSize: function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getMinPixelSize();
	},
	getMaxPixelSize: function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getMaxPixelSize();
	},
	getMaxFOVExtension : function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getMaxFOVExtension();
	},
	getMinFOVExtension : function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getMinFOVExtension();
	},
	getMaxMagnification : function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getMaxMagnification(this.magnificationMode);
	},
	getMinMagnification : function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getMinMagnification(this.magnificationMode);
	},
	getMaxMeasurementLength : function(){
		if(this.ATLASViewportList.length > 0)
			return 3*this.getFirstVisibleViewport().sdViewer.source.dimensions.x*this.pixelSize;
	},
	getMaxMeasurementWidth : function(){
		if(this.ATLASViewportList.length > 0)
			return 3*this.getFirstVisibleViewport().sdViewer.source.dimensions.x*this.pixelSize;
	},
	getMaxMeasurementHeight : function(){
		if(this.ATLASViewportList.length > 0)
			return 3*this.getFirstVisibleViewport().sdViewer.source.dimensions.y*this.pixelSize;
	},
	getImageScale : function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getImageScale();
	},
	setImageScale : function(v){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].setImageScale(v);
			i++;
		}
	},
	getFOVDim: function(){
		var avp = this.getFirstVisibleViewport();
		if(avp != null)
			return avp.getFOVDim();
	},
	resizeViewports : function(maxW, maxH){
		this.displayDim.width = maxW;
		this.displayDim.height = maxH;
		this.$e.width(maxW);
		this.$e.height(maxH);
		this.fitViewportSize();
	},
	setViewMaxZoom: function() {
		var cs = this.getImageScale();
		var ms = this.getMinImageScale();
		var ds = Math.abs(ms-cs);
		if (ds < 0.00000000000001) {
			this.fitToView(true);
			this.setCenter(this.getCenterUm(),true);
		}
		this.setImageScale(100);
		this.setImageScale(100,true);
	},
	// make sure that the entire image fits in the viewport.
	fitToView: function(immediately=false){
		var pC = this.pAppC.project.getLargestExtendChannelShown();
		if (pC == null) return false;

		var idx = _safeDefault(pC.idx,0);

		var pBounds =  new Seadragon.Rect();
		pBounds.x = pC.pSynchInfo.center.x - (pC.pSynchInfo.size.width/2);
		pBounds.y = pC.pSynchInfo.center.y + (pC.pSynchInfo.size.height/2);
		pBounds.width = pC.pSynchInfo.size.width;
		pBounds.height = pC.pSynchInfo.size.height;
		this.ATLASViewportList[idx].setBoundsUm(pBounds,immediately);
	},
	updateViewportVisibleState: function(){
		var avp;
		for(var i = 0; i < this.ATLASViewportList.length; i++){
			avp = this.ATLASViewportList[i];
			if(avp.pChannelInfo.isVisible){
				avp.show();
			}
			else avp.hide();
		}
	},
	fitViewportSize : function(){
		var i = 0;
		var j = 0;
		var avpc = this;
		var iVisibleCount = this.getVisibleViewportCount();
		var w = this.displayDim.width / iVisibleCount;
		var h = this.displayDim.height / iVisibleCount;
		while(i < avpc.ATLASViewportList.length){
			var avp = avpc.ATLASViewportList[i];
			if(!avp.pChannelInfo.isVisible){
				if(avpc.displayLayout == 'side')
					avp.fitTo(0, 0, w, avpc.displayDim.height);
				else
					avp.fitTo(0, 0, avpc.displayDim.width, h );
				i++;
				continue;
			}
			if(avpc.displayLayout == 'side'){
				avp.fitTo(j*w, 0, w, avpc.displayDim.height);
				if(j != 0){
					avp.$e.closest('.ATLASViewportCTNR').css({'border-left': '2px solid #fff',
																									 'border-top': '0px',
																									 'z-index': i});
			}}
			else if(avpc.displayLayout == 'stack'){ // stack
				avp.fitTo(0, j*h, avpc.displayDim.width, h );
				if(j != 0){
					avp.$e.closest('.ATLASViewportCTNR').css({'border-top': '2px solid #fff',
																									 'border-left': '0px',
																									 'z-index': i});
			}}
			j++;
			i++;
		}
	},
	getVisibleViewportCount: function(){
		var i = 0;
		for(var jj = 0; jj < this.ATLASViewportList.length; jj++){
			if (this.ATLASViewportList[jj].pChannelInfo.isVisible){
				i++;
			}
		}
		return i;
	},
	getFirstVisibleViewport: function(){
		for(var jj = 0; jj < this.ATLASViewportList.length; jj++){
			if (this.ATLASViewportList[jj].pChannelInfo.isVisible){
				return this.ATLASViewportList[jj];
			}
		}
		return null;
	},
	getATLASViewportAt : function(x, y){
		var i = 0;
		var a;
		while(i < this.ATLASViewportList.length){
			a = this.ATLASViewportList[i];
			if(a.$e.hitTest(x,y)) return a;
			i++;
		}
	},
	getDetectors : function(){
		var r = new Array();
		var i = 0;
		while(i < this.ATLASViewportList.length){
			var av = this.ATLASViewportList[i];
			r.push(av.detector);
			i++;
		}
		return r;
	},
	getATLASInfo: function(){
		if(this.ATLASViewportList.length > 0)
			return this.getFirstVisibleViewport().ATLASInfo;
	},
	getDataAspectRatio: function(){
		if(this.ATLASViewportList.length > 0)
			return this.getFirstVisibleViewport().getDataAspectRatio();
	},
	getViewAspectRatio: function(){
		if(this.ATLASViewportList.length > 0)
			return this.getFirstVisibleViewport().getViewAspectRatio();
	},
	disable : function(bDarken){

		this.$e.append($("<div id='AVPCBlocker'></div>"));
		if((bDarken == undefined) || (bDarken == true))
			$('#AVPCBlocker').addClass('AVPDarkBlocker');
		$('#AVPCBlocker').width('100%');
		//$('#AVPCBlocker').height(this.$e.height());
		$('#AVPCBlocker').height('100%');
		$('#AVPCBlocker').css('position','absolute');
		$('#AVPCBlocker').css('top',0);
		$('#AVPCBlocker').css('left',0);
		$('#AVPCBlocker').css('right',0);
		$('#AVPCBlocker').css('bottom',0);
		if (G_DEBUG) {
			$('#AVPCBlocker').css('background-color','blue');
			$('#AVPCBlocker').css('opacity','0.25');
		}
	},
	enable : function(){
		$('#AVPCBlocker').fadeOut(500, function(){
			$(this).remove();
		});
	},
	zoomBy : function(R, immediately){
		if(immediately == undefined)
			immediately = false;
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].sdViewer.viewport.zoomBy(R, immediately);
			i++;
		}
	},
	initATLASViewportDraw: function(){

	},
	keydown: function(e){
	},
	shutDown: function(){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].shutDown();
			i++;
		}
		this.$e.remove();
		this.scaleBar.shutDown();
	},
	updateCursors: function(){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].updateCursor();
			i++;
		}
	},
	setBoundsUm: function(rUm, bImmediately){
		var i = 0;
		while(i < this.ATLASViewportList.length){
			this.ATLASViewportList[i].setBoundsUm(rUm, bImmediately);
			i++;
		}
	},
	resetDisplayViewportChange: function(){
		for(var i = 0; i < this.ATLASViewportList.length; i++){
			this.ATLASViewportList[i].resetDisplayViewportChange();
		}
	}
});
