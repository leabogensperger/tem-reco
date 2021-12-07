/****
**
**
**  The SlideShow Controller
**	February 22th 2015
**	Alexandre Laquerre & Joachim de Fourestier :)
**	Fibics Incorporated
**
**
***/


////// Some information can be passed in the URL about the slide show
//  ss_start = true or false - AutoStart the slide show or now
MAX_LINKED_IMAGERY_COUNT = 10;
TSlideShowMode = {Auto:0, Manual:1};
TSlideShowTransition = {Zoom:0, Pan:1, None:2};
TSlideShowState = {Stopped:0, Started:1, Paused:2};
SLIDESHOW_DEFAULT_INTERVAL = 1;
SLIDESHOW_DEFAULT_DAISY_CHAIN = false;
SLIDESHOW_DEFAULT_LOOP = true;
SLIDESHOW_DEFAULT_TRANSITION = TSlideShowTransition.Pan;
SLIDESHOW_DEFAULT_DISPLAYVIEWINFO = true;
SLIDESHOW_DEFAULT_MODE = TSlideShowMode.Auto;


function TSlideShowStepInfo(){
			this.URL = '', 		// string
			this.View = null; 	// TATLASView
}


// Holds information about the linked imagery.
TSlideShowLinkedImageryInfo = Class.extend({
	init: function(){
			//this.UID = guid();
			// should use uid of project no?
			this.UID = G_APPLICATION_CTRL.project.uid;

			this.URL = '', 				// string
			this.Caption = null;
	},
	packInfo: function(obj){
		if(obj == undefined)
			obj = new Object();
		try{
			obj.URL = this.URL;
			obj.Caption = this.Caption;
			obj.UID = this.UID;
		}
		catch(error){
			displayError(error);
		}
		return obj;
	},
	toJSON: function(){
		obj = new Object();
		return this.packInfo(obj);
	},
	fromJSON: function(obj){
		if(obj == null) return false;
		this.URL = obj.URL;
		this.Caption = obj.Caption;
		this.UID = obj.UID;
	}
});

