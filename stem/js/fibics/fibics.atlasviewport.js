TATLASViewportMode  = {
	seadragon :0,
	waypoint:1,
	measurement:2
};

TATLASViewportState = {
	idle:0,
	createMeasurement:1,
	createWaypoint:2
};

var isHandled = function(){
	this.handled = false;
}

var g_iATLASViewportCount = 0;


TATLASViewport = Class.extend({
	init: function (DOMid, pChannelInfo, pAppC){

		SDXMLPath = pChannelInfo.filename;//$(xmlNode).children('Filename').text();
		var imgNode =  pChannelInfo.seadragonNode.children('Image')[0];
		SDXMLStr = '<?xml version="1.0" encoding="utf-8"?>' + XMLToString(imgNode);

		this.displayChangeCount = -1;
		this.iVPIndex = -1; //Index in the VPController list.  Set when the viewprt is added to the VPCTRL list;

		this.DOMid = DOMid;
		var AVP = this;
		this.id = pChannelInfo.uid;
		// indicates if the SD Viewer has been loaded
		this.loaded = false;
		this.pAppC = pAppC;
		this.sdScaling = 1;
		this.visible = true;
		this.wcp = null;

		this.mode = TATLASViewportMode.seadragon;
		this.state = TATLASViewportState.idle;
		this.$e = $('#' + this.DOMid);
		this.useScaling = false;
		this.offset = new Seadragon.Point(0,0);
		this.$e.attr('ViewportID', this.id);
		this.$e.wrap($('<div></div>').attr('class', 'ATLASViewportCTNR').css({'width':this.$e.parent().width()+'px', 'height':this.$e.parent().height()+ 'px'}));

		this.$e.css({'width': Math.max(300, this.$e.closest('.ATLASViewportCTNR').width()),
									'height':Math.max(300, this.$e.closest('.ATLASViewportCTNR').height())});
		this.sdViewer = new Seadragon.Viewer(DOMid);
		this.pDisplayMeasurementCTRL = new TDisplayMeasurementController(this.pAppC.measurementController, this);
		this.pDisplayWaypointCTRL = new TDisplayWaypointController(this.pAppC.waypointController, this);

		if (G_DEBUG){
		//	this.wcp = new TWorldCoordsPanel(this);
		//	this.wcp.buildHTML();
		}

		this.sdViewer.addEventListener("open", function(sdV){
			AVP.loaded = true;
			AVP.SDConverter = new TSDConverter(AVP.sdViewer.viewport, AVP.sdViewer.source, AVP.pChannelInfo);
			$(AVP).trigger('onLoad', [AVP]);
		});

		this.sdViewer.addEventListener("animation", function(sdV){
			if(!AVP.visible)
				return false;
			AVP.resetDisplayViewportChange();
			incDisplayChangeCount();
		});

		g_iATLASViewportCount++;

		this.sdViewer.clearControls();

		if (pAppC.DataPathPrefix.length > 0) { // ?data= ref link fix
			SDXMLPath = SDXMLPath.replace('data/','');
		}
		if (G_DEBUG) {
			console.log('DataPathPrefix used: '+pAppC.DataPathPrefix);
			console.log('SDXMLPath used: '+SDXMLPath);
		}

		this.sdViewer.openDzi(pAppC.DataPathPrefix + SDXMLPath, SDXMLStr);
		this.SDXMLStr = SDXMLStr;
		this.initCanvas();
		this.initSeadragonMouseTracker();

		this.measurementTypeToCreate = null;
		this.measurementController = this.pAppC.measurementController;
		this.waypointController = this.pAppC.waypointController;
		this.mosaicDimensionPixel = new Seadragon.Rect(0, 0, 0, 0);
		this.pChannelInfo = pChannelInfo;
		//this.key = hex_md5(this.pChannelInfo.exportInfo.atlasFileName);
		this.mousePos = new Seadragon.Point(0, 0);
		this.m_bMouseDown = true;
		this.pinchstartMidPoint = new Seadragon.Point(0, 0);
		this.pinchstartMidPointPix = new Seadragon.Point(0, 0);

		this.cursor = null;
		this.cursorImg = new Image();
		$(this.cursorImg).addClass('AtlasVPCursor');
		$(this.cursorImg).appendTo($('#' + this.DOMid));

		// cannot create it yet, since we need to read the XML first...
		// created on the Open CB of the SD object.
		this.SDConverter = null;

		// All the stuff related to the touch/mobile devices
		this.m_initialViewportBounds = null;
		this.m_fpreviousZoomFactor = 1;
		this.m_initialXY = new Seadragon.Point(0,0);
		this.m_initNormXY = null;
		this.m_previousDelta = new Seadragon.Point(0,0);
		this.m_bMobileHasPannedViewport = false;
		this.drawInterval  = 40;
		this.initDrawing();
		this.addDetectorNameHTML();
		this.addImageScaleWidget();

		// init mobile/touch interface stuff
		this.mb_initialViewportBounds = null;
		this.mb_previousZoomFactor = 1;
		this.mb_initialXY = new Seadragon.Point(0,0);
		this.mb_initNormXY = new Seadragon.Point(0,0);
		this.mb_previousDelta = new Seadragon.Point(0,0);
		this.m_currentViewportBounds = new Seadragon.Rect(0,0,0,0);

		// prevents selection and right-click menu of the canvas.
		$(this.canvas).on('selectstart', function(){ return false; });
		$(this.canvas).on('contextmenu', function(){ return false; });

		$(this.canvas).on(TouchMouseEvent.DOWN, function(e){
			var genesisEvent = undefined;
			if(e.originalEvent != undefined)
			var genesisEvent = e.originalEvent.originalEvent;

			if(e.offsetX != undefined)
				var pt = new TAtlasPoint(e.offsetX, e.offsetY);
			else
				var pt = new TAtlasPoint(e.pageX-$(this).offset().left, e.pageY - $(this).offset().top);

			// must differentiate between a mouse and touch
			if( genesisEvent.type == 'touchstart'){ // finger event!
				AVP.m_initialViewportBounds = AVP.sdViewer.viewport.getBounds();
				AVP.m_fpreviousZoomFactor = 1;
				AVP.m_initialXY.x = genesisEvent.touches[0].screenX;
				AVP.m_initialXY.y = genesisEvent.touches[0].screenY;
				AVP.m_initNormXY = AVP.sdViewer.viewport.pointFromPixel(AVP.m_initialXY);
				AVP.m_previousDelta.x = 0;
				AVP.m_previousDelta.y = 0;

				if(genesisEvent.touches == undefined) return false;
				if(genesisEvent.touches.length == 1){  // single finger
					AVP.mousedown(genesisEvent, pt);
				}
				else{
					debugLog('More than 1!');
				}
			}
			else
				AVP.mousedown(genesisEvent, pt);
			e.preventDefault();
		});

		$(this.canvas).on(TouchMouseEvent.MOVE, function(e){
			var genesisEvent = undefined;

			if(e.originalEvent != undefined)
				var genesisEvent = e.originalEvent.originalEvent;

			if(e.offsetX != undefined)
				var pt = new TAtlasPoint(e.offsetX, e.offsetY);
			else
				var pt = new TAtlasPoint(e.pageX-$(this).offset().left, e.pageY - $(this).offset().top);
			AVP.mousemove(genesisEvent, pt);

			if ( genesisEvent.Type = 'touchmove'){
				if(AVP.mode != TATLASViewportMode.seadragon)
					return true;

				if ((genesisEvent != undefined) && (genesisEvent.touches != undefined) && (genesisEvent.touches.length == 1)){
					AVP.m_bMobileHasPannedViewport = true;
					var aTouch = genesisEvent.touches[0];
					var zeroZeroNorm = new Seadragon.Point(0,0);
					zeroZeroNorm = AVP.sdViewer.viewport.pointFromPixel(zeroZeroNorm);
					var delta = new Seadragon.Point(AVP.m_initialXY.x - aTouch.screenX, AVP.m_initialXY.y - aTouch.screenY);

					if(AVP.m_previousDelta.x == 0 && AVP.m_previousDelta.y == 0){
						AVP.m_previousDelta.x = delta.x;
						AVP.m_previousDelta.y = delta.y;
					}

					var actualDelta = new Seadragon.Point(delta.x - AVP.m_previousDelta.x, delta.y - AVP.m_previousDelta.y );
					actualDeltaNorm = AVP.sdViewer.viewport.pointFromPixel(actualDelta);
					actualDelta.x = actualDeltaNorm.x - zeroZeroNorm.x;
					actualDelta.y = actualDeltaNorm.y - zeroZeroNorm.y;
					AVP.sdViewer.viewport.panBy(actualDelta);
					AVP.m_previousDelta.x = delta.x;
					AVP.m_previousDelta.y = delta.y;

					// Check if beyond a certain XY
					var newCenter = AVP.sdViewer.viewport.getCenter();
					var mustRecenter = false;

					if(Math.abs(newCenter.x) > 1){
						mustRecenter = true;
						newCenter.x = 1*(newCenter.x/Math.abs(newCenter.x));
					}

					if(newCenter.x < 0){
						mustRecenter = true;
						newCenter.x = 0;
					}

					if(Math.abs(newCenter.y) > 1){
						mustRecenter = true;
						newCenter.y =  1*(newCenter.y/Math.abs(newCenter.y));
					}

					if(newCenter.y < 0){
						mustRecenter = true;
						newCenter.y = 0;
					}

					if(mustRecenter){
						AVP.sdViewer.viewport.panTo(newCenter);
					}
				}
			}
			// must prevent the default behavior of the event if it reached here
			// that will prevent from the whole page to pan in an iPad (for example)
			e.preventDefault();
		}); // end of touchmove

		$(this.canvas).on(TouchMouseEvent.UP, function(e){
			if(e.offsetX != undefined)
				var pt = new TAtlasPoint(e.offsetX, e.offsetY);
			else
				var pt = new TAtlasPoint(e.pageX-$(this).offset().left, e.pageY - $(this).offset().top);
			AVP.mouseup(e, pt);
		});

		$(this.canvas).dblclick(function(e){
			if(e.offsetX != undefined)
				var pt = new TAtlasPoint(e.offsetX, e.offsetY);
			else
				var pt = new TAtlasPoint(e.pageX-$(this).offset().left, e.pageY - $(this).offset().top);
			AVP.dblclick(e, pt);

		});

		$(this.canvas).on('click', function(e){  //former Click
			if(e.offsetX != undefined)
				var pt = new TAtlasPoint(e.offsetX, e.offsetY);
			else
				var pt = new TAtlasPoint(e.pageX-$(this).offset().left, e.pageY - $(this).offset().top);
			AVP.click(e, pt);
		});

		this.registerEventToWaypointController();
		this.crosshair = new TCrosshair(this);
		$(this).trigger('onLoad', this);

		var me = this;
		$(this.canvas).mouseenter(function(e){
			me.crosshair.active = true;
			$(me.pAppC).trigger('showCrosshair');
			$(me).trigger('mouseEnterViewport', [this]);
			//me.sdMouseTracker.setTracking(true);
			//me.mousedown(e, new TAtlasPoint(e.offsetX, e.offsetY));
			incDisplayChangeCount();
			AVP.mouseenter(e);
		});
		$(this.canvas).mouseleave(function(e){
			me.crosshair.active = false;
			$(me).trigger('mouseLeaveViewport', [this]);
			$(me.pAppC).trigger('hideCrosshair');
			incDisplayChangeCount();
		});

		$(this.pAppC).on('showCrosshair', function(e,x,y){
			me.pAppC.ATLASViewportController.mouseIn = true;
			if(me.pAppC.ATLASViewportController.displayMode != 'continuum')
				me.crosshair.show();

		});
		$(this.pAppC).on('hideCrosshair', function(e,x,y){
			me.pAppC.ATLASViewportController.mouseIn = false;
			me.crosshair.hide();
		});
		$(this.pAppC).on('moveCrosshair', function(e,x,y){
			me.crosshair.pt.x = x;
			me.crosshair.pt.y = y;
		});
		this.registerHammerEvents();
	},
	// transfer the pointers to the prev pointers array.
	storeFingers: function(){
		this.prevfgrs = [];
		for(var i = 0; i < this.fgrs.length; i++){
			this.prevfgrs[i] = this.fgrs[i];
		}
	},
	drawPoint: function(pt){
		var ctx = this.canvas.getContext('2d');
		ctx.beginPath();
      ctx.arc(pt.x, pt.y, 20, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'green';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#003300';
      ctx.stroke();
	},
	drawMidPoint: function(){
		this.drawPoint(this.pinchstartMidPointPix);
		this.drawPoint(new Seadragon.Point(this.fgrs[0].clientX, this.fgrs[0].clientY));
		this.drawPoint(new Seadragon.Point(this.fgrs[1].clientX, this.fgrs[1].clientY));
	},
	// save the pointers from then event
	saveFingers: function(ev){
		this.fgrs = [];
		for(var i = 0; i < ev.pointers.length; i++){
			this.fgrs[i] = ev.pointers[i];
		}
	},
	// anything related to mobile devices
	registerHammerEvents: function(){
		var me = this;

		// holding the current event fingers
		this.fgrs = new Array();
		this.fgrs.push(null);
		this.fgrs.push(null);
		this.fgrs.push(null);
		this.fgrs.push(null);

		// holding the previous event fingers
		this.prevfgrs = new Array();
		this.prevfgrs.push(null);
		this.prevfgrs.push(null);
		this.prevfgrs.push(null);
		this.prevfgrs.push(null);
		this.prev2FgrsDist = 0;

		this.pHammer = new Hammer(this.canvas);
		var pinch = new Hammer.Pinch();
		this.pHammer.add(new Hammer.Pinch({event:'pinch3', pointers:3}));
		this.pHammer.add(new Hammer.Pinch({event:'pinch4', pointers:4}));
		//var pinch3 = new Hammer.Pinch();
		//var pinch2 = new Hammer.Pinch({event:'pinch2', pointers:2});

		var tap = new Hammer.Tap();
		this.pHammer.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }));
		this.pHammer.add( new Hammer.Tap({ event: 'tripletap', taps: 3 }));
		this.pHammer.add([pinch, tap]);

		this.pHammer.on("pinchstart", function(ev) {
			// must reset the prev fingers distance
			if(ev.pointers.length < 2) return false; // only do something when there are 2 fingers.
			var f1 = ev.pointers[0];
			var f2 = ev.pointers[1];

			me.pinchstartMidPointPix = new Seadragon.Point((f1.clientX + f2.clientX)/2, (f1.clientY + f2.clientY)/2)
			midF = me.SDConverter.pSDViewport.pointFromPixel(me.pinchstartMidPointPix, true);
			midF.x = Math.min(1.5, midF.x);
			midF.y = Math.min(1.5, midF.y);
			midF.x = Math.max(-0.5, midF.x);
			midF.y = Math.max(-0.5, midF.y);
			me.pinchstartMidPoint = midF;
			var dist = Math.sqrt(Math.pow(f1.pageX - f2.pageX, 2) + Math.pow(f1.pageY - f2.pageY, 2));
			me.prev2FgrsDist = dist;
		});


		this.pHammer.on("pinch", function(ev) {
			me.hammerPinch(ev);
		});

		this.pHammer.on("pinch3", function(ev) {
			me.hammerPinch(ev);
		});

		this.pHammer.on("pinch4", function(ev) {
			me.hammerPinch(ev);
		});


		this.pHammer.on("doubletap", function(ev){
			if(!g_isMobile) return false;
			var midF = new Seadragon.Point(ev.pointers[0].clientX, ev.pointers[0].clientY);
			midF = me.SDConverter.pSDViewport.pointFromPixel(midF, false);
			var imgSc = me.SDConverter.getImageScale();
			if(imgSc < 200)
				me.sdViewer.viewport.zoomBy(2, midF );
		});
		this.pHammer.on("tripletap", function(ev){
			me.sdViewer.viewport.zoomBy(0.5);
		});
	},
	hammerPinch: function(ev){
			this.saveFingers(ev);
			if (G_DEBUG){
				this.drawMidPoint();
			}
			if(this.fgrs.length < 2) return false; // only do something when there are 2 fingers or more.

			var f1 = this.fgrs[0];
			var f2 = this.fgrs[1];

			var dist = Math.sqrt(Math.pow(f1.pageX - f2.pageX, 2) + Math.pow(f1.pageY - f2.			pageY, 2));
			var usedVelocity = Math.abs(ev.velocity/2);
			// now check if closer or futher than the last pinch
			//if (ev.velocity > 0){
			if(dist > this.prev2FgrsDist){ // zoom in
				var imgSc = this.SDConverter.getImageScale();
				if(imgSc < 200){
					this.sdViewer.viewport.zoomBy(1 + usedVelocity, this.pinchstartMidPoint, false);
				}
				this.prev2FgrsDist = dist;
			}
			//else if (ev.velocity < 0){
			else if(dist < this.prev2FgrsDist){ // zoom out
				// make sure to not go beyond 2 of the nominal width or height
				if ( this.SDConverter.getImageScale() < this.SDConverter.getMinImageScale())
					return false;
				this.sdViewer.viewport.zoomBy(1 - usedVelocity, this.pinchstartMidPoint, false);
				this.prev2FgrsDist = dist;
			}
	},
	shutDown: function(){
		if(this.sdViewer != undefined)
			this.sdViewer.close();

		this.$e.closest('.ATLASViewportCTNR').remove();
	},
	show: function(){
		//this.sdViewer.setVisible(true);
		this.$e.css('display', 'block');
		this.visible = true;
	},
	hide: function(){
		//this.sdViewer.setVisible(false);
		this.$e.css('display', 'none');
		this.visible = false;
	},
	registerEventToWaypointController: function(){

	},
	initDrawing: function(){
		var avp = this;
		this.drawTimer = setInterval(function(){
			if(avp.displayChangeCount != g_iDisplayChangeCount){
				avp.draw();
				avp.displayChangeCount = g_iDisplayChangeCount;
			}
		}, avp.drawInterval);
	},
	draw: function(){
		if((this.ctx == undefined) || (this.ctx == null))
				return false;
		// if not visible, do not draw anything.
		if(!this.visible) return false;

		if (G_DEBUG){
			if (this.wcp != null)
				this.wcp.update();
		}

		// Clear the canvas first
		this.ctx.clearRect(0,0,this.getDisplayDim().width, this.getDisplayDim().height);
		$(this).trigger('onDraw');

		// draw the measurements
		this.pDisplayMeasurementCTRL.draw();
		// draw the waypoints
		this.pDisplayWaypointCTRL.draw();

		this.crosshair.draw(this);

		if(this.pAppC.waypointController != undefined){
			if((this.pAppC.waypointController.state == TWaypointControllerState.createWaypoint)
					&& this.pAppC.ATLASViewportController.mouseIn
				){
				// draw the waypoint where it will be
				this.pDisplayWaypointCTRL.creationWaypointD.update(this, this.canvas);
				this.pDisplayWaypointCTRL.creationWaypointD.draw(this.SDConverter, this.canvas);
				}
		}

		// at the end, draw the cursor since you want it to be on top of everything
		this.displayCursor();

	},
	getDisplayDim: function(){
		r = new Seadragon.Rect(0,0,0,0);
		r.x = this.$e.closest('.ATLASViewportCTNR').offset().left;
		r.y = this.$e.closest('.ATLASViewportCTNR').offset().top;
		r.width = this.$e.closest('.ATLASViewportCTNR').width();
		r.height = this.$e.closest('.ATLASViewportCTNR').height();

		return r;
	},
	initCanvas : function(){

		// insert the canvas in the code
		this.canvas = $("<canvas></canvas>").addClass('ATLASViewportCanvas').attr({
			id:'MeasurementCanvas' + this.id,
			'ViewportID': this.id
		}).get(0);

		// must be in the try block since
		// IE8 does not support it.
		try{
			this.ctx = 	this.canvas.getContext('2d');
			this.ctx.translate(0.5, 0.5);
		}
		catch(err) {
		}

		var	d = this.getDisplayDim();
		//$(this.canvas).width(d.width);
		//$(this.canvas).height(d.height);
		$(this.canvas).css('width', d.width +'px');
		$(this.canvas).css('height', d.height +'px');
		this.canvas.width = d.width;
		this.canvas.height = d.height;

		$(this.canvas).appendTo(this.$e.closest('.ATLASViewportCTNR'));
	},
	initSeadragonMouseTracker: function(){
		var avp = this;
		// this allows to have the mouse events that occur on the Canvas
		this.sdMouseTracker = new Seadragon.MouseTracker($(this.canvas).attr('id'));
		this.sdMouseTracker.enterHandler = this.sdViewer.tracker.enterHandler ;
		this.sdMouseTracker.exitHandler = this.sdViewer.tracker.exitHandler ;
		this.sdMouseTracker.pressHandler = this.sdViewer.tracker.pressHandler ;
		this.sdMouseTracker.releaseHandler = this.sdViewer.tracker.releaseHandler ;
		//this.sdMouseTracker.clickHandler = this.sdViewer.tracker.clickHandler ;
		this.sdMouseTracker.dragHandler = this.sdViewer.tracker.dragHandler ;
		this.sdMouseTracker.scrollHandler = this.sdViewer.tracker.scrollHandler ;
		this.sdMouseTracker.setTracking(true);
	},
	resetDisplayViewportChange:function(){
		this.pDisplayMeasurementCTRL.resetDisplayViewportChange();
		this.pDisplayWaypointCTRL.resetViewportUpdate();
	},
	FORCE_synchronize: function() {
		if (G_APPLICATION_CTRL.ATLASViewportController.ATLASViewportList.length < 2)
			return false;
		if (_isDefined(this.sdViewer.viewport)) {
			try {
				this.pAppC.ATLASViewportController.setActiveViewport(this);
				this.pAppC.ATLASViewportController.synchViewports(this);
				if (G_DEBUG)
					console.log('FORCE_synchronize['+Date.now()+'] Success.');
			} catch(e) {
				console.log('FORCE_synchronize['+Date.now()+'] Failure.');
			}
			return true;
		}
	},
	fitTo: function(x, y, w, h){
		// First see if they are equal
		cx = parseFloat(this.$e.closest('.ATLASViewportCTNR').css('left'));
		cy = parseFloat(this.$e.closest('.ATLASViewportCTNR').css('top'));
		cw = parseFloat(this.$e.closest('.ATLASViewportCTNR').css('width'));
		ch = parseFloat(this.$e.closest('.ATLASViewportCTNR').css('height'));
		if((cw == w)
			&& (cx == x)
			&& (cy == y )
			&& (ch == h)
		){
			return false;
		}
		var cssProp = {
				'left': x + 'px',
				'width':  w+ 'px',
				'height':  h + 'px',
				'top': y + 'px'
		};
		var avp = this;

		if((this.sdViewer.viewport != undefined) && (this.sdViewer.viewport != null)){
			var cR = this.sdViewer.viewport.getBounds();
		}

		this.$e.closest('.ATLASViewportCTNR').css('width', w +'px');
		this.$e.closest('.ATLASViewportCTNR').css('height', h +'px');
		this.$e.closest('.ATLASViewportCTNR').css('top', y +'px');
		this.$e.closest('.ATLASViewportCTNR').css('left', x +'px');
		avp.$e.closest('.ATLASViewport').css('width', w+'px');
		avp.$e.closest('.ATLASViewport').css('height', h+'px');
		$(avp).trigger('changeSize', avp);

		$(this.canvas).css('width', w +'px');
		$(this.canvas).css('height', h +'px');
		this.canvas.width = w;
		this.canvas.height = h;

		if((this.sdViewer.viewport != undefined) && (this.sdViewer.viewport != null)){
			// set the container size of the SDViewport
			this.sdViewer.viewport.resize(new Seadragon.Point(w, h), true);
		}
		// Make sure that the SDViewer is updated.
		setTimeout(function(){
			if((avp == undefined)
					|| (avp == null)
					|| (avp.sdViewer == undefined)
					|| (avp.sdViewer == null)
					|| cR == undefined) return null;
			avp.sdViewer.drawer.update();
		}, 100);
	},
	panTo: function(xy, immediately){
		var r = this.sdViewer.viewport.getAspectRatio();
		xy.x = Math.min(1, xy.x);
		xy.y = Math.min(1, xy.y);
		xy.x = Math.max(0, xy.x);
		xy.y = Math.max(0, xy.y);
		this.sdViewer.viewport.panTo(xy, immediately);
		this.resetDisplayViewportChange();
	},
	panToCenter: function(immediately){
		this.sdViewer.viewport.panTo(this.sdViewer.viewport.getCenter(), immediately);
		this.resetDisplayViewportChange();
	},
	getDataAspectRatio: function(){
		return this.sdViewer.viewport.getAspectRatio();
	},
	getViewAspectRatio: function(){
		r = this.sdViewer.viewport.getBounds(true);
		return r.height/r.width;
	},
	getPixelSize : function(immediate){
		if (this.SDConverter != null)
			return this.SDConverter.getPixelSize(immediate);
	},
	setPixelSize: function(ps){
		if (this.SDConverter == null) return false;
		return this.SDConverter.setPixelSize(ps);
	},
	getFOVDim : function(immediate){
		if (this.SDConverter != null)
			return this.SDConverter.getFOVDim(immediate);
	},
	//like getZoomLevel, except is not being bounds by min and max.
	getEffectiveZoomLevel: function(){
		var zeroRatio = this.sdViewer.viewport.deltaPixelsFromPoints(this.sdViewer.source.getPixelRatio(0)).x;
		return Math.floor(1 + Math.log(zeroRatio) / Math.log(2));
	},
	getZoomLevel : function(){
		if (this.SDConverter != null)
			return this.SDConverter.getZoomLevel();
	},
	isSDValid: function(){
		if((this.sdViewer == undefined)
				|| (this.sdViewer == null)
				|| (this.sdViewer.viewport == undefined)
				|| (this.sdViewer.viewport == null))
			return false;
		return true;
	},
	readXMLData: function(){
		var pXML = $.parseXML(this.FibicsXMLStr);
		var pSDXML = $.parseXML(this.SDXMLStr);
		var FN = $(pXML).find('fibicsinfo');
		if(FN == undefined) {
			jAlert('Problem with the XML file!');
		}
		this.mosaicDimensionPixel.width = parseFloat($(pSDXML).find('Size').attr('Width'));
		this.mosaicDimensionPixel.height = parseFloat($(pSDXML).find('Size').attr('Height'));
		var AN = FN.find('ATLAS');
	},
	// get the current FOV in a normalized space.
	getNormalizedRect: function(){
		r = this.sdViewer.viewport.getBounds(true);
		if(this.useScaling){
			r.width = r.width/this.sdScaling;
			r.height = r.height/this.sdScaling;
			r.x = (r.x/this.sdScaling) - this.offset.x;
			r.y = (r.y/this.sdScaling) - this.offset.y;
		}
		return r;
	},
	// set the current FOV from the a normalized rectangle.
	//
	setNormalizedRect: function(r){
		if(this.useScaling){
			rOffset = new Seadragon.Rect((r.x*this.sdScaling) + this.offset.x , (r.y *this.sdScaling) + this.offset.y, r.width * this.sdScaling, r.height * this.sdScaling);
			this.sdViewer.viewport.fitBounds(rOffset, true);
		}
		else
			this.sdViewer.viewport.fitBounds(r, true);
	},
	resize : function(W,H){
		r = new Seadragon.Rect(0,0,W, H);
		r = new Seadragon.Point(W, H);
		if(this.isSDValid())
			this.sdViewer.viewport.resize(r);
		this.$e.width(W);
		this.$e.height(H);
		$(this).trigger('changeSize', this);
	},
	setImageWidth: function(aW){
		if( !this.isSDValid()) return false;

		aW = parseFloat(aW);
		if(!aW) return false;
		aW = Math.abs(aW);
		var z = (aW/(this.pChannelInfo.pSynchInfo.getExportedPixelSize()*this.sdViewer.source.dimensions.x))/this.sdViewer.viewport.getBounds().width;
		this.sdViewer.viewport.zoomBy(1/z);
	},
	// always use the width
	getPolaroidMagnification: function(){
		if (this.SDConverter != null)
			return this.SDConverter.getPolaroidMagnification();
	},
	getBoundsUm: function(){
		if (this.SDConverter != null)
			return this.SDConverter.getBoundsUm();
	},
	setBoundsUm: function(bUm, bImmediately){
		var tl = this.SDConverter.pointFromMicron(bUm);
		var wh = this.SDConverter.deltaPointsFromMicrons(new Seadragon.Point(bUm.width, bUm.height));
		this.sdViewer.viewport.fitBounds(new Seadragon.Rect(tl.x, tl.y, wh.x, wh.y), bImmediately);
	},
	getCenterUm : function(){
		if (this.SDConverter != null)
		return this.SDConverter.getCenterUm();
	},
	setImageScale: function(v){
		if (this.SDConverter != null)
			return this.SDConverter.setImageScale(v);
	},
	getMinImageScale : function(){
		if (this.SDConverter != null)
			return this.SDConverter.getMinImageScale();
	},
	// always in screen magnification (never in polaroid!)
	setMagnification: function(aMag, magMode){
		if (this.SDConverter != null)
			this.SDConverter.setMagnification(aMag, magMode);
	},
	getMaxMagnification : function(magMode){
		if (this.SDConverter != null)
			return this.SDConverter.getMaxMagnification();
	},
	getMinMagnification: function(magMode){
		if (this.SDConverter != null)
			return this.SDConverter.getMinMagnification();
	},
	getMaxFOVExtension : function(){
		if (this.SDConverter != null)
			return this.SDConverter.getMaxFOVExtension();
	},
	getMinFOVExtension : function(){
		if (this.SDConverter != null)
			return this.SDConverter.getMinFOVExtension();
	},
	getMinPixelSize : function(){
		if (this.SDConverter != null)
			return this.SDConverter.getMinPixelSize();
	},
	getMaxPixelSize : function(){
		if (this.SDConverter != null)
			return this.SDConverter.getMaxPixelSize();
	},
	getImageScale :  function (){
		if (this.SDConverter != null)
			return this.SDConverter.getImageScale();
	},
	// the y axis is inverted.
	// 0, 0 is in the center of the dataset (unlike Seadragon where 0,0 is the top left corner.
	pointFromMicron: function(aPt){
		if (this.SDConverter != null)
			return this.SDConverter.pointFromMicron(aPt);
	},
	micronFromPoint: function(aPt){
		if (this.SDConverter != null)
			return this.SDConverter.micronFromPoint(aPt);
	},
	pixelFromMicron: function(sdPt, current){
		if (this.SDConverter != null)
			return this.SDConverter.pixelFromMicron(sdPt, current);
	},
	micronFromPixel: function(pt, current){
		if (this.SDConverter != null)
			return this.SDConverter.micronFromPixel(pt, current);
	},
	deltaPixelsFromMicrons:function(pt, current){
		if (this.SDConverter != null)
			return this.SDConverter.deltaPixelsFromMicrons(pt, current)
	},
	deltaPointsFromMicrons: function(aPt, current){
		if (this.SDConverter != null)
			return this.SDConverter.deltaPointsFromMicrons(aPt, current);
	},
	deltaMicronsFromPoints: function(aPt, current){
		if (this.SDConverter != null)
			return this.SDConverter.deltaMicronsFromPoints(aPt, current);
	},
	mousedown: function(e, pt){
		var umPt = this.micronFromPixel(pt, true);
		this.m_bMouseDown = true;
		var handled = new isHandled();
		this.FORCE_synchronize();
		try{
			this.pDisplayWaypointCTRL.mousedown(e, pt, this, handled);
			if(handled.handled){
				this.measurementController.deselectAllMeasurement();
				return null;
			}

			this.pDisplayMeasurementCTRL.mousedown(e, pt, this, handled);
			if(handled.handled) {
				this.waypointController.deselectAllWaypoint();
				return null;
			}
		}
		finally{
			this.sdMouseTracker.setTracking(!handled.handled);
			if(!handled.handled){
				this.waypointController.deselectAllWaypoint();
			}
		}
	},
	mousemove: function(e, pt){
		var handled = new isHandled();

		if ((this.mousePos.x == pt.x) && (this.mousePos.x == pt.y))
			return false;

		try{
			this.cursor = this.getCursor(pt);
			$(this.pAppC).trigger('moveCrosshair', [pt.x, pt.y]);
			this.mousePos.x = pt.x;
			this.mousePos.y = pt.y;
			incDisplayChangeCount();

			this.pDisplayWaypointCTRL.mousemove(e, pt,this.SDConverter, handled);
			this.pDisplayMeasurementCTRL.mousemove(e, pt, this.SDConverter, handled);
			if(handled.handled)
				return false;

//			this.pDisplayWaypointCTRL.mousemove(e, pt, this, handled);
			if(handled.handled)
				return false;
		}
		finally{
			this.sdMouseTracker.setTracking(!handled.handled);
		}
	},
	mouseenter: function(e, pt) {
		var handled = new isHandled();
		this.FORCE_synchronize();
	},
	mouseup: function(e, pt){
		this.m_bMouseDown = false;
		var handled = new isHandled();
		this.FORCE_synchronize();
		this.pDisplayMeasurementCTRL.mouseup(e, pt, this.SDConverter, handled);
		this.pDisplayWaypointCTRL.mouseup(e, pt, this.SDConverter, handled);
		this.sdMouseTracker.setTracking(true);
	},
	click : function(e, pt){
		var handled = new isHandled();
		this.FORCE_synchronize();
		switch(this.mode){
			case TATLASViewportMode.measurement:
				this.pDisplayMeasurementCTRL.click(e, pt, this, handled);
				return false;
			break;
		}


		//this.sdMouseTracker.setTracking(this.mode == TATLASViewportMode.seadragon);
		this.sdMouseTracker.setTracking(false);
		this.setMode(TATLASViewportMode.seadragon);
		return false;
	},
	dblclick: function(e, pt){
		var handled = new isHandled();
		this.FORCE_synchronize();
		this.pDisplayMeasurementCTRL.dblclick(e, pt, this.SDConverter, handled);

		if(handled.handled) return false;

		var sdPt = new Seadragon.Point(pt.x, pt.y);
		sdPt = this.sdViewer.viewport.pointFromPixel(sdPt);
		var minPs = this.getMinPixelSize();
		var cPs = this.getPixelSize()

		if(minPs < cPs)
			this.sdViewer.viewport.zoomBy(2, sdPt, false);
	},
	setMode: function(M){
		this.mode = M;
	},
	setCenter: function(umPt,immediately=false){
		var nPt = this.pointFromMicron(umPt);
		this.sdViewer.viewport.panTo(nPt,immediately);
		this.resetDisplayViewportChange();
	},
	addDetectorNameHTML: function(){
		this.$e.append($('<div></div>').attr('class', 'avpDetectorName'));
		this.$e.find('.avpDetectorName').html(this.pChannelInfo.sAlias);
	},
	addImageScaleWidget: function(){
		this.$e.append($('<div></div>').attr('class', 'avpImageScale'));
		var AVP = this;
		this.sdViewer.addEventListener("animation", function(sdV){
			if(!AVP.visible) return false;
			var imgSc = AVP.getImageScale();
			if(imgSc != undefined)
				AVP.$e.find('.avpImageScale').html(imgSc.toFixed(1) + ' %');
		});
	},
	getCursor: function(aPt){
		if((this.mousePos.x == aPt.x) && (this.mousePos.y == aPt.y)){
			return false;
		}

		if ((this.mode == TATLASViewportMode.seadragon)
			&& (this.m_bMouseDown))
			return g_cursorPanning;

		var handled = new isHandled();
		var cur = this.pDisplayMeasurementCTRL.getCursor(aPt, this, handled);
		if(handled.handled) return cur;
		cur = this.pDisplayWaypointCTRL.getCursor(aPt, this, handled);
		if(handled.handled) return cur;
	},
	updateCursor: function(){
		return false;
		this.cursor = this.getCursor(this.mousePos);
		incDisplayChangeCount();
	},
	displayCursor: function(){
		return false;
		if(g_isMobile) return true;

		if( (this.cursor == undefined) || (this.cursor == null)){
			$(this.cursorImg).css({'display': 'none'});
			$(this.canvas).css('cursor', 'crosshair');
			return false;
		}
		if(this.cursor.type == 'windows'){
			$(this.cursorImg).css({'display': 'none'});
			$(this.canvas).css('cursor', this.cursor.img);
		}
		else if(this.cursor.type == 'custom'){

			if(this.cursor.windowsCursor != ''){
				$(this.canvas).css('cursor', this.cursor.windowsCursor);
				return true;
			}
			$(this.canvas).css('cursor', 'none');
			this.cursorImg.src = this.cursor.img.src;
			$(this.cursorImg).css({'display': 'block',
															'top':  this.mousePos.y + this.cursor.offset.y,
															'left':  this.mousePos.x + this.cursor.offset.x});

			this.ctx.drawImage(this.cursor.img, this.mousePos.x + this.cursor.offset.x, this.mousePos.y + this.cursor.offset.y/*, 32, 32*/);
		}
	}
});
