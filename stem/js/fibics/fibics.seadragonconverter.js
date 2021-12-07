// JavaScript Document

// Definition of the Polaroid size in inches
var PolaroidSize = {x:5, y:4};

TSDConverter = Class.extend({
	init: function(pSDViewport, pSDSource, pChannelInfo){
		this.pSDViewport = pSDViewport;
		this.pSDSource = pSDSource;
		this.pChannelInfo = pChannelInfo;
	},
	getPixelSize : function(immediate){
		if(this.isSDValid()){
			if(immediate == undefined) immediate = false
			var sdWidth = this.pSDViewport.getBounds(immediate).width;
			var widthMicron = (sdWidth * this.pSDSource.dimensions.x)*this.pChannelInfo.pSynchInfo.getExportedPixelSize();
			var pCNTDim = this.pSDViewport.getContainerSize();
			return widthMicron/pCNTDim.x;
		}
	},
	setPixelSize: function(ps){
		var FOVW = ps*this.pSDViewport.getContainerSize().x/1000;
		var NormWidth = (FOVW/this.pChannelInfo.pSynchInfo.getExportedPixelSize())/this.pSDSource.dimensions.x;
		var zoomByThisMuch = this.pSDViewport.getBounds().width/NormWidth;
		if (this.pSDViewport != null)
			this.pSDViewport.zoomBy(zoomByThisMuch);
	},
	isSDValid: function(){
		if((this.pSDViewport == undefined)
				|| (this.pSDViewport == null))
			return false;
		return true;
	},
	getFOVDim : function(){
		d = new TDimension(0,0);
		if((this.pSDViewport == null) || (this.pSDViewport == undefined)) return d;
		d.width = this.pSDViewport.getBounds().getSize().x*(this.pChannelInfo.pSynchInfo.getExportedPixelSize()*this.pSDSource.dimensions.x);
		d.height = this.pSDViewport.getBounds().getSize().y*(this.pChannelInfo.pSynchInfo.getExportedPixelSize()*this.pSDSource.dimensions.x);
		return d;
	},
	// always use the width
	getPolaroidMagnification: function(){
		var fovDim =  this.getFOVDim();
		return PolaroidSize.x * 25.4/(fovDim.width/1000);
	},
	// return a bound where x,y is the top left corner
	getBoundsUm: function(){
		var r = this.pSDViewport.getBounds();
		var tl = this.micronFromPoint(new Seadragon.Point(r.x, r.y));
		var wh = this.deltaMicronsFromPoints(new Seadragon.Point(r.width, r.height));
		var b = new Seadragon.Rect();
		b.x = tl.x;
		b.y = tl.y;
		b.width = wh.x;
		b.height = wh.y;
		return b;
	},
	setBoundsUm: function(bUm){
		if (this.pSDViewport != null){
			r = this.pointsToMicronsBounds(bUm);
			this.pSDViewport.fitBounds(r);
		}
	},
	// return the equivalent normalized bounds
	pointsToMicronsBounds: function(bUm){
		c = new Seadragon.Point(bUm.x, bUm.y);
		c = this.pointFromMicron(c);
		wh = new Seadragon.Point(bUm.width, bUm.height);
		wh = this.deltaPointsFromMicrons(wh);
		r = new Seadragon.Rect(c.x, c.y, wh.x, wh.y);
		return r;
	},
	getCenterUm : function(){
		if (this.pSDViewport != null){
			var r = this.pSDViewport.getBounds();
			var c = new Seadragon.Point(r.x + r.width/2 , r.y + r.height/2);
			return this.micronFromPoint(c);
		}
	},
	setImageScale: function(v){
		v = parseFloat(v);
		v = Math.abs(v);
		if(!v) return false;
		if(v < this.getMinImageScale()){
			jAlert('Cannot set the image scale smaller than ' + this.getMinImageScale().toFixed(2) + '%.',
					"Image Scale Too Small");
			return null;
		}
		if((v/100) > Seadragon.Config.maxZoomPixelRatio){
			jAlert('Cannot set the image scale bigger than ' + (Seadragon.Config.maxZoomPixelRatio*100) + '%.',
					"Image Scale Too Big");
			return null;
		}
		var xScale = (v/100);
		xScale = xScale*this.pSDSource.dimensions.x / this.pSDViewport.getContainerSize().x;
		this.pSDViewport.zoomTo(xScale);
	},
	getMinImageScale : function(){
		minISWidth = 100*(Seadragon.Config.minZoomImageRatio)*this.pSDViewport.getContainerSize().x/this.pSDSource.dimensions.x;
		minISHeight = 100*(Seadragon.Config.minZoomImageRatio)*this.pSDViewport.getContainerSize().y/this.pSDSource.dimensions.y;
		return Math.min(minISWidth, minISHeight);
	},
	// always in screen magnification (never in polaroid!)
	setMagnification: function(aMag, magMode){
		if(magMode == undefined) magMode = 'screen';
		if((magMode == 'screen') && ((G_PIXELTOMM < 0 ) || (G_PIXELTOMM == null) || isNaN(aMag))) return null;

		if(aMag > this.getMaxMagnification(magMode)) {
			sMag =  formatMagToStr(this.getMaxMagnification(magMode));
			jAlert('The magnification is too large.  Cannot zoom in more than ' + sMag +'.',
					'Magnification Limit');
			return null;
		}

		if(aMag < this.getMinMagnification(magMode)) {
			sMag =  formatMagToStr(this.getMinMagnification(magMode));
			jAlert('The magnification is too small.  Cannot zoom out less than ' + sMag +'.',
					'Magnification Limit');
			return null;
		}
		if( magMode == 'screen' ){
			var displayMM = this.pSDViewport.getContainerSize().x/G_PIXELTOMM;
			var displayum = displayMM*1000/aMag;

		}
		else{
				var displayMM = Math.min(25.4*PolaroidSize.x / (aMag), 25.4*PolaroidSize.y / (aMag) );
				var displayMM = 25.4*PolaroidSize.x / (aMag);
				var displayum = displayMM*1000;
		}
		var normW = displayum/(this.pChannelInfo.pSynchInfo.getExportedPixelSize()*this.pSDSource.dimensions.x);
		var normH = (normW)*this.pSDViewport.getContainerSize().y/this.pSDViewport.getContainerSize().x;
		var newBounds = new Seadragon.Rect(0,0,normW ,normH );
		var cBounds = this.pSDViewport.getBounds();
		this.pSDViewport.zoomBy(cBounds.width/newBounds.width);
	},
	getMaxMagnification : function(magMode){
		if(magMode == undefined) magMode = 'screen';
		if(magMode == 'screen') {
			if(G_PIXELTOMM == -1) return 1;
			displayWidthUM = this.pSDViewport.getContainerSize().x/G_PIXELTOMM*1000;
			displayHeightUM = this.pSDViewport.getContainerSize().y/G_PIXELTOMM*1000;
			maxMag = displayWidthUM/this.getMinFOVExtension();
		}
		else{
			var maxMag = PolaroidSize.x * 25.4/this.getMinFOVExtension()*1000;
			debugLog('Max Mag Polaroid = ' + maxMag);
		}
		return maxMag;
	},
	getMinMagnification: function(magMode){
		if(magMode == undefined) magMode = 'screen';

		if(magMode == 'screen') {
			var displayWidthUM = this.pSDViewport.getContainerSize().x/G_PIXELTOMM*1000;
			var displayHeightUM = this.pSDViewport.getContainerSize().y/G_PIXELTOMM*1000;
			var minMag = displayWidthUM/this.getMaxFOVExtension();
		}
		else{
			var minMag = PolaroidSize.x * 25.4/this.getMaxFOVExtension()*1000;
			//var minMag = Math.min(PolaroidSize.x * 25.4/(minDisplayUMWidth*1000), PolaroidSize.y * 25.4/(minDisplayUMHeight*1000))
		}
		return minMag;
	},
	getMaxFOVExtension : function(){
		// has to take into account the ratio of the display
		var dW = this.pSDViewport.getContainerSize().x;
		var dH = this.pSDViewport.getContainerSize().y;
		var WHRatio = dW/dH;
		return parseFloat(2*this.pChannelInfo.pSynchInfo.getExportedPixelSize()*this.pSDSource.dimensions.x * WHRatio);
	},
	getMinFOVExtension : function(){
		return (this.pChannelInfo.pSynchInfo.getExportedPixelSize()/Seadragon.Config.maxZoomPixelRatio)*this.pSDViewport.getContainerSize().x;
	},
	getMinPixelSize : function(){
		return (this.pChannelInfo.pSynchInfo.getExportedPixelSize()/Seadragon.Config.maxZoomPixelRatio);
	},
	getMaxPixelSize : function(){
		result = (1/Seadragon.Config.minZoomImageRatio)*this.pSDSource.dimensions.x*this.pChannelInfo.pSynchInfo.getExportedPixelSize()/this.pSDViewport.getContainerSize().x;
		result2 = (1/Seadragon.Config.minZoomImageRatio)*this.pSDSource.dimensions.y*this.pChannelInfo.pSynchInfo.getExportedPixelSize()/this.pSDViewport.getContainerSize().y;
		return Math.max(result, result2);
	},
	getTileSize:function(zoomLevel){
		if(zoomLevel >= 11)
			return this.pSDSource.tileSize;
		else
			return 3*Math.pow(2, zoomLevel - 2);
	},
	getImageScale :  function (){
		if(this.pSDViewport == undefined)
			return 1;
		var w1 = this.pSDViewport.getContainerSize().x;
		var w2 = this.pSDSource.dimensions.x;
		var z = this.pSDViewport.getZoom();
		return 100*z*w1/w2;
	},
	// calculates how much scaling must be applied to image of a given level to display them inside the display Rect (pixR);
	calculateImageScale: function(pixDimWH, normR, zoomLevel){
		// calculate the number of pixel that we need to display from normalized bounds
		var sw = this.pSDSource.dimensions.x * normR.width;
		var sh = this.pSDSource.dimensions.y * normR.height;
		var imgScale = pixDimWH.width/sw;
		imgScale *= Math.pow(2, this.pSDSource.maxLevel -  zoomLevel);
		return imgScale;
	},
	// the y axis is inverted.
	// 0, 0 is in the center of the dataset (unlike Seadragon where 0,0 is the top left corner.
	pointFromMicron: function(aPt){
		var newPt = new Seadragon.Point(0,0);
		if((this.pSDSource == null)
				|| (this.pSDSource == undefined)) return newPt;

		/*
		newPt.x = (aPt.x)/ (this.pChannelInfo.pSynchInfo.getExportedPixelSize()*this.pSDSource.dimensions.x);
		newPt.y = (aPt.y) / (this.pChannelInfo.pSynchInfo.getExportedPixelSize()*this.pSDSource.dimensions.x);
		newPt.x += 0.5;
		newPt.y = 0.5 - newPt.y;
		*/
		var pPt = this.pChannelInfo.pSynchInfo.toNorm(aPt);
		var sdPt = new Seadragon.Point(pPt.x, pPt.y);
		return sdPt;
	},
	micronFromPoint: function(aPt){
		var newPt = new Seadragon.Point(aPt.x, aPt.y);
		if((this.pSDSource == null)
				|| (this.pSDSource == undefined)) return newPt;

		var pPt = this.pChannelInfo.pSynchInfo.toWorld(aPt);
		var sdPt = new Seadragon.Point(pPt.x, pPt.y);
		//newPt.x = ((newPt.x - 0.5) * (this.pChannelInfo.pSynchInfo.getExportedPixelSize() * this.pSDSource.dimensions.x));
		//newPt.y = ((0.5 - newPt.y ) * (this.pChannelInfo.pSynchInfo.getExportedPixelSize() * this.pSDSource.dimensions.x));
		return sdPt;
	},
	pixelFromMicron: function(sdPt, current){
		if(current == undefined) current = false;
		var normPt = this.pointFromMicron(sdPt, current);
		if(this.pSDViewport != undefined){
			var pix = this.pSDViewport.pixelFromPoint(normPt, current);
			pix.x = Math.round(pix.x);
			pix.y = Math.round(pix.y);
			return pix;
		}
	},
	micronFromPixel: function(pt, current){
		if(current == undefined) current = false;
		if(this.pSDViewport != undefined){
			var sdPt = new Seadragon.Point(pt.x, pt.y);
			sdPt = this.pSDViewport.pointFromPixel(sdPt, current);
			return this.micronFromPoint(sdPt, current);
		}
	},
	deltaPixelsFromMicrons:function(pt, current){
		if(current == undefined) current = false;
		var sdPt = this.deltaPointsFromMicrons(pt, current);
		if(this.pSDViewport != undefined){
			return this.pSDViewport.deltaPixelsFromPoints(sdPt, current);
		}
	},
	deltaPointsFromMicrons: function(aPt, current){
		if(current == undefined) current = false;
		var newPt = new Seadragon.Point();
		var dPS = this.pChannelInfo.pSynchInfo.getExportedPixelSize();
		newPt.x = (aPt.x) / (dPS * this.pSDSource.dimensions.x);
		newPt.y = (aPt.y) / (dPS * this.pSDSource.dimensions.x);
		return newPt;
	},
	deltaMicronsFromPoints: function(aPt, current){
		var newPt = new Seadragon.Point(aPt.x, aPt.y);
		newPt.x = (newPt.x * (this.pChannelInfo.pSynchInfo.getExportedPixelSize() * this.pSDSource.dimensions.x));
		newPt.y = (newPt.y * (this.pChannelInfo.pSynchInfo.getExportedPixelSize() * this.pSDSource.dimensions.x));
		return newPt;
	},
	getZoomLevel : function(){
		var pixRatio = this.pSDSource.getPixelRatio(0);
		var zeroRatio = this.pSDViewport.deltaPixelsFromPoints(pixRatio).x; // don't forget this .x!
		var highestLevel = Math.max(this.pSDSource.minLevel,
									Math.min(this.pSDSource.maxLevel,
									Math.floor(1 + Math.log(zeroRatio) / Math.log(2))));
		return highestLevel;
	},

	//  returns the zoom level required to display a normalized bounding box
	// on a certain screen realestate (pixel width and height).

	getZoomLevelFor: function(cntrPix, normBounds){
		var sw = this.pSDSource.dimensions.x * normBounds.width;
		var sh = this.pSDSource.dimensions.y * normBounds.height;
		log2Src = Math.log(sw)/Math.log(2);
		log2Disp = Math.log(cntrPix.width)/Math.log(2);
		deltaLog2 = Math.floor(log2Src - log2Disp);
		cZoomLevel = Math.max(Math.min(this.pSDSource.maxLevel, (this.pSDSource.maxLevel - deltaLog2)), this.pSDSource.minLevel);
		return cZoomLevel;
	},
	pointFromPixel: function(pt){
		return this.pSDViewport.pointFromPixel(pt);
	},
	pixelFromPoint: function(pt){
		return this.pSDViewport.pixelFromPoint(pt);
	}
});

function formatMagToStr(dMag){
	if(dMag < 1E3){
		return Math.round(dMag) + ' X';
	}
	if(dMag < 1E6){
		return (dMag/1000).toFixed(2) + ' kX';
	}
}