TSlideShowController = Class.extend({
	init: function(pApp, pAVPCTRL, pViewCTRL){
		loadCSS('css/slideshow.css');

		this.pAVPCTRL = pAVPCTRL;
		this.pApp = pApp;
		this.pViewCTRL = pViewCTRL;
		this.pCurrentView = null;
		this.ioStorage = null;
		this.eState = TSlideShowState.Stopped;

		// All user settings
		this.eMode = SLIDESHOW_DEFAULT_MODE;
		this.eTransition = SLIDESHOW_DEFAULT_TRANSITION;
		this.bLoop = SLIDESHOW_DEFAULT_LOOP;
		this.bDisplayViewInfo = SLIDESHOW_DEFAULT_DISPLAYVIEWINFO;
		this.bDaisyChain = SLIDESHOW_DEFAULT_DAISY_CHAIN;
		this.iInterval = SLIDESHOW_DEFAULT_INTERVAL;

		// the Daisy Link List is automatically loaded from the local storage of the browser.
		this.pLinkedImageryList = new Array();
		this.pCurrentLinkedImagery = null;		// The currentLink UID is saved before redirection, so the current Link can be restored after redirection.
		this.registerEvents();
		//
		this.iGoToNextTimeout = null;  	// timeout object that will go to the next view.
		this.iZoomOutTimeout = null;
	},
	saveSettings: function(){
		this.ioStorage.globalSave('SlideShowMode', this.eMode);
		this.ioStorage.globalSave('SlideShowTransition', this.eTransition);
		this.ioStorage.globalSave('SlideShowLoop', this.bLoop);
		this.ioStorage.globalSave('SlideShowInterval', this.iInterval);
		this.ioStorage.globalSave('SlideShowDaisyChain', this.bDaisyChain);
		this.ioStorage.globalSave('SlideShowDisplayViewInfo', this.bDisplayViewInfo);
		this.saveLinkedImagery();
	},
	saveLinkedImagery: function(){
		var mJSON = JSON.stringify(this.pLinkedImageryList);
		this.ioStorage.globalSave('LinkedImagery', mJSON);
	},
	loadSettings: function(){
		this.eMode = this.ioStorage.safeGlobalLoad('SlideShowMode', SLIDESHOW_DEFAULT_MODE);
		this.eTransition = parseInt(this.ioStorage.safeGlobalLoad('SlideShowTransition', SLIDESHOW_DEFAULT_TRANSITION));
		this.bLoop = this.ioStorage.safeGlobalLoad('SlideShowLoop', SLIDESHOW_DEFAULT_LOOP) === 'true';
		this.iInterval = parseInt(this.ioStorage.safeGlobalLoad('SlideShowInterval', SLIDESHOW_DEFAULT_INTERVAL));
		this.bDaisyChain = this.ioStorage.safeGlobalLoad('SlideShowDaisyChain', SLIDESHOW_DEFAULT_DAISY_CHAIN) === 'true';
		this.bDisplayViewInfo = this.ioStorage.safeGlobalLoad('SlideShowDisplayViewInfo', SLIDESHOW_DEFAULT_DISPLAYVIEWINFO) === 'true';

		this.loadLinkedImagery();

		$(this).trigger('LoadSettings');
	},
	// Load Linked Imagery from the Storage of the Browser.
	loadLinkedImagery: function(){
		var pLinkedJSON = this.ioStorage.globalLoad('LinkedImagery');
		if((pLinkedJSON == null) || (pLinkedJSON == undefined))
			return false;
		var vList = JSON.parse(pLinkedJSON);
		for(var i = 0; i < vList.length; i++){
			pLImg =  new TSlideShowLinkedImageryInfo();
			pLImg.fromJSON(vList[i]);
			this.addLinkedImagery(pLImg);
		}

		// Current Linked Imagery
		this.pCurrentLinkImagery = new TSlideShowLinkedImageryInfo();
		if( ! this.pCurrentLinkImagery.fromJSON(this.ioStorage.globalLoad('CurrentLinkedImagery')))
			this.pCurrentLinkImagery = null;
	},
	setMode: function(eMode){
		this.eMode = eMode;
		this.saveSettings();
	},
	setTransition: function(eTrans){
		this.eTransition = eTrans;
		this.saveSettings();
	},
	setLoop: function(bLoop){
		this.bLoop = bLoop;
		this.saveSettings();
	},
	setSlideInterval: function(iInterval){
		this.iInterval = parseFloat(iInterval);
		this.iInterval = Math.max(this.iInterval, 1);
		if(isNaN(this.iInterval))
			this.iInterval = 5;
		this.saveSettings();
	},
	setDaisyChain: function(bDaisyChain){
		this.bDaisyChain = bDaisyChain;
		this.saveSettings();
	},
	setDisplayViewInfo: function(b){
		this.bDisplayViewInfo = b;
		this.saveSettings();
	},
	canDaisyChain: function(){
		return this.pLinkedImageryList.length > 1;
	},
	// return a record with the view info or the URL of where to daisy chain to.
	getNextView : function(){
		var pInfo = new TSlideShowStepInfo();
		if (this.pCurrentView == null){
			pInfo.View =  this.pViewCTRL.viewList[0];
			return pInfo;
		}

		var iV = this.pViewCTRL.viewList.findIndex(this.pCurrentView);
		if (iV < this.pViewCTRL.viewList.length - 1){
			pInfo.View =  this.pViewCTRL.viewList[iV + 1];
			return pInfo;
		}
		// the current is the last view
		else{
			if(this.bDaisyChain){
				// must get the next link in the list.
				pURL = this.getNextLink();
				//alert(pURL);
				//save views before redirecting //save current views to browser session
				//G_APPLICATION_CTRL.sessionSerializer.saveView();
				G_APPLICATION_CTRL.sessionSerializer.saveToSession();
					//alert("saved views");
				//redirecting to next dataset
				window.location = SetURLParameter('preload',1,pURL);
			}
			else{
				if(this.bLoop){
					pInfo.View = this.pViewCTRL.viewList[0];
					return pInfo;
				}
			}
		}
	},
	registerEvents: function(){
		var me = this;
		$(window).keydown(function(e){
			if(e.which == KEYCODE_ESC){
				if((me.eState == TSlideShowState.Started)
					|| (me.eState == TSlideShowState.Paused)){
					me.stopSlideShow();
				}
			}
			else if(e.which == KEYCODE_ENTER){
				if ((me.eState == TSlideShowState.Started)
					&& (me.eMode == TSlideShowMode.Manual)){
					me.goToNextView();
				} else if ((me.eState == TSlideShowState.Paused)
					&& (me.eMode == TSlideShowMode.Auto)) {
					me.resumeSlideShow();
				} else if ((me.eState == TSlideShowState.Started)
					&& (me.eMode == TSlideShowMode.Auto)) {
					me.pauseSlideShow();
				}
			}
		});

		$(this.pApp).on('onFinalizeLoad', function(){ //load or not SlideShow on App load/start
			me.loadSettings();
			// Verify if we need to start the slide show.
			var isSSStarted = this.ioStorage.globalLoad('SlideShowStarted') === 'true';
			if(isSSStarted){
				me.startSlideShow();
				// uses the views from current browser session, maybe use projectdata in future?
				//load saved views to browser session
				//G_APPLICATION_CTRL.sessionSerializer.loadView();
				G_APPLICATION_CTRL.sessionSerializer.loadFromSession();
					//alert("loaded views");
			}
		});
	},
	getNextLink: function(){
		// to be implemented

		//joedf implementation
		var iList = this.pLinkedImageryList;
		var projectUID = G_APPLICATION_CTRL.project.uid;
		// getNextLinkedImagery() instead ?
		var i = 0;
		for (var k in iList) {
			if (iList[i].UID == projectUID) {
				break;
			}
			i++;
		}
		if (typeof iList[i+1] == 'undefined') {
			return iList[0].URL;
		} else {
			return iList[i+1].URL;
		}
	},
	goToNextView: function(){
		clearTimeout(this.iGoToNextTimeout);
		var me = this;
		var pNextInfo = this.getNextView();

		if(pNextInfo.View != null){
			this.transitionToView(pNextInfo.View);
		}
		if(me.eMode == TSlideShowMode.Auto){
			this.iGoToNextTimeout = setTimeout(function(){
				me.goToNextView();
			}, this.getEffectiveInterval() * 1E3);
		}
		this.pCurrentView = pNextInfo.View;
		$(this).trigger('onViewChange', [this]);
	},
	// add some padding to cope with the transition time
	getEffectiveInterval: function(){
		var transitiontype = _safeNumParse(this.eTransition,SLIDESHOW_DEFAULT_TRANSITION);
		switch(transitiontype){
			case TSlideShowTransition.Zoom:
				return this.iInterval + Seadragon.Config.animationTime + 0.5;
			break;
			case TSlideShowTransition.Pan:
				return this.iInterval + Seadragon.Config.animationTime + 0.5;
			break;
			case TSlideShowTransition.None:
				return this.iInterval;
			break;
		}
	},
	transitionToView: function(pView){
		var me = this;
		var transitiontype = _safeNumParse(this.eTransition,SLIDESHOW_DEFAULT_TRANSITION);
		switch(transitiontype){
			case TSlideShowTransition.Zoom:
				this.pAVPCTRL.fitToView();
				//need to FORCE_synchronize() to avoid right side to be immobile during (zoom till pan)
				this.pAVPCTRL.ATLASViewportList[0].FORCE_synchronize();
				clearTimeout(this.iZoomOutTimeout);
				this.iZoomOutTimeout = setTimeout(function(){
					me.pViewCTRL.goToView(pView);
				}, 1E3*(Seadragon.Config.animationTime + 0.5));
			break;
			case TSlideShowTransition.Pan:
				this.pViewCTRL.goToView(pView);
			break;
			case TSlideShowTransition.None:
				this.pViewCTRL.goToView(pView, true);
			break;
		}
	},
	pause: function(){
		this.eState = TSlideShowState.Paused;
		this.clearTransitionTimeout();
		$(this).trigger('onPauseSlideShow', [this]);
	},
	resume: function(){
		this.eState = TSlideShowState.Started;
		this.goToNextView();
		$(this).trigger('onResumeSlideShow', [this]);
	},
	startSlideShow: function(){
		this.pCurrentView = null;
		this.eState = TSlideShowState.Started;
		this.clearTransitionTimeout();
		this.ioStorage.globalSave('SlideShowStarted', 'true');
		Seadragon.Config.animationTime = 3;
		this.goToNextView();
		this.pAVPCTRL.disable(false);
		$(this).trigger('onStartSlideShow', [this]);
	},
	stopSlideShow: function(){
		this.pCurrentView = null;
		this.clearTransitionTimeout();
		this.ioStorage.globalSave('SlideShowStarted', 'false');
		this.eState = TSlideShowState.Stopped;
		this.pAVPCTRL.enable();
		Seadragon.Config.animationTime = 1.5;
		$(this).trigger('onStopSlideShow', [this]);
	},
	pauseSlideShow: function(){
		return this.pause();
	},
	resumeSlideShow: function(){
		return this.resume();
	},
	clearTransitionTimeout: function(){
		clearTimeout(this.iGoToNextTimeout);
		clearTimeout(this.iZoomOutTimeout);
	},
	canStartSlideShow: function(){
		var  b = this.pViewCTRL.viewList.length > 1;
		b = b && ((this.eState == TSlideShowState.Stopped) || (this.eState == TSlideShowState.Paused));
		return b;
	},
	canStopSlideShow: function(){
		var  b = this.pViewCTRL.viewList.length > 1;
		b = b && ((this.eState == TSlideShowState.Started) || (this.eState == TSlideShowState.Paused));
		return b;
	},
	addLinkedImagery: function(pInfo){
		if (this.pLinkedImageryList.length >= MAX_LINKED_IMAGERY_COUNT){
			jAlert('The maximum of Linked Imagery is ' + MAX_LINKED_IMAGERY_COUNT + '.')
			return false;
		}
		if ( _ObjHasObjwithVal(this.pLinkedImageryList,pInfo.UID) ) {
			jAlert("This dataset is already within the Linked Imagery list.");
			return false;
		}
		this.pLinkedImageryList.push(pInfo);
		$(this).trigger('onAddLinkedImagery', [pInfo]);
		this.saveLinkedImagery();
	},
	removeLinkedImagery: function(pInfo){
		$(this).trigger('onRemoveLinkedImagery', [pInfo]);
		this.pLinkedImageryList.removeItem(pInfo);
		this.saveLinkedImagery();
	},
	getLinkedImageryWithID: function(UID){
		for(var i = 0; i < this.pLinkedImageryList.length; i++){
			if(this.pLinkedImageryList[i].UID == UID)
				return this.pLinkedImageryList[i];
		}
		return null;
	},
	setCurrentLinkedImagery: function(pCLI){
		this.ioStorage.globalSave('CurrentLinkedImagery', pCLI);
		this.pCurrentLinkedImagery = pCLI;
	},
	getNextLinkedImagery: function(){
		// if current = null, return the second one.
		if (this.pCurrentLinkedImagery == null)	{
			if(this.pLinkedImageList.length > 2){
					return this.pLinkedImageList[1];
			}
		}
		var iCur = -1;
		for(var i = 0; i < this.pLinkedImageList.length; i++){
			if (this.pLinkedImageList[i].uid == this.pCurrentLinkedImagery.uid){
					iCur = i;
					break;
			}
		}
	}
});
