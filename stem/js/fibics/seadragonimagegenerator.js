G_SD_MAXZOOMLEVEL_DETECTED = 0;

TImageReconstructionTileInfo = Class.extend({
	init: function(offsetX, offsetY, startingRow, startingCol, rowCount, colCount, imgScaling, imgWidth, imgHeight, displayScaling){
		this.offsetX = offsetX;							// 	the offset in pixel, in real image source pixel (no scaling applied)
		this.offsetY = offsetY;							//  the offset in pixel
		this.startingRow = startingRow;					//  the row index of the top left image
		this.startingCol = startingCol;					//	the col index of the top left image
		this.rowCount =  rowCount;						// 	Count of images that needs to be retreived in x
		this.colCount = colCount;						//	Count of images that needs to be retreived in y
		this.imgScaling = imgScaling; 					// 	How the source tile needs to be scaled.  Seadragon always scale down the image source if not greater than 100% scaling.
														//  essentially, this is the same scalling Seadragon applies to it source image to be displayed on the screen.
		this.imgWidth = imgWidth;						//	Source Tile Width in pixel
		this.imgHeight = imgHeight;						// 	Source Tile Height in pixel
		this.displayScaling = displayScaling;			//  The ratio between the viewport display width and the container to display the image,
														//  i.e. if you draw onto a image of 100 px the content of a viewport that makes 1000 px, the ratio will be 0.1
	}
});

var g_TileImageInfo = 0;

TImageInfo = Class.extend({
	init: function(url, tlx, tly, w, h){
		this.url = url;
		this.x = tlx;
		this.y = tly;
		this.width = w;
		this.height = h;
		this.id = g_TileImageInfo++;
	}
});

TImageAspectRatio = {CurrentView:0, FourThree:1, Square:2};

