TSlideShowWidget = TBaseWidget.extend({
	init: function(pAppsC){
		this._super(pAppsC)
		this.$DaisyChainSelector = null;
		this.ATLASViewportController = pAppsC.ATLASViewportController;
		this.pSSCTRL = this.appController.slideShowController;
		this.icone = 'slide_show_widget_icon2.png';
		this.title = _e('slideshow');
		this.hint = _e('slideshow');
		this.id = 'SlideShowWidget';
		this.buildHTML();
		var me = this;
		this.registerEvents();

		this.iUpdateUITimer = setInterval(function(){
			me.updateUI();
		}, 500);
	},
	shutDown: function(){
		this._super();
		clearInterval(this.iUpdateUITimer);
	},
	registerEvents: function(){
		var me = this;
		this.$panel.on('onShowPanel', function(){

		});

		$(this.pSSCTRL).on('LoadSettings', function(){
			me.updateFields();
		});

		$(this.pSSCTRL).on('onAddLinkedImagery', function(e, pInfo){
			me.addLinkedImageryItem(pInfo);
		});
		$(this.pSSCTRL).on('onRemoveLinkedImagery', function(e, pInfo){
			me.removeLinkedImageryItem(pInfo);
		});

		this.$panel.on(mousetouchdown_event(), '.slideShowDeleteX', function(e){
			var victim = $(this).closest('li');
			var UID = victim.attr('linkedimguid');
			victim.addClass('deleteme');
			var pLinkedImagery = me.pSSCTRL.getLinkedImageryWithID(UID);
			me.pSSCTRL.removeLinkedImagery(pLinkedImagery);
		});

	},
	buildHTML:function(){
		this._super();
		this.addOptionSection();

		this.addDelayInput();
		this.addModeButtons();
		this.addLoopButtons();
		this.addTransitionMode();
		this.addDisplayInfoButtons();
		this.addDaisyChainButtons();
		this.addLinksSection();
		this.addControlButtons();
		this.addInfoPullOut();
		this.fitContentHeight();
	},
	updateUI: function(){
		// Slide Show Controls
		if(this.pSSCTRL.canStartSlideShow()){
			this.$startButton.button('option', 'disabled', false);
		}
		else this.$startButton.button('option', 'disabled', true);

		if(this.pSSCTRL.canStopSlideShow()){
			this.$stopButton.button('option', 'disabled', false);
		}
		else this.$stopButton.button('option', 'disabled', true);

		// Daisy Chain Controls
		if(this.pSSCTRL.canDaisyChain())
			this.enableDaisyChain();
		else this.disableDaisyChain();

	},
	updateFields: function(){
		this.updateDisplayInfo();
		this.updateTransitionMode();
		this.updateLoop();
		this.updateModeButtons();
		this.updateDaisyChain();
		$('#slideShowDelay').val(this.pSSCTRL.iInterval);
	},
	updateDisplayInfo: function(){
		if(this.appController.slideShowController.bDisplayViewInfo){
			this.$DisplayInfoSelector.find('#slideShowDisplayInfoNo').prop('checked', false);
			this.$DisplayInfoSelector.find('#slideShowDisplayInfoYes').prop('checked', true);
		}
		else{
			this.$DisplayInfoSelector.find('#slideShowDisplayInfoYes').prop('checked', false);
			this.$DisplayInfoSelector.find('#slideShowDisplayInfoNo').prop('checked', true);
		}
		this.$DisplayInfoSelector.buttonset('destroy');
		this.$DisplayInfoSelector.buttonset();
	},
	addDisplayInfoButtons: function(){
		var me = this;
		// The Selector between Polaroid and Screen
		this.$DisplayInfoSelector = $('<div></div>').attr({id:'slideShowDisplayInfo'});
		this.$DisplayInfoSelector.append($('<label></label>').attr({'for': 'slideShowDisplayInfoYes'}).html(_e('yes')));
		this.$DisplayInfoSelector.append($('<input></input>').attr({
			id:'slideShowDisplayInfoYes',
			type:'radio',
			name:'slideShowDisplayInfo'
		}));
		this.$DisplayInfoSelector.append($('<label></label>').attr({'for': 'slideShowDisplayInfoNo'}).html(_e('no')));
		this.$DisplayInfoSelector.append($('<input></input>').attr({
			id:'slideShowDisplayInfoNo',
			type:'radio',
			name:'slideShowDisplayInfo'
		}));

		this.addLine(this.$optTable, _e('displayslideshowbarqm'), this.$DisplayInfoSelector);
		this.$DisplayInfoSelector.buttonset();
		this.updateDisplayInfo();

		this.$DisplayInfoSelector.children().on('change', function(){
			me.pSSCTRL.setDisplayViewInfo($(this).attr('id') == 'slideShowDisplayInfoYes');
		});
	},
	addOptionSection: function(){
		this.$optFS = $('<fieldset />').appendTo(this.$panelC).append($('<legend>').html(_e('slideshowoptions')));
		this.$optTable = $('<table/>').appendTo(this.$optFS);
	},
	addDelayInput: function(){
		var me = this;
		// delay input
		var ss_interval = _safeNumParse(this.appController.slideShowController.iInterval,SLIDESHOW_DEFAULT_INTERVAL);
		var $input = $('<input />').attr({'id':'slideShowDelay',
																		 	'type':'text',
																		 	'col':'10',
																		 	'value': ss_interval});

		var $units = $('<span />').html(_e('seconds'));

		$input.on('blur', function(e){
			me.pSSCTRL.setSlideInterval(parseFloat($(this).val()));
			$(this).val(me.pSSCTRL.iInterval);
		});
		$input.on('keydown', function(e){
			if(e.which == 13)
				$(this).trigger('blur');

		});
		this.addLine(this.$optTable, _e('slideshowinterval'), $input.add($units));
	},
	addControlButtons: function(){
		this.$buttonsCTNR = $('<section />').appendTo(this.$panelC);
		this.$startButton = $('<div/>').attr({'id':'StartSlideShow'}).html(_e('startslideshow'));
		this.$startButton.appendTo(this.$buttonsCTNR);
		this.$stopButton = $('<div/>').attr({'id':'StopSlideShow'}).html(_e('stopslideshow'));
		this.$stopButton.appendTo(this.$buttonsCTNR);
		var me = this;
		this.$startButton.button().on(mousetouchdown_event(), function(e){
			me.pSSCTRL.startSlideShow();
		});
		this.$stopButton.button().on(mousetouchdown_event(), function(e){
			me.pSSCTRL.stopSlideShow();
		});
	},
	updateModeButtons: function(){
		if(this.pSSCTRL.eMode == TSlideShowMode.Auto){
			this.$ModeSelector.find('#slideShowModeManual').prop('checked', false);
			this.$ModeSelector.find('#slideShowModeAuto').prop('checked', true);
		}
		else{
			this.$ModeSelector.find('#slideShowModeAuto').prop('checked', false);
			this.$ModeSelector.find('#slideShowModeManual').prop('checked', true);
		}
		this.$ModeSelector.buttonset('destroy');
		this.$ModeSelector.buttonset();
	},
	addModeButtons: function(){
		// The Selector between Polaroid and Screen
		this.$ModeSelector = $('<div></div>').attr({id:'slideShowMode'});
		this.$ModeSelector.append($('<label></label>').attr({'for': 'slideShowModeAuto'}).html('Auto'));
		this.$ModeSelector.append($('<input></input>').attr({
			id:'slideShowModeAuto',
			type:'radio',
			name:'slideShowMode'
		}));
		this.$ModeSelector.append($('<label></label>').attr({'for': 'slideShowModeManual'}).html('Manual'));
		this.$ModeSelector.append($('<input></input>').attr({
			id:'slideShowModeManual',
			type:'radio',
			name:'slideShowMode'
		}));

		this.addLine(this.$optTable, _e('slideshowmode'), this.$ModeSelector);
		this.$ModeSelector.buttonset();
		this.updateModeButtons();
		var me = this;
		this.$ModeSelector.children().on('change', function(){
			if($(this).attr('id') == 'slideShowModeAuto')
				me.pSSCTRL.setMode(TSlideShowMode.Auto);
			else
				me.pSSCTRL.setMode(TSlideShowMode.Manual);
		});
	},
	updateDaisyChain: function(){
		if(this.pSSCTRL.bDaisyChain){
			this.$DaisyChainSelector.find('#slideShowDaisyChainNo').prop('checked', false);
			this.$DaisyChainSelector.find('#slideShowDaisyChainYes').prop('checked', true);
		}else{
			this.$DaisyChainSelector.find('#slideShowDaisyChainYes').prop('checked', false);
			this.$DaisyChainSelector.find('#slideShowDaisyChainNo').prop('checked', true);
		}
		this.$DaisyChainSelector.buttonset('destroy');
		this.$DaisyChainSelector.buttonset();
	},
	addDaisyChainButtons: function(){
		// The Selector between Polaroid and Screen
		this.$DaisyChainSelector = $('<div></div>').attr({id:'slideShowDaisyChain'});
		this.$DaisyChainSelector.append($('<label></label>').attr({'for': 'slideShowDaisyChainYes'}).html(_e('yes')));
		this.$DaisyChainSelector.append($('<input></input>').attr({
			id:'slideShowDaisyChainYes',
			type:'radio',
			name:'slideShowDaisyChain'
		}));
		this.$DaisyChainSelector.append($('<label></label>').attr({'for': 'slideShowDaisyChainNo'}).html(_e('no')));
		this.$DaisyChainSelector.append($('<input></input>').attr({
			id:'slideShowDaisyChainNo',
			type:'radio',
			name:'slideShowDaisyChain'
		}));

		this.addLine(this.$optTable, _e('daisychainimagery'), this.$DaisyChainSelector);
		this.$DaisyChainSelector.buttonset();
		this.updateDaisyChain();

		var me = this;
		this.$DaisyChainSelector.children().on('click', function(){
				me.pSSCTRL.setDaisyChain($(this).attr('id') == 'slideShowDaisyChainYes');
		});

		if(!this.pSSCTRL.canDaisyChain()){
			this.disableDaisyChain();
		}
	},
	updateLoop: function(){
		if(this.pSSCTRL.bLoop){
			this.$LoopSelector.find('#slideShowLoopNo').prop('checked', false);
			this.$LoopSelector.find('#slideShowLoopYes').prop('checked', true);
		}
		else{
			this.$LoopSelector.find('#slideShowLoopYes').prop('checked', false);
			this.$LoopSelector.find('#slideShowLoopNo').prop('checked', true);
		}
		this.$LoopSelector.buttonset('destroy');
		this.$LoopSelector.buttonset();
	},
	addLoopButtons: function(){
		// The Selector between Polaroid and Screen
		this.$LoopSelector = $('<div></div>').attr({id:'slideShowLoop'});
		this.$LoopSelector.append($('<label></label>').attr({'for': 'slideShowLoopYes'}).html(_e('yes')));
		this.$LoopSelector.append($('<input></input>').attr({
			id:'slideShowLoopYes',
			type:'radio',
			name:'slideShowLoop'
		}));
		this.$LoopSelector.append($('<label></label>').attr({'for': 'slideShowLoopNo'}).html(_e('no')));
		this.$LoopSelector.append($('<input></input>').attr({
			id:'slideShowLoopNo',
			type:'radio',
			name:'slideShowLoop'
		}));

		this.$LoopSelector.buttonset();
		this.updateLoop();
		var me = this;
		this.addLine(this.$optTable, _e('loopqm'), this.$LoopSelector);

		this.$LoopSelector.children().on('change', function(){
			me.pSSCTRL.setLoop($(this).attr('id') == 'slideShowLoopYes');
		});
	},
	updateTransitionMode : function(){
		if(this.pSSCTRL.eTransition == TSlideShowTransition.Zoom){
			this.$TransitionModeSelector.find('#slideShowTransitionModeNone').prop('checked', false);
			this.$TransitionModeSelector.find('#slideShowTransitionModePan').prop('checked', false);
			this.$TransitionModeSelector.find('#slideShowTransitionModeZoom').prop('checked', true);
		}
		else if(this.pSSCTRL.eTransition == TSlideShowTransition.Pan){
			this.$TransitionModeSelector.find('#slideShowTransitionModeNone').prop('checked', false);
			this.$TransitionModeSelector.find('#slideShowTransitionModeZoom').prop('checked', false);
			this.$TransitionModeSelector.find('#slideShowTransitionModePan').prop('checked', true);
		}
		else if(this.pSSCTRL.eTransition == TSlideShowTransition.None){
			this.$TransitionModeSelector.find('#slideShowTransitionModeNone').prop('checked', true);
			this.$TransitionModeSelector.find('#slideShowTransitionModeZoom').prop('checked', false);
			this.$TransitionModeSelector.find('#slideShowTransitionModePan').prop('checked', false );
		}
		this.$TransitionModeSelector.buttonset('destroy');
		this.$TransitionModeSelector.buttonset();
	},
	addTransitionMode: function(){
		// The Selector between Polaroid and Screen
		this.$TransitionModeSelector = $('<div></div>').attr({id:'slideShowTransitionMode'});
		this.$TransitionModeSelector.append($('<label></label>').attr({'for': 'slideShowTransitionModeZoom'}).html(_e('zoom')));
		this.$TransitionModeSelector.append($('<input></input>').attr({
			id:'slideShowTransitionModeZoom',
			type:'radio',
			name:'slideShowTransitionMode'
		}));
		this.$TransitionModeSelector.append($('<label></label>').attr({'for': 'slideShowTransitionModePan'}).html(_e('pan')));
		this.$TransitionModeSelector.append($('<input></input>').attr({
			id:'slideShowTransitionModePan',
			type:'radio',
			name:'slideShowTransitionMode'
		}));
		this.$TransitionModeSelector.append($('<label></label>').attr({'for': 'slideShowTransitionModeNone'}).html(_e('none')));
		this.$TransitionModeSelector.append($('<input></input>').attr({
			id:'slideShowTransitionModeNone',
			type:'radio',
			name:'slideShowTransitionMode'
		}));
		this.$TransitionModeSelector.buttonset();
		this.updateTransitionMode();
		this.addLine(this.$optTable, _e('slideshowtransition'), this.$TransitionModeSelector);

		var me = this;
		this.$TransitionModeSelector.children().on('change', function(){
			if($(this).attr('id') == 'slideShowTransitionModeZoom')
				me.pSSCTRL.setTransition(TSlideShowTransition.Zoom);
			else if($(this).attr('id') == 'slideShowTransitionModePan')
				me.pSSCTRL.setTransition(TSlideShowTransition.Pan);
			else
				me.pSSCTRL.setTransition(TSlideShowTransition.None);
		});
	},
	addLinksSection: function(){
		var me = this;
		this.$linkSection = $('<fieldset />').appendTo(this.$panelC).append($('<legend/>').html(_e('linkedimagery')));
		// Add the Add To Linked Imagery
		this.$addToLinked = $('<div />').html(_e('addcurrentimagery')).appendTo(this.$linkSection).button();
		this.$addToLinked.on(mousetouchdown_event(), function(e){
				var pInfo = new TSlideShowLinkedImageryInfo();
				pInfo.Caption = me.appController.project.name;
				pInfo.URL = me.appController.getURL();
				me.pSSCTRL.addLinkedImagery(pInfo);
		});

		this.$linkedListCTNR = $("<ol />").attr({'id':'SlideShowLinkedImageryList'}).appendTo(this.$linkSection);
	},
	disableDaisyChain:function(){
		if((this.$DaisyChainSelector != undefined) && (this.$DaisyChainSelector != null)){
			this.$DaisyChainSelector.buttonset('option','disabled', true);
			this.$DaisyChainSelector.closest('tr').find('.lineCaption').addClass('lineCaptionDisabled');
		}
	},
	enableDaisyChain:function(){
		this.$DaisyChainSelector.buttonset('option','disabled', false);
		this.$DaisyChainSelector.closest('tr').find('.lineCaption').removeClass('lineCaptionDisabled');
	},
	addLinkedImageryItem: function(pLImg){
		var $lItem = $('<li />').attr('linkedimguid', pLImg.UID);
		var $deleteX = $("<div />").html('x').addClass('slideShowDeleteX').appendTo($lItem);
		var $caption = $('<span />').html(pLImg.Caption).appendTo($lItem);
		this.$linkedListCTNR.append($lItem);
		this.fitContentHeight();
	},
	removeLinkedImageryItem: function(pLImg){
		//this.$linkedListCTNR.find('[linkedimguid='+ pLImg.UID+']').remove();
		$('.deleteme').remove();
		this.fitContentHeight();
	},
	addInfoPullOut: function(){
		var me = this;
		this.$infoIcon = $('<img />').attr({'src':'images/i_info_icon.png', 'id':'slideShowInfoIcon'}).appendTo(this.$panelC);
		this.$infoIcon.on(mousetouchdown_event(),function(){
			me.$infoPanel.toggle();
			me.fitContentHeight();
		});

		this.$infoPanel = $('<div />').attr({'id':'slideShowInfoPanel'}).appendTo(this.$panelC);
		$('<p/>').html(_e('slideshowkeysintro')).appendTo(this.$infoPanel);
		this.$infoTable = $('<table />').appendTo(this.$infoPanel);
		this.addLine(this.$infoTable, '<span class="slideShowKey">Enter</span>',_e('slideshowkeyenter'));
		this.addLine(this.$infoTable, '<span class="slideShowKey">ESC</span>',_e('slideshowkeyesc'));

	}
});
