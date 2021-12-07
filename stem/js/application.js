// The main Application Controller

var ABBV_APPLICATION_VERSION = '2.0.3.4';
var G_APPLICATION_CTRL;
var G_DATAURL = 'data';
var G_PRELOAD_ACTIVATOR = 'preload';
var G_SAVETOFILE_ACTIVATOR = 'savetofile';
var G_PIXELTOMM = null;

// Defined here but set in the application.settings.js file.
var G_DEBUG;
var G_DEFAULT_LANGUAGE;

TApplicationController = Class.extend({
	init: function (){

		var me = this;
		this.ATLASViewportController = null;
		this.measurementController = null;
		this.waypointController = null;
		this.sessionSerializer = null;
		this.viewController = null;
		this.keyboardController = null;
		this.pBrowserCheck = null;
		this.slideShowController = null;
		this.pSlideShowBar = null;
		this.project = null;
		this.ioStorage = null;
		this.dataURL = null;
		this.footer = null;
		this.pLargestChannel = null;
		this.pMsgCTRL = null;
		this.pMsgPanel = null;
		this.loadingSS = null;

		this.loadingSS = new TLoadingSplashScreen();
		$(this).on('onFinalizeLoad', function(){
			me.loadingSS.shutdown();
		});


		loadCSS('css/jquery-ui-override.css');

		try{
			this.configureSeadragon();
		}
		catch(e){
			throw('Unable to configure the Seadragon engine.');
		}


		this.project = new TFibicsProject();
		this.ioStorage = new TStorage(this.project);
		G_LANG_CTRL.setIOCTRL(this.ioStorage);
		G_LANG_CTRL.initialize();
		// The path to append to the SD data folder when loaded with the url variable.
		this.DataPathPrefix = '';
		this.pMsgCTRL = new TMessageController();
		this.pMsgPanel = new TMessagePanel(this.pMsgCTRL,this);

		// check if debug is in the URL
		if(!G_DEBUG){
			G_DEBUG = GetURLParameter('debug');
			if(G_DEBUG){
				loadCSS('css/debug.css');
				temp = GetURLParameter('maxzoom');
				if (temp)
					Seadragon.Config.maxZoomPixelRatio = temp;
			}
		}


		// See if the data is passed in the URL
		sDataURL = GetURLParameter(G_DATAURL);
		if(sDataURL){
			this.loadFromURL(sDataURL);
		}
		/*else{ // if no data is passed in the URL, then try to fetch the project file with the correct language.
			if(G_LANG_CTRL.currentLanguage != G_LANG_CTRL.defaultLanguage){
				var sCode = TLanguage.toCode(G_LANG_CTRL.currentLanguage)
				sLangProjectDataFile = 'data/projectdata_' + sCode + '.js';
				this.loadFromURL(sLangProjectDataFile);
			}
		}	*/

		this.ATLASViewportController =  new TATLASViewportController(this);
		this.measurementController = new TMeasurementController(this.ATLASViewportController);
		this.waypointController = new TWaypointController(this.ATLASViewportController);
		this.sessionSerializer = new TSessionSerializer(this);
		this.viewController = new TATLASViewController(this);
		this.keyboardController = new TKeyboardController(this.measurementController, this.waypointController, this.ATLASViewportController);
		this.pBrowserCheck = new TBrowserCheck();
		this.slideShowController = null;
		this.pSlideShowBar = null;
		if(G_DEBUG){
			this.slideShowController = new TSlideShowController(this, this.ATLASViewportController, this.viewController);
			this.pSlideShowBar = new TSlideShowInfoBar(this, this.slideShowController);
			this.slideShowController.ioStorage = this.ioStorage;
		}

		//this.layoutMngr = new TLayoutManager($('body'), this);
		//this.layoutMngr.setFiller(this.ATLASViewportController.$e);
		this.ATLASViewportController.$e.appendTo($('body'));


		this.inDevelopment = true;
		this.initUI();
		if(this.dataURL == null)
			this.loadDataFromXML();

		this.measurementController.initUI(this);

		app = this;
		$(this).trigger('oninit');
		$(window).on('resizestop', function(event){
			if($('#Footer').offset() != undefined){
				var h = $(window).height() - app.footer.getHeight();// $('#Footer').offset().top;
				var w = $(window).width();
				app.ATLASViewportController.resizeViewports(w, h);
			}
			app.ATLASViewportController.setDisplayLayout(app.ATLASViewportController.displayLayout);
		});

		$(window).trigger('resize');

		// load global variables saved in the session
		this.ATLASViewportController.magnificationMode = this.ioStorage.safeGlobalLoad('magMode', DEFAULT_MAGNIFICATION_MODE );

		/*
			Here we register on the AddAtlasViewport of the AVPController since this is called when the SD is loaded.
			Because we may need to have everything loaded before triggering the onFinalizeLoad
		*/
		$(this.ATLASViewportController).on('onAddATLASViewport', function(){
			if(app.ATLASViewportController.ATLASViewportList.length == app.project.getChannelCount())
				$(app).trigger('onFinalizeLoad');
		});


		//Load the browser session directly, if specified true in URL
		if(GetURLParameter(G_PRELOAD_ACTIVATOR)) {
			//me.resetApp();
			me.sessionSerializer.loadFromSession()
		}
		G_PIXELTOMM = this.figureOutScreenDPI();
	},
	loadFromURL: function(sURL){
		this.dataURL = sURL;
		var me = this;
		me.DataPathPrefix = this.dataURL.replace(/[^\/\.\\]+.js/, '').trim();
		$.getScript(this.dataURL, function( data, textStatus, jqxhr ) {
			me.resetApp();
			me.loadDataFromXML();
		}).fail(function(){
			jAlert('<p>It looks like the data location (' + this.dataURL + ') was specified in the URL.</p><p>The application was not able to open the specified location.</p><p>If the Atlas Browser-Based Viewer is run locally, this functionality is not available.</p><p>Sorry.</p>');
		});
	},
	resetAtlasViewports: function(){
		for (var i = 0; i < this.ATLASViewportController.ATLASViewportList.length; i++){
			this.ATLASViewportController.ATLASViewportList[i].shutDown();
			this.ATLASViewportController.ATLASViewportList[i] = null;
		}
		this.ATLASViewportController.ATLASViewportList = [];
	},
	configureSeadragon:function(){
		if(Seadragon != undefined){
			Seadragon.Config.maxZoomPixelRatio = G_SEADRAGON_MAXZOOMPIXELRATIO;
			Seadragon.Config.imagePath = G_SEADRAGON_IMAGEPATH;
			Seadragon.Config.immediateRender = G_SEADRAGON_IMMEDIATERENDER;
			Seadragon.Config.clickTimeThreshold = G_SEADRAGON_CLICKTIMETHRESHOLD;
			Seadragon.Config.minZoomImageRatio = 0.01
		}
		else
			throw('Could not find the Seadragon configurator.');

	},
	resetApp: function(){
		this.resetAtlasViewports();
		this.project.clear();
		this.viewController.deleteAllView();
		this.waypointController.deleteAllWaypoint();
		this.measurementController.deleteAllMeasurement();
		$(this).trigger('onResetApp');
	},
	loadDataFromXML: function(){
		try{
			pM = $.parseXML(g_sProjectData);
			var $projectNode = $(pM).find('Project:first');
			if($projectNode.length == 0)
				throw 'Cannot find project information in the project data file.';
			this.project.fromXML($projectNode);
		}catch(e){
			if(G_DEBUG)
				jAlert(e);
			else
				console.log(e);
			this.shutDown();
			this.appendErrorMsg('Looks like we had problem reading your project file.');
			return false;
		}

		// check if there is a soundtrack to be played.
		stNode = $projectNode.find('soundtrack');
		if((stNode != undefined) &&( stNode.size() > 0)){
			$('<audio></audio>').append($('<source></source>').attr({'src':stNode.text(),'type':"audio/mpeg"})).attr({'autoplay':true, 'controls':'controls'}).appendTo($('body'));
		}

		// settings
		var settingsN = $projectNode.find('Settings');
		if(nodeExists(settingsN)){
			var $mzpr = $projectNode.find('MaxZoomPixelRatio');
			if(nodeExists($mzpr)){
				Seadragon.Config.maxZoomPixelRatio = parseFloat($mzpr.text());
			}
		}
		this.initATLASViewports();
		// load waypoints, measurements and views
		this.waypointController.serializer.loadFromXML($projectNode);
		this.measurementController.serializer.loadFromXML($projectNode);
		this.viewController.serializer.loadFromXML($projectNode);

		// fire up the events onLoadXML
		$(this).trigger('onLoadXML');
	},
	initATLASViewports : function(){

		var h = $(window).height() - parseFloat($('#Footer').outerHeight());
		var w = $(window).width();
		this.ATLASViewportController.setDisplayDim(w, h);

		pM = $.parseXML(g_sProjectData);
		var i = 0;
		var appC = this;

		if (isNaN(this.project.version)
			|| (this.project.version < 2.1)){
			for(var i = 0; i < this.project.pExportedInstances.length; i++){
				var aVP = appC.ATLASViewportController.createATLASViewport('VP' + i,  this.project.pExportedInstances[i]);
			}
		}
		else{
			// read the image from the project.
			// we only need to read the XML once.
			var k = 0; // count the number of ATLASViewport Created;
			for(var i = 0; i < this.project.pExportedInstances.length; i++){
				var expIns = this.project.pExportedInstances[i];
				for( var j = 0; j < expIns.pChannelList.length; j++){
					var aVP = appC.ATLASViewportController.createATLASViewport('VP' + k, expIns.pChannelList[j]);
					k++;
				}
			}
		}

	  /* Synch the viewports with the measurements/waypoints
	  Because the measurement and waypoint were loaded from XML before the creation of the AtlasViewport
	  The registration on the onAdd*** events were not done when the measurement were loaded.
	  They need to be re-triggered.*/
		if( aVP != null){
			$(aVP).on('onLoad', function(){
			  appC.waypointController.fireAddWaypoint();
			  appC.measurementController.fireAddMeasurement();
			  appC.viewController.fireAddView();
				appC.ATLASViewportController.fitToView();
			})
		}
	},
	initUI: function(){
		var me = this;
		// save image form
		this.saveImageForm = new TSaveImageForm(this);
		this.saveImageForm.$e.appendTo($('body'));
		this.saveImageForm.finishBuild()
		// edit measurement length form
		this.editLengthForm = new TMeasurementLengthEditForm(this);
		// edit measurement area form
		this.editAreaForm = new TMeasurementAreaEditForm(this);
		this.footer = new TATLASFooter(this, this.ATLASViewportController);
		this.sidebarWidget = new TSidebarWidget(this);
		this.sidebarWidget.$e.appendTo($('body'));

		this.zoomPanWidget = new TZoomPanControls(this.ATLASViewportController, this.slideShowController);
		this.overviewWidget = new TOverviewWidget(this);
		if(G_DEBUG){
			this.blendingWidget = new TBlendingWidget(this);
			//this.layoutMngr.dockArea.addElement(this.blendingWidget);
		}
	},
	shutDown: function(){
		// calling close on each of the controller
		if (this.measurementController != null)
		this.measurementController.shutDown();
		if (this.waypointController != null)
		this.waypointController.shutDown();
		if (this.ATLASViewportController != null)
		this.ATLASViewportController.shutDown();
		if (this.sessionSerializer != null)
		this.sessionSerializer.shutDown();
		if (this.keyboardController != null)
		this.keyboardController.shutDown();
		if (this.loadingSS != null)
			this.loadingSS.shutdown();

		// shut down UI elements
		if (this.footer != null)
			this.footer.shutDown();
		if (this.sidebarWidget != null)
			this.sidebarWidget.shutDown();
		if (this.zoomPanWidget != null)
			this.zoomPanWidget.shutDown();
		if (this.overviewWidget != null)
			this.overviewWidget.shutDown();
		if (this.saveImageForm != null)
			this.saveImageForm.shutDown();
		if (this.editLengthForm != null)
			this.editLengthForm.shutDown();
		if (this.editAreaForm != null)
			this.editAreaForm.shutDown();
		if (this.pSlideShowBar != null)
			this.pSlideShowBar.shutDown();
	},
	appendErrorMsg: function(msg){
		loadCSS('css/critalerror.css');
		var pS = $('<center/>').attr({'id':'CriticalError'}).appendTo($('body'));
		var imgHLDR = $('<div/>').attr({'id':'CriticalErrorAtlasLogo'}).appendTo(pS);
		$('<img />').attr({'src':'images/atlas_title.gif', 'class':'CriticalErrorAtlasImg'}).appendTo(imgHLDR);
		$('<br/>').appendTo(imgHLDR);
		$('<span />').html('Browser-Based Viewer').appendTo(pS);
		$('<br/>').appendTo(pS);
		$('<br/>').appendTo(pS);
		$('<h2/>').html('Oops! A Critical Error Happened.').appendTo(pS);
		$("<p/>").html('Something went south and we cannot even start the browser-based viewer.').appendTo(pS);
		$("<p/>").addClass('CritalErrorMsg').html(msg).appendTo(pS);
	},
	getApplicationVersion: function(){
		var V = ABBV_APPLICATION_VERSION;
		if(this.inDevelopment) return (V + ' - PRE-RELEASE');
		return V;
	},
	getURL: function(){
		return document.URL;
	},
	figureOutScreenDPI: function(){
		var $etalon = $('<div/>').css('width', '10mm').appendTo('body');
		var iW = $etalon.width();
		$etalon.remove();
		return iW/10;
	}
});