TSeadragonImageGenerator = Class.extend({
	init: function(pAppC, pSDSource){
		this.ATLASViewport = null;
		this.pAppCTRL = pAppC;
		this.pSDSource = pSDSource;
		this.displayDim =  new TDimension(0,0);
		this.umBounds = new Seadragon.Rect(0,0,0,0);
		this.normBounds = new Seadragon.Rect(0,0,0,0);
		this.busy = false;
		// tell whether to draw the scalebar or not
		this.bDrawScaleBar = false;
		this.eImageAspectRatio = TImageAspectRatio.CurrentView;

		this.imgListToDraw = new Array();
		this.drawnImgList = new Array();		// List of images that were drawn
		this.errorImgList = new Array();		// list of images that could not be drawn.
		this.$canvas = $('<canvas></canvas>').attr('id', 'SDImgGeneratorCanvas');
		this.imgObjList = new Array();
		this.appendLocalErrorForm();
		this.onError = undefined;
		this.errorMsgs = new Array();
		this.withAnnotation = false;
	},
	appendLocalErrorForm : function(){
		$form = $('<div></div>').attr({'id': 'exportErrorLocal',
			'title': 'Error When Saving Image'});
		$form.append($('<div></div>').attr({'class': 'error'}));
		$form.find('div.error').append($('<img />').attr({'src': "images/warning_sign_small.png",
														'class':'exportError',
														'alt':'Warning'}));
		$form.find('div.error').append($('<p></p>').html('The ATLAS Browser-Based Viewer cannot retrieve the image when the application runs locally.'));
		$form.find('div.error').append($('<p></p>').html('If you are running Chrome locally, close all instances of Chrome and start it using : <br /> <span class="chromeCommand">chrome --allow-file-access-from-files</span>'));
		$form.dialog({
			width:'600',
			height:'250',
			autoOpen: false,
			buttons: {'ok': function(){
				$(this).dialog('close');
			}}
		});
	},
	appendErrorForm : function(){
		$form = $('<div></div>').attr({'id': 'exportError',
			'title': 'Error When Exporting Image'});
		$form.append($('<div></div>').attr({'class': 'error'}));
		$form.find('div.error').append($('<img />').attr({'src': "images/warning_sign_small.png",
														'class':'exportError',
														'alt':'Warning'}));
		$form.find('div.error').append($('<p></p>').html('Something unexpected happened and the image cannot be exported.'));
		$form.find('div.error').append($('<p></p>').html('Many things can cause this kind of errors, but most certainly is because you are running the Browser-Based Viewer locally.'));
		$form.dialog({
			width:'600',
			height:'250',
			autoOpen: false,
			buttons: {'ok': function(){
				$(this).dialog('close');
			}}
		});
	},
	getEffectiveUmBounds: function(){
		if(this.eImageAspectRatio == TImageAspectRatio.CurrentView)
			return this.umBounds;
		else if (this.eImageAspectRatio == TImageAspectRatio.FourThree){
			return this.get4to3Rect(this.umBounds);
		}
		else if (this.eImageAspectRatio == TImageAspectRatio.Square){
			return this.getSquareRec(this.umBounds);
		}
	},
	getEffectiveDisplayDim: function(){
		if (this.eImageAspectRatio == TImageAspectRatio.CurrentView)
			return this.displayDim;
		else if (this.eImageAspectRatio == TImageAspectRatio.FourThree){
			return new TDimension(this.displayDim.width, this.displayDim.width*(3/4));
		}
		else if (this.eImageAspectRatio == TImageAspectRatio.Square){
			return new TDimension(this.displayDim.width, this.displayDim.width);
		}
	},
	getEffectiveNormBounds: function(){
		if (this.eImageAspectRatio == TImageAspectRatio.CurrentView)
			return this.normBounds;
		else if (this.eImageAspectRatio == TImageAspectRatio.FourThree){
			return this.get4to3Rect(this.normBounds);
		}
		else if (this.eImageAspectRatio == TImageAspectRatio.Square){
			return this.getSquareRec(this.normBounds);
		}
	},

	get4to3Rect: function(R){
		var c = R.getCenter();
		var h = R.width * (3/4);
		var tl = new Seadragon.Point(R.x, R.y - ((h - R.height)/2))
		return new Seadragon.Rect(tl.x, tl.y, R.width, h);
	},
	getSquareRec: function(R){
		var c = R.getCenter();
		var h = R.width;
		var tl = new Seadragon.Point(R.x, R.y - ((h - R.height)/2))
		return new Seadragon.Rect(tl.x, tl.y, R.width, h);
	},
	saveViewToImg : function(img, callback){
		var zl = this.ATLASViewport.getZoomLevel();

		if (G_DEBUG){ console.log('Current ZoomLevel='+zl); }

		var	tilesBounds = this.getTilesBoundInfo(this.getEffectiveUmBounds(), this.getEffectiveDisplayDim(), zl);
		var me = this;
		this.busy = true;

		function whenCanvasIsReady (){
			if(me.withAnnotation)
				me.drawAnnotation();
				if(me.bDrawScaleBar)
					me.drawScaleBar();
			try{
				var imgURL = me.$canvas.get(0).toDataURL();
				$(img).attr('src', imgURL);
				$(img).width(me.$canvas.width());
				$(img).height(me.$canvas.height());
				if(callback != undefined)
					callback(me.$canvas.get(0));
			}
			catch(error){
				$('#exportError').dialog('open');
				if(me.onError != undefined)
					me.onError();
			}
			me.busy = false;
		}
		//try{
			this.drawImageList(tilesBounds, whenCanvasIsReady);
		//}
		//catch(error){
		//	console.log(error);
		//}
	},
	getSDViewport: function(){
		var dim = this.getEffectiveDisplayDim();
		var newVP = new Seadragon.Viewport(new Seadragon.Point(dim.width, dim.height), this.pSDSource.dimensions);
		newVP.fitBounds(this.normBounds, true);
		newVP.update();
		newVP.panTo(this.normBounds.getCenter(), true);
		newVP.update();
		return newVP;
	},
	drawAnnotation: function(){
		// draw waypoints
		var wpList = this.ATLASViewport.pDisplayWaypointCTRL.pList;
		var i = 0;
		var pSDC = new TSDConverter(this.getSDViewport(), this.pSDSource, this.ATLASViewport.pChannelInfo);

		while(i < wpList.length){
			wpList[i].draw(pSDC, this.$canvas.get(0));
			i++;
		}
		// draw the measurements
		var i = 0;
		mList = this.ATLASViewport.pDisplayMeasurementCTRL.pList;
		while(i < mList.length){
			// do not draw the ExportForPNG objects.
			if(mList[i].measurement.type == TMeasurementType.exporttopng){
				i++;
				continue;
			}
			mList[i].draw(pSDC, this.$canvas.get(0));
			i++;
		}
	},
	drawScaleBar: function(){
		var scaleB = new TScaleBarOnCanvas(this.pAppCTRL.ATLASViewportController, this.$canvas.get(0));
		scaleB.draw();
	},
	buildImageList : function(tileInfo){
		this.imgListToDraw = new Array();
		var jj = 0;
		for ( var j = tileInfo.startingRow; j < tileInfo.startingRow + tileInfo.rowCount; j++){
			var ii = 0;
			for ( var i = tileInfo.startingCol; i < tileInfo.startingCol + tileInfo.colCount; i++){
				var url = this.pSDSource.getTileUrl(tileInfo.zoomLevel, i, j);
				var ox =  ii*tileInfo.imgWidth;
				var oy =  jj*tileInfo.imgHeight;
				var aImg = new TImageInfo(url, ox, oy, tileInfo.imgWidth, tileInfo.imgHeight);
				this.imgListToDraw.push(aImg);
				ii++;
			}
			jj++;
		}
	},
	drawImageList: function(tileInfo, callback){
		// reset what needs to be reset before drawing everything.
		this.errorMsgs = new Array();
		this.drawnImgList = new Array();
		this.errorImgList = new Array();

		this.buildImageList(tileInfo);
		var ctx = this.$canvas.get(0).getContext('2d');
		var me = this;
		var cnv = this.$canvas.get(0);
		cnv.width = this.getEffectiveDisplayDim().width;
		cnv.height = this.getEffectiveDisplayDim().height;
		this.$canvas.width(this.getEffectiveDisplayDim().width);
		this.$canvas.height(this.getEffectiveDisplayDim().height);
		// loop through all the tiles
		this.imgObjList = new Array();
		var i = 0;
		var img = null;
		while(i < this.imgListToDraw.length){
			img = this.imgListToDraw[i];
			//var imgDOM = new Image(img.url, img.x, img.y, img.width, img.height);
			var imgDOM = new Image();
			imgDOM.width = img.width * tileInfo.imgScaling;
			imgDOM.height = img.height * tileInfo.imgScaling;
			imgDOM.left = img.x;
			imgDOM.top = img.y;
			imgDOM.url = img.url;
			if (G_DEBUG) {
				imgDOM.onerror = function(e){
					var s = $(e.target).attr('src');
					var zfactor = s.substring(s.lastIndexOf('/',s.lastIndexOf('/')-1)+1,s.lastIndexOf('/'));
					console.log('Could not load image for export [imgIdx='+$(e.target).attr('imgIndex')+',z='+zfactor+']: '+$(e.target).attr('src'));
				};
			}

			this.imgObjList.push(imgDOM);
			img.x = (img.x + tileInfo.offsetX) * tileInfo.imgScaling * tileInfo.displayScaling;
			img.y = (img.y + tileInfo.offsetY) * tileInfo.imgScaling * tileInfo.displayScaling;
			$(this.imgObjList[this.imgObjList.length - 1]).attr({'imgIndex': i , 'ox': img.x, 'oy': img.y, 'ABVwidth': img.width, 'ABVheight':img.height});
			$(this.imgObjList[this.imgObjList.length-1]).bind('load', function(){
				while(!this.complete){}
				var w = this.naturalWidth * tileInfo.imgScaling *tileInfo.displayScaling;
				var h = this.naturalHeight * tileInfo.imgScaling * tileInfo.displayScaling;
				w = Math.min(w, $(this).attr('ABVwidth'));
				h = Math.min(h, $(this).attr('ABVheight'));
				var imgRatio =  Math.max(tileInfo.imgScaling *tileInfo.displayScaling, 1);
				ctx.drawImage(this, parseFloat($(this).attr('ox')), parseFloat($(this).attr('oy')),
																			w * imgRatio ,
																			h * imgRatio);
				me.drawnImgList.push(me.imgListToDraw[$(this).attr('imgIndex')]);
				if(me.canFireCallback()){
					if(callback != undefined)
						callback(me.$canvas.get(0));
				}
			});
			$(this.imgObjList[this.imgObjList.length-1]).bind('error', function(){
				me.errorImgList.push(me.imgListToDraw[$(this).attr('imgIndex')])
				me.errorMsgs.push('Could not load image ' + $(this).attr('src'));
				if(me.canFireCallback()){
					if(callback != undefined)
						callback(me.$canvas.get(0));
				}
			});
			this.imgObjList[this.imgObjList.length - 1].src = img.url;
			i++;
		}
	},
	canFireCallback: function(){
		return this.imgListToDraw.length == (this.drawnImgList.length + this.errorImgList.length);
	},
	// accept normalized bounds, return a rect with :
	// x = initiali
	// y = initialj
	// w = number of tiles in X
	// h = number of tiles in Y
	getTileIJForFOVExtend: function(normFOVExt, zoomLevel){

		var theSource = this.pSDSource;
		var r = new Seadragon.Rect(0,0,0,0);

		// get all 4 corners
		var tlPt = new Seadragon.Point(normFOVExt.x, normFOVExt.y);
		var trPt = new Seadragon.Point(normFOVExt.x + normFOVExt.width, normFOVExt.y);
		var brPt = new Seadragon.Point(normFOVExt.x + normFOVExt.width, normFOVExt.y + normFOVExt.height);
		var blPt = new Seadragon.Point(normFOVExt.x, normFOVExt.y + normFOVExt.height);

		var tl = theSource.getTileAtPoint(zoomLevel, tlPt);
		var tr = theSource.getTileAtPoint(zoomLevel, trPt);
		var bl = theSource.getTileAtPoint(zoomLevel, blPt);
		var br = theSource.getTileAtPoint(zoomLevel, brPt);
		var tilesCountAtLevel = theSource.getNumTiles(zoomLevel);

		tl.x = Math.max(tl.x, 0);
		tl.y = Math.max(tl.y, 0);
		tr.x = Math.min(tilesCountAtLevel.x - 1, Math.max(tr.x, 0));
		tr.y = Math.max(tr.y, 0);
		bl.x = Math.max(bl.x, 0);
		bl.y = Math.min(tilesCountAtLevel.y - 1, Math.max(bl.y, 0));
		br.x = Math.min(tilesCountAtLevel.x - 1, Math.max(br.x, 0));
		br.y = Math.min(tilesCountAtLevel.y - 1, Math.max(br.y, 0));

		var tileSize_int = new Seadragon.Point(tr.x - tl.x +1 , bl.y - tl.y + 1);
		tr = new Seadragon.Point(tl.x + tileSize_int.x, tl.y);
		br = new Seadragon.Point(tl.x + tileSize_int.x, tl.y + tileSize_int.y);
		bl = new Seadragon.Point(tl.x, tl.y + tileSize_int.y);

		var r =  new Seadragon.Rect(tl.x, tl.y, tr.x - tl.x, bl.y - tl.y);
		return r;
	},
	// return a normalized Seadragon.Rect with coordinates that
	// are confined in the normalized Bounds of the viewport
	//	but with the aspect ratio of the view W/H
	getDisplayNormBounds: function(displayRect /*in pixel*/){
		var R = displayRect.width/displayRect.height;
		var dNorm = new Seadragon.Rect(0,0,0,0);
		dNorm.width = this.getEffectiveNormBounds().width;
		dNorm.height = dNorm.width / R;

		// make sure if fits the criteria
		if(dNorm.height > this.getEffectiveNormBounds().height){
			dNorm.height = this.getEffectiveNormBounds().height;
			dNorm.width = dNorm.height * R;
		}

		// position X, Y
		dNorm.x = this.getEffectiveNormBounds().x - ((dNorm.width - this.getEffectiveNormBounds().width)/2);
		dNorm.y = this.getEffectiveNormBounds().y - ((dNorm.height - this.getEffectiveNormBounds().height)/2);
		return dNorm;
	},
	getTilesBoundInfo: function(fovExtum, displayRect,zl=0){

		// make sure that the fovExtum has the same aspect ratio of the displayDim
		var R1 = this.getEffectiveDisplayDim().width/this.getEffectiveDisplayDim().height;
		var correctedBounds =  this.getDisplayNormBounds(displayRect);
		var src = this.pSDSource;

		// save the original viewport displayBound
		var initCTNRSize = this.ATLASViewport.sdViewer.viewport.getContainerSize();
		var zoomLevelDelta = Math.ceil(Math.log(initCTNRSize.x/displayRect.width)/Math.log(2));
		zoomLevelDelta = 0;  // not implemented, so set it to 0 disables it....
		var zoomLevel = this.ATLASViewport.SDConverter.getZoomLevelFor(displayRect, correctedBounds) - zoomLevelDelta;
		// zoom in by one more level is possible...
		if(zoomLevel < this.pSDSource.maxLevel)
			zoomLevel++;

		if(zl!=0) { //joedf: fallback method, if the request zoomLevel is too high or n/a, use the next highest available one.
			// need to detect 'actual' Max Zoom Level
			// ex. do 404 check for data/1531393705/SESI/SESI_files/17/0_0.jpg  to see if zoomLevel 17 is available...
			var i = Math.max(zl,zoomLevel);
			var maxZL = i;
			var url4check = null;
			if (G_DEBUG) { console.log('testing for availability of max zoom level...'); }
			if (i>G_SD_MAXZOOMLEVEL_DETECTED) {
				while (i>0) {
					url4check = src.getTileUrl(i,0,0);
					if (_UrlExists(url4check)) {
						zl = i;
						break;
					}
					i--;
				}
				if (i != maxZL) {
					if (G_DEBUG) { console.log('fallback zl from '+maxZL+' to '+zl); }
					zoomLevel = zl;
					if (zl>G_SD_MAXZOOMLEVEL_DETECTED) { G_SD_MAXZOOMLEVEL_DETECTED = zl; }
				} else {
					if (G_DEBUG) { console.log('ZoomLevel '+maxZL+' available! :)'); }
					if (maxZL>G_SD_MAXZOOMLEVEL_DETECTED) { G_SD_MAXZOOMLEVEL_DETECTED = maxZL; }
				}
			} else {
				if (G_DEBUG) { console.log('Lower than cached MaxZoomLevel: '+G_SD_MAXZOOMLEVEL_DETECTED); }
			}
		}

		// now get how big the normalizedBound is on screen
		var correctBoundPixel = this.ATLASViewport.sdViewer.viewport.deltaPixelsFromPoints(new Seadragon.Point(correctedBounds.width, correctedBounds.height));
		//var correctBoundPixel = new Seadragon.Point((correctedBounds.width/this.getEffectiveNormBounds())*
		var correctBoundPixel = new Seadragon.Point(displayRect.width, displayRect.height);

		var displayScaling =  (Math.pow(2, zoomLevelDelta) * this.getEffectiveDisplayDim().width/correctBoundPixel.x);
		dRectSD = new Seadragon.Rect(0, 0, displayRect.width, displayRect.height);

		pTileInfo = new TImageReconstructionTileInfo(0,0,0,0,0,0);
		pTileInfo.displayScaling = displayScaling;

		// the tiles to be fetched  xy : initial IJ index
		//							wh : count in i and count in j
		var tileSpan =  this.getTileIJForFOVExtend(correctedBounds, zoomLevel);

		// get the normalized offset
		// the normalized offset is how much the top left corner of the top left tile is shift vis-a-vis the corner of the view
		var normTLTile = src.getTileBounds(zoomLevel, tileSpan.x, tileSpan.y);
		var normOffset = new Seadragon.Point(normTLTile.x - correctedBounds.x, normTLTile.y - correctedBounds.y);
		var powerOf2Inv = 1/Math.pow(2, (src.maxLevel - (zoomLevel + zoomLevelDelta)));
		var imgScaling = this.ATLASViewport.SDConverter.calculateImageScale(new TDimension(correctBoundPixel.x, correctBoundPixel.y), correctedBounds, zoomLevel);
		var tileWPix = this.ATLASViewport.SDConverter.getTileSize(zoomLevel);//768;// src.tileSize/Math.pow(2, zoomLevelDelta);
		var tileHPix = this.ATLASViewport.SDConverter.getTileSize(zoomLevel);768;//src.tileSize/Math.pow(2, zoomLevelDelta);

		// convert the normOffset into pixel
		var offsetPixX = (normOffset.x * tileWPix)/normTLTile.width;
		var offsetPixY = (normOffset.y * tileWPix)/normTLTile.width;

		pTileInfo.offsetY = offsetPixY;
		pTileInfo.offsetX = offsetPixX;
		pTileInfo.startingCol = tileSpan.x;
		pTileInfo.startingRow = tileSpan.y;
		pTileInfo.colCount = tileSpan.width;
		pTileInfo.rowCount = tileSpan.height;
		pTileInfo.imgWidth = tileWPix;
		pTileInfo.imgHeight = tileHPix;
		pTileInfo.zoomLevel = zoomLevel;
		pTileInfo.imgScaling = imgScaling;
		return pTileInfo;
	}
});
