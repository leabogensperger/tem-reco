TSidebarWidget = TUIElement.extend({
	init: function(appController){
		this._super();
		this.options = {delay:100};
		loadCSS('css/fibics.sidebarwidget.css');
		this.widgetList = new Array();
		this.appController = appController;
		this.buildHTML();
		var me = this;
		this.hideDirection = 'right';
		this.registerEvents();
		this.activePanel = null;
	},
	buildHTML: function(){
		this.$e = $('<div></div>').attr({
			id:'SidebarWidgetCTNR'
		});
		this.$f =  $('<div></div>').attr({
			id:'FormWidgetCTNR'
		});
		this.$e.append($('<div></div>').attr({
			id:'SidebarWidget',
			'class': 'ui-widget-content ui-corner-bl ui-corner-tl'
		}));
		this.$panelCTNR = $('<div></div>').attr({
			'id': 'SideWidgetPanelCTNR'
		});
		this.$e.append(this.$panelCTNR);

		// Mosaic Info
		var MI = new TExportInfoWidget(this.appController);
		this.addWidget(MI);
		// About ATLAS
		var AA = new TATLASInfoWidget(this.appController);
		this.addWidget(AA);
		// Language Widget
		if(!G_MUSEUM_OF_NATURE){
			var LW = new TLanguagePanel(this.appController);
			this.addWidget(LW);
		}

		if(this.appController.pBrowserCheck.bCanvasSupported){
			// The Measurement Panel
			if(!G_MUSEUM_OF_NATURE || G_DEBUG){
				var MP = new TMeasurementWidget(this.appController);
				this.addWidget(MP);
			}
			// The Waypoint Panel
			if(!G_MUSEUM_OF_NATURE || G_DEBUG){
			  var AWP = new TATLASWaypointWidget(this.appController);
			  this.addWidget(AWP);
			}
			// Distance Table
			if(!G_MUSEUM_OF_NATURE || G_DEBUG){
			  var DTW = new TDistanceTableWidget(this.appController, this.AVController);
			  this.addWidget(DTW);
			}
			// Save & Load
			if(!G_MUSEUM_OF_NATURE || G_DEBUG){
			  var SaveP = new TSavePanel(this.appController);
			  this.addWidget(SaveP);
			}
			// Slide Show
			if(!G_MUSEUM_OF_NATURE && G_DEBUG){
			  var SlideShow = new TSlideShowWidget(this.appController);
			  this.addWidget(SlideShow);
			}
			// Application Settings
			if(!G_MUSEUM_OF_NATURE || G_DEBUG){
			  var appS = new TABBVSettingsForm(this.appController);
			  this.addWidget(appS);
			}
		}

		// Debug panel
		if(G_DEBUG){
			var DBP = new TDebugPanel(this.appController);
			this.addWidget(DBP);
		}

		var me = this;
		this.$e.on(mousetouchdown_event(), '.wButton', function(){
			if($(this).attr('popup') == '1') {
				me.getWidget($(this).attr('widgetID')).$form.dialog('open');
				return false;
			}
			var w = me.getWidget($(this).attr('widgetID'));
			var thePanel = w.$panel; //me.$e.find('#' + $(this).attr('panel'));
			// hide the existing panel
			me.$e.find('.wPanel:visible').not(thePanel).hide('slide', {direction: "right"}, me.options.delay, function(){
				aW = me.getWidget($(this).attr('for'));
				$(aW).trigger('onPanelHide');
			});

			if(thePanel.is(':visible')){
				me.hidePanel(thePanel);
			}
			else{
				me.showPanel(thePanel);
			}
		});
	},
	registerEvents: function(){
		var me = this;
		if(this.appController.slideShowController != null){
			$(this.appController.slideShowController).on('onStartSlideShow', function(e){
				me.hideUI();
			});
			$(this.appController.slideShowController).on('onStopSlideShow', function(e){
				me.showUI();
			});
		}

		$(window).on('resize', function(){
			var wh = $(this).height();
			me.$e.css('top', Math.round(wh/8) + 'px');
		});
	},
	shutDown: function(){
		var i = 0;
		while(i < this.widgetList.length){
			this.widgetList[i].shutDown();
			i++;
		}
		this.$e.remove();
	},
	hideAllPanel: function(){
		var me = this;
		this.$e.find('.wPanel:visible').hide('slide',
				 				{ direction: "right"}, me.options.delay, function(){
				 						$('.tipsy').remove();
				 			});
		this.activePanel = null;
	},
	hidePanel: function(aPanel){
		aPanel.hide('slide',{ direction: "right" }, this.options.delay);
		var aW = this.getWidget($(aPanel).attr('for'));
		$(aW).trigger('onPanelHide');
		this.activePanel = null;
	},
	showPanel: function($aPanel){
		var animOpts = {left: '-' + $aPanel.width() + 'px'};
		$aPanel.css('display','block');
		this.activePanel = $aPanel;
		$aPanel.animate(animOpts, this.options.delay);
		var aW = this.getWidget($aPanel.attr('for'));
		aW.fitContentHeight();
		$(aW).trigger('onPanelShow');
	},
	addWidget: function(aW){
		this.widgetList.push(aW);
		var me = this;
		if(aW.popup){
			aW.$form.appendTo(this.$f);
			aW.makeForm();
		}
		else{
			if(aW.$panel != undefined){
				aW.$panel.appendTo(this.$e.find('#SideWidgetPanelCTNR'));
				aW.$panel.hide();
				aW.$panel.addClass('ui-corner-left ui-corner-bottom');
				aW.$panel.find('h3').addClass('ui-widget-header');
				aW.$panel.find('h3').addClass('ui-header-padding');
				aW.$panel.find('h3').addClass('ui-corner-tl');
				aW.$panel.find('h3').append($('<div></div>').addClass('panelCloser').html('&gt;&gt;'));
				aW.$panel.hide('slide',{ direction: "right" }, this.options.delay, function(){});

				// Attach the on click to close the panel
				aW.$panel.find('h3').on(mousetouchdown_event(), function(){  // former click
					$(this).closest('.wPanel').hide('slide',{ direction: "right" }, me.options.delay, function(){

					});
				});
			}
		}
		aW.$button.appendTo(this.$e.find('#SidebarWidget')).wrap($('<div></div>').addClass('wbutton-margin'));
		aW.$button.find('img').addClass('sideWidgetIcon');
	},
	getWidget: function(id){
		var	i = 0;
		while(i < this.widgetList.length){
			if(this.widgetList[i].id == id) return this.widgetList[i];
			i++;
		}
	},
	hideSlide: function(e){
		e.hide('slide',{ direction: "right" }, me.options.delay, function(){});
	},
	showUI: function(){
		this._super();
		if (this.activePanel != null){
			var aW = this.getWidget(this.activePanel.attr('for'));
			if (aW != undefined)
				aW.fitContentHeight();
		}

	}
});
