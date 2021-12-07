TATLASFooter = TUIElement.extend({
	init: function (pAppsCTRL){
		this.$blendingButton = null;
		this.viewWidget = null;

		this.magForm = null;
		this._super();
		this.$e = null;
		this.AppsCTRL = pAppsCTRL;
		var me = this;
		this.buildHTML();
		this.vpInfo = null;

		// Add the VP Info Widget
		if(!G_MUSEUM_OF_NATURE){
			this.vpInfo  = new TViewportInfo(me.AppsCTRL.ATLASViewportController);
			me.addWidget(this.vpInfo);
		}

		if(G_DEBUG){
			this.viewWidget = new TATLASViewWidget(this.AppsCTRL, this.$widgetCTNR);
		}
		this.registerEvents();

		this.adjustViewWidgetWidth();
	},
	shutDown: function(){
		var me = this;
		this.$e.remove();
		if(this.viewWidget != null)
			this.viewWidget.shutDown();

		this.magForm.shutDown();
		if(this.vpInfo != null)
			this.vpInfo.shutDown();
	},
	reset: function(){

	},
	adjustViewWidgetWidth: function(){
		if(this.viewWidget == null) return true;

		var w1 = $('#ViewportInfo').outerWidth();
		var w2 = $('#FooterLeftInfo').outerWidth();
		var logoW = $('#FooterLogo').outerWidth();
		var footerW = this.$e.width();
		vwhWidth = footerW - ( w1 + w2 + logoW + 20); // must add the logo width
		if(this.viewWidget != null){
			this.viewWidget.setSize(vwhWidth, this.$e.outerHeight());
		}
		this.viewWidget.onWindowResize();
	},
	registerEvents: function(){
		var me = this;

		$(window).on('resizestop',function (){
			me.adjustViewWidgetWidth();
		});

		// to make sure the logo shows with respect to the "publisher" in the XML.
		$(this.AppsCTRL).on('onFinalizeLoad', function(){
			me.initHTML();
		});

		$(this.AppsCTRL.ATLASViewportController).on('animationfinishVPC', function(){
			var imgScale = parseFloat(me.AppsCTRL.ATLASViewportController.getImageScale());
		});

		// Register to the OnCheckComplete of the BrowserCheck object
		// disable save image and save fov buttons.
		$(this.AppsCTRL.pBrowserCheck).on('CheckComplete', function(){
			if(!me.AppsCTRL.pBrowserCheck.bCanDrawToCanvasFlag){
				$('#saveFOV').button('destroy');
				$('#saveFOV').remove();
			}

			if(me.$addImgButton != null)
				me.$addImgButton.button('option','disabled', !me.AppsCTRL.pBrowserCheck.bCanDrawToCanvasFlag);
			if (!me.AppsCTRL.pBrowserCheck.bCanDrawToCanvasFlag){
				if(me.viewWidget != null)
					me.viewWidget.shutDown();
				me.viewWidget = null;
			}
		});
		// Slide Show CTRL events
		if(this.AppsCTRL.slideShowController != null){
			$(this.AppsCTRL.slideShowController).on('onStartSlideShow', function(){
				me.hideUI();
			});

			$(this.AppsCTRL.slideShowController).on('onStopSlideShow', function(){
				me.showUI();
			});
		}
	},
	initHTML: function(){
		// show the proper logo
		switch(this.AppsCTRL.project.publisher){
			case 'none':
			break;
			case 'zeiss':
				this.$e.append("<img src='images/zeiss_logo_footer.png' id='FooterLogo' class='ZeissLogoFooter no-select'/>");
			break;
			case 'fibics':
				this.$e.append("<img src='images/fibics_logo_footer.png' id='FooterLogo' class='FibicsLogo no-select'/>");
			break;
			case 'fibicszeiss':
				this.$e.append("<img src='images/zeiss_logo_footer.png' id='FooterLogo' class='ZeissLogoFooter no-select'/>");
				this.$e.append("<img src='images/fibics_logo_large.png' id='FooterLogo' class='FibicsLogo no-select'/>");
			break;
		}
		// resize the view widget
		if(this.viewWidget != null)
			this.viewWidget.setWidth(200);
		if(G_MUSEUM_OF_NATURE){
			this.$LanguageSwitcher.initHTML();
		}
		// do not show the blending button is the channel count is less than 2
		if (this.AppsCTRL.project.getChannelCount() < 2){
			if (this.$blendingButton != null){
				this.$blendingButton.hide();
			}
		}

	},
	buildHTML: function(){
		this.$e = $('<div></div>').attr('id', 'Footer').addClass('no-select');
		$('body').append(this.$e);

		$leftInfo = $('<div></div>').attr('id', 'FooterLeftInfo');
		$leftInfo.append("<img src='images/atlas_title_main.gif' class='ATLASMainTitle' />");
		$leftInfo.append("<span class='ABBVCaption'>" + _e('browserbasedviewer')+ "<br>");
		$leftInfo.append($("<div></div>").attr('id', 'FooterLeftButtonsCTNR'));

		this.$e.append($leftInfo);
		this.$widgetCTNR = $('<div id="FooterWidgetCTNR" class="WidgetCTNR"></div>');
		this.$e.append(this.$widgetCTNR);
		var theFooter = this;

		// Add the buttons in the footer
		this.$leftButtonCTRN = this.$e.find('#FooterLeftButtonsCTNR');
		$('<div></div>').attr({'class':'button southWestHint',
			id:'goTo100percentScale',
			title:_e('setimagetoscaleto100%')
		}).html('1:1').appendTo(this.$leftButtonCTRN);

		$('#goTo100percentScale').button();

		$('#goTo100percentScale').on(TouchMouseEvent.DOWN, function(e){  // former click
			theFooter.AppsCTRL.ATLASViewportController.setViewMaxZoom();
		});

		$('<div></div>').attr({
			'class':'button southWestHint',
			id:'fitDataToScreen',
			title:_e('fittoscreen')
			}).appendTo(this.$leftButtonCTRN);

		$('#fitDataToScreen').button();
		$('#fitDataToScreen').on(TouchMouseEvent.DOWN, function(){   // former click
			theFooter.AppsCTRL.ATLASViewportController.fitToView();
		});
		// Save FOV Button
		if((!g_isMobile) && (!G_MUSEUM_OF_NATURE)){

			if(G_DEBUG){
				//should be shown only if Vp count > 1
				this.addDisplayModeButton();
				this.addSaveFOVButton();
			}
		}

		if((G_DEBUG) && (!g_isMobile))
			this.addSaveImgButton();

		var vpModeCTRL = new TViewportModeControl(this.AppsCTRL.ATLASViewportController);
		vpModeCTRL.$e.appendTo(this.$leftButtonCTRN);
		this.magForm = new TMagCalibrationForm(this.AppsCTRL);

		if(G_MUSEUM_OF_NATURE){
			this.$LanguageSwitcher = new TLanguageSwitcher();
			this.$LanguageSwitcher.appendTo(this.$leftButtonCTRN);
		}
		if(G_DEBUG){
			// Blending
			this.$blendingButton = $('<div></div>').attr({'id': 'toggleBlendingWidget'}).html(_e('blending')).appendTo(this.$leftButtonCTRN);
			this.$blendingButton.button();
			this.$blendingButton.on(TouchMouseEvent.DOWN, function(){
				theFooter.AppsCTRL.blendingWidget.toggle();
			});
		}
		var btC2ndRow = $('<div></div>').attr({'id': 'footerButtonSecondRow'}).appendTo(this.$leftButtonCTRN);
	},
	addSaveFOVButton: function(){
		// save FOV button
		var theFooter = this;
		$('<div></div>').attr({
			'class':'button southWestHint',
			id:'saveFOV',
			title:_e('savecurrentfov')
		}).html(_e('savefov')).appendTo(this.$leftButtonCTRN);
		$('#saveFOV').button();
		$('#saveFOV').on(TouchMouseEvent.DOWN, function(){  // former click
			// populate the properties of the saveimage form so that it knows what to do.
			$('#savedImageForm').attr({
				'fovx': theFooter.AppsCTRL.ATLASViewportController.getBoundsUm().x,
				'fovy': theFooter.AppsCTRL.ATLASViewportController.getBoundsUm().y,
				'fovwidth': theFooter.AppsCTRL.ATLASViewportController.getBoundsUm().width,
				'fovheight': theFooter.AppsCTRL.ATLASViewportController.getBoundsUm().height,
				'pixelwidth': theFooter.AppsCTRL.ATLASViewportController.getDisplayDim().width,
				'pixelheight': theFooter.AppsCTRL.ATLASViewportController.getDisplayDim().height
			});
			$('#savedImageForm').dialog('open');
		});
	},
	addDisplayModeButton: function(){
		var theFooter = this;
		this.$displayModeBS = $("<div></div>").attr('id', 'ATLASViewportDisplayModeChanger').appendTo(this.$leftButtonCTRN);
		var checked = '';
		if (this.AppsCTRL.ATLASViewportController.displayMode == 'synch')
			 checked = ' checked=checked ';
		this.$displayModeBS.append("<input type='radio'  " +checked + " value='synch' id='DisplayModeSynch' name='DisplayMode' /><label for='DisplayModeSynch' class='button'>"+ _e('synch') + "</label>");
		var checked = '';
		if (this.AppsCTRL.ATLASViewportController.displayMode == 'continuum')
			 checked = ' checked=checked ';

		this.$displayModeBS.append("<input type='radio' " +checked + " value='continuum' id='DisplayModeContinuum' name='DisplayMode' /><label for='DisplayModeContinuum' class='button' >"+ _e('continuum') + "</label>");
		this.$displayModeBS.buttonset();

		$('#ATLASViewportDisplayModeChanger').children().on(TouchMouseEvent.DOWN, function(e){			  // former click
			var aMode = $('#' + $(this).attr('for')).val();
			theFooter.AppsCTRL.ATLASViewportController.setDisplayMode(aMode);
			return false;
		});

	},
	addSaveImgButton: function(){
		var theFooter = this;
		// add image button
		this.$addImgButton = $('<div></div>').attr({
			'class':'button southWestHint',
			id:'addAtlasImg',
			title:_e('addviewhint')
		}).html(_e('addview')).appendTo(this.$leftButtonCTRN);
		this.$addImgButton.button();

		this.$addImgButton.on(TouchMouseEvent.DOWN, function(){
			// add the current view to the view controller.
			var x = theFooter.AppsCTRL.ATLASViewportController.getCenterUm().x;
			var y = theFooter.AppsCTRL.ATLASViewportController.getCenterUm().y;
			var w = theFooter.AppsCTRL.ATLASViewportController.getFOVDim().width;
			var h = theFooter.AppsCTRL.ATLASViewportController.getFOVDim().height;
			var vName = _e('view') + ' ' + (theFooter.AppsCTRL.viewController.viewList.length + 1);
			var zoomLevel = theFooter.AppsCTRL.ATLASViewportController.getZoomLevel();
			var aView = new TATLASView(x, y, w, h, vName, '', zoomLevel);
			theFooter.AppsCTRL.viewController.addView(aView);
		});

	},
	addControl: function($HTML){
		$HTML.appendTo(this.$controlsCTNR).wrap($('<div class="FooterCTRLPadding"></div>'));
	},
	addWidget: function(aWidget){
		this.$widgetCTNR.append(aWidget.$e);
	},
	hideUI: function(){
		this._super();
		var h = $(window).height() - this.getHeight();
		var w = $(window).width();
		this.AppsCTRL.ATLASViewportController.resizeViewports(w, h);
	},
	showUI: function(){
		this._super();
		var h = $(window).height() - this.getHeight();
		var w = $(window).width();
		this.AppsCTRL.ATLASViewportController.resizeViewports(w, h);
		this.adjustViewWidgetWidth();
	},
	getHeight: function(){
		if(this.visible)
			return this.$e.outerHeight();
		else
			return 0;
	}
});
