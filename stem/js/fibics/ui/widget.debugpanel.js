TDebugPanel = TBaseWidget.extend({																	
	init: function(pAppC){
		var me = this;
		this.pProfiler = null;
		this.profilerInterval = null;		
		this.$profilerPanel = null;
		this._super(pAppC);		
		this.icone = 'debug_icon.png';
		this.title = 'Debug';
		this.hint = 'Debug';
		this.id = 'DebugWidget';
		this.buildHTML();
		
		$(this).on('onPanelHide', function(){
			me.stopProfilerTracking();
		});
		
		$(this).on('onPanelShow', function(){
			me.startProfilerTracking();
		});		
	},
	buildHTML : function(){
		this._super();	
	},	
	buildPanel: function(){
		var me = this;
		this._super();
		this.buildProfilerPanel();
		this.buildZoomLevelPanel();		
		
		this.closeButton = $('<div></div>').html('close').appendTo(this.$panelC).button();
		this.closeButton.click(function(){
			me.appController.shutDown();																	
		});		
	},
	startProfilerTracking: function(){
		var me = this;
		this.pProfiler = me.appController.ATLASViewportController.ATLASViewportList[0].sdViewer.profiler; 
		this.profilerInterval = setInterval(function(){
			if (me.appController.ATLASViewportController.ATLASViewportList[0] != null)
				if ((me.pProfiler != null) && (me.pProfiler != undefined)){
					me.$profilerPanel.find('#profilerAVG').html(me.pProfiler.getAvgUpdateTime());
					me.$profilerPanel.find('#profilerMAX').html(me.pProfiler.getMaxUpdateTime());
					me.$profilerPanel.find('#profilerMIN').html(me.pProfiler.getMinUpdateTime());
				}
		}, 1000);
	},
	stopProfilerTracking: function(){
		var me = this;
		clearInterval(this.profilerInterval);
		this.profilerInterval = null;
	},
	buildProfilerPanel: function(){
		this.$profilerPanel = $('<fieldset/>').appendTo(this.$panelC);	
		this.$profilerPanel.append($('<legend/>').html('profiler'));
		var $profileT = $('<table />').appendTo(this.$profilerPanel);
		var avgSpan = $("<span></span>").attr({'id':'profilerAVG'});
		var minSpan = $("<span></span>").attr({'id':'profilerMIN'});
		var maxSpan = $("<span></span>").attr({'id':'profilerMAX'});
		this.addLine($profileT,'Avg', avgSpan);
		this.addLine($profileT,'Max', maxSpan);
		this.addLine($profileT,'Min', minSpan);	
		

		
	},
	updateZoomLevelPanel: function(){
		var avp = this.appController.ATLASViewportController.ATLASViewportList[0];
		if(avp == null) return false;
		this.$panelC.find('#zoomLevel').html(avp.getZoomLevel());
		this.$panelC.find('#viewWH').html(avp.$e.width() + ' ' + avp.$e.height());
		// get the amount of "pixels" from the source are displayed.
		var b = avp.sdViewer.viewport.getBounds(true);
		var sw = avp.sdViewer.source.width * b.width;
		var sh = avp.sdViewer.source.height * b.height;			
		this.$panelC.find('#viewSWSH').html((sw).toFixed(0) + ' ' + (sh).toFixed(0));
		log2Src = Math.log(sw)/Math.log(2);
		log2Disp = Math.log(avp.$e.width())/Math.log(2);		
		this.$panelC.find('#log2SRC').html((log2Src).toFixed(0));
		this.$panelC.find('#log2Disp').html((log2Disp).toFixed(0));
		
		deltaLog2 = Math.floor(log2Src - log2Disp);
		cZoomLevel = Math.max(Math.min(avp.sdViewer.source.maxLevel, (avp.sdViewer.source.maxLevel - deltaLog2)), avp.sdViewer.source.minLevel);
		this.$panelC.find('#calculatedLevel').html((cZoomLevel).toFixed(0));
		imgScal = avp.$e.width()/sw;
		imgScal = avp.SDConverter.calculateImageScale(new TDimension(avp.$e.width(), avp.$e.height()), b);		
		this.$panelC.find('#imgScaling').html((imgScal).toFixed(3));
		this.$panelC.find('#vpImgScaling').html(avp.getImageScale().toFixed(3));
	},
	buildZoomLevelPanel: function(){
		var fs = $('<fieldset/>').appendTo(this.$panelC);	
		fs.append($('<legend/>').html('Zoom Level Info'));
		var $zoomInfoT = $('<table />').appendTo(fs);
		// add all the different lines
		this.addLine($zoomInfoT, 'Zoom Level', $("<span></span>").attr({'id':'zoomLevel'}));
		this.addLine($zoomInfoT, 'W & H', $("<span></span>").attr({'id':'viewWH'}));
		this.addLine($zoomInfoT, 'SW & SH', $("<span></span>").attr({'id':'viewSWSH'}));
		this.addLine($zoomInfoT, 'Log2Src', $("<span></span>").attr({'id':'log2SRC'}));
		this.addLine($zoomInfoT, 'Lod2Disp', $("<span></span>").attr({'id':'log2Disp'}));
		this.addLine($zoomInfoT, 'Calculated Level', $("<span></span>").attr({'id':'calculatedLevel'}));
		this.addLine($zoomInfoT, 'Image Scaling', $("<span></span>").attr({'id':'imgScaling'}));
		this.addLine($zoomInfoT, 'VP Image Scaling', $("<span></span>").attr({'id':'vpImgScaling'}));		
		
		var me = this;
		setInterval(function(){
				me.updateZoomLevelPanel();		
		}, 500);
	}
});

