TATLASWaypointWidget = TBaseWidget.extend({
	init: function(pAppsC){
		this._super(pAppsC);
		var me = this;		
		this.icone = 'waypoints_inv.png';
		this.title = _e('waypoints');
		this.hint = _e('waypoints');
		this.id = 'ATLASWaypointWidget';	
		this.waypointController = pAppsC.waypointController;
		this.ATLASViewportController = pAppsC.ATLASViewportController;
		this.buildHTML();	
		
		// make the panel resizable
		var resizeOpts = { handles: "w",  minWidth: this.$panel.css('width') + 'px'};
		this.$panel.resizable(resizeOpts);		
		
		$(this).on('onPanelHide', function(){
			this.waypointController.setState(TWaypointControllerState.idle);																	 
		});
		
		// set the interval so that the UI elements gets updated
		this.updateInterval = setInterval(function(){
			me.updateUI();
		}, 1000);
		
		var me = this;		
		$(this.waypointController).on('oninit', function(){			
			me.updateHTML();
		});
		$(this.waypointController).on('onSelectWaypoint', function(e, WP){			
			me.selectLine(WP);
			me.populateInfo(WP);
		});
		$(this.waypointController).on('onDeselectWaypoint', function(e, WP){			
			me.saveWaypointInfo();
			me.deselectLines();
			me.clearInfo();
		});
		$(this.waypointController).on('onDeleteWaypoint', function(e, WP){
			me.clearInfo();
			me.removeWaypointFromList(WP);
			// it has to be equal to one since it has not been deleted yet.
			if(me.waypointController.waypointList.length <= 1){				
				$('#deleteAllWaypoint').button('disable');
				$('#toggleAllWaypoint').button('disable');				
			}
			else{
				$('#deleteAllWaypoint').button('enable');
				$('#toggleAllWaypoint').button('enable');
			}
			me.fitContentHeight();
		});
		$(this.waypointController).on('onAddWaypoint', function(e, WP){
			$(WP).on('onChange', function(e, aWP){
				me.populateInfo(aWP);				
			});
			me.addWaypointToList(WP);	
			$('#deleteAllWaypoint').button('enable');
			$('#toggleAllWaypoint').button('enable');
			
			$(WP).on('onSetVisible', function(e, aWP){
				if(!aWP.visible){
					me.$panel.find('li[wpID=' + aWP.uid + ']').find('.toggleWaypoint').attr('src', 'images/waypoints/lightbulb_not.png');
				}
				else if(aWP.visible){
					me.$panel.find('li[wpID=' + aWP.uid + ']').find('.toggleWaypoint').attr('src', 'images/waypoints/lightbulb.png');
				}
			});			
			
			$(WP).on('onSetLocked', function(e, aWP){
				if(!aWP.locked){
					me.$panel.find('li[wpID=' + aWP.uid + ']').find('.lockWaypoint').attr('src', 'images/waypoints/locked_not.png');
				}
				else if(aWP.locked){
					me.$panel.find('li[wpID=' + aWP.uid + ']').find('.lockWaypoint').attr('src', 'images/waypoints/locked.png');
				}				
			});
			
			$(WP).on('onSetCaptionVisible', function(e, aWP){
				if(!aWP.captionVisible){
					me.$panel.find('li[wpID=' + aWP.uid + ']').find('.toggleLabel').attr('src', 'images/waypoints/tag_not.png');
				}
				else if(aWP.captionVisible){
					me.$panel.find('li[wpID=' + aWP.uid + ']').find('.toggleLabel').attr('src', 'images/waypoints/tag.png');
				}				
			});
			me.fitContentHeight();
		});
		loadCSS('css/waypoint.css');		
	},
	shutDown: function(){
		this.$confirmDeleteAllWP.dialog('destroy');
		this.$confirmDeleteAllWP.remove();
	},
	updateUI: function(){
		if(this.waypointController.state == TWaypointControllerState.idle) {
			$('#addWayPointButton').removeAttr('checked').button('refresh');
		}
	},
	saveWaypointInfo: function(){
		var aWP = this.waypointController.getWaypointWithID($('#wpUID').val());
		if((aWP != undefined) || (aWP != null)){
			aWP.description = $('#wpDescription').val();
		}
	},
	buildHTML: function(){		
		this._super();			
	},
	buildPanel : function(){
		this._super();
		var me = this;	
		
		var wpFieldSet = $('<fieldset></fieldset>').attr('id', 'waypointEdition').append($('<legend></legend>').html(_e('details')));
		this.$panelC.append(wpFieldSet);
		// ID
		var aRow = $('<div></div>').addClass('row').append($('<input></input>').attr('id', 'wpIndex').attr('type', 'hidden'));
		wpFieldSet.append(aRow);
		var aRow = $('<div></div>').addClass('row').append($('<input></input>').attr('id', 'wpUID').attr('type', 'hidden'));
		wpFieldSet.append(aRow);
		// Label
		var aRow = $('<div></div>').addClass('row').html($('<label></label>').html(_e('label')).addClass('wpLabel'));
		aRow.append($('<input />').addClass('ptValueCaption').attr({'id': 'wpCaption', 'type':'text'}));
		wpFieldSet.append(aRow);	
		// Position
		var aRow = $('<div></div>').addClass('row').html($('<label></label>').addClass('wpLabel').html(_e('position')));
		wpFieldSet.append(aRow);
		// the edit fields
		var editFieldsDiv = $('<span></span>').attr('id', 'wpEditPosCTNR').appendTo(aRow);
		var editX = $('<input />').attr({'id':'wpXVal', 'type':'text'}).addClass('xyWP').appendTo(editFieldsDiv);
		var editY = $('<input />').attr({'id':'wpYVal', 'type':'text'}).addClass('xyWP').appendTo(editFieldsDiv);
		var editY = $('<span />').attr({'id':'wpXYUnit'}).html('&mu;m').addClass('xyWPUnit').appendTo(editFieldsDiv);
				
		wpFieldSet.find('.xyWP').blur(function(){
			var x = parseFloat($('#wpXVal').val());	
			var y = parseFloat($('#wpYVal').val());				
			wp = me.waypointController.getWaypointWithID($('#wpUID').val());
			if(wp != undefined){
				wp.pt.x = x;
				wp.pt.y = y;			
				me.populateInfo(wp);
			}		
		});
			
		// Description
		var aRow = $('<div></div>').addClass('row').html($('<label></label>').addClass('wpLabel').html(_e('description')));
		wpFieldSet.append(aRow);
		var ta = $('<div></div>').addClass('textAreaWrapper').append($('<textarea></textarea>').attr('id', 'wpDescription').addClass('sTextArea ptValueCaption').attr({'rows':4, 'cols':5, 'index':0}));
		wpFieldSet.append(ta);
		
		// The Controls
		var CTRLCTNR = $('<div></div>').attr('id', 'waypointControlsCTNR');
		this.$panelC.append(CTRLCTNR);	
			
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'addWayPointButton',
			type : 'checkbox'
		});		
		$HMImg = $('<label></label>').attr({'for':'addWayPointButton', 'class':'measurementButton'}).html(_e('addpoint'));
		
		CTRLCTNR.append($HMImg);
		CTRLCTNR.append($HMbutton);	
		CTRLCTNR.on(TouchMouseEvent.DOWN, 'label[for=addWayPointButton]',  function(){  // former click
			// see if we can add waypoint
			if(me.waypointController.waypointList.length == G_MAX_WAYPOINT_COUNT){
				jAlert(_e('youhavereachedthemaxwaypoints'));
				return false;
			}
			
			if(me.waypointController.state == TWaypointControllerState.createWaypoint)
				me.waypointController.setState(TWaypointControllerState.idle);
			else	
				me.waypointController.setState(TWaypointControllerState.createWaypoint); 
		});	
		
		// Delete Point
		CTRLCTNR.append($('<div></div>').attr('id', 'deleteAllWaypoint').addClass('button southEastHint nonSelect').attr('title', _e('deleteallwaypoints')).html(_e('deleteall')));
		CTRLCTNR.find('#deleteAllWaypoint').on(TouchMouseEvent.DOWN, function(){  // former click
			$('#confirmDeleteAllWayPoints').dialog('open');			
		});
		// Show / Hide Point
		CTRLCTNR.append($('<input></input>').attr('id', 'toggleAllWaypoint').attr('type', 'checkbox').addClass('button stateButton nonSelect'));
		CTRLCTNR.append($('<label></label>').attr('for', 'toggleAllWaypoint').html(_e('hideall')).attr({'title':_e('showhideallwaypoints'), 'id':'toggleWaypointLabel'}));
		CTRLCTNR.find('#toggleWaypointLabel').on(TouchMouseEvent.DOWN, function(){  // former click
			if(me.waypointController.displayAllWaypoint){
				me.waypointController.hideAllWaypoint();
				incDisplayChangeCount();
				$('#toggleAllWaypoint').button('option', 'label', _e('showall'));
			}
			else if(! me.waypointController.displayAllWaypoint){
				me.waypointController.showAllWaypoint();
				incDisplayChangeCount();
				$('#toggleAllWaypoint').button('option', 'label', _e('hideall'));
			
			}
		});		
	
		CTRLCTNR.find('.button').button();
		CTRLCTNR.find('#deleteAllWaypoint').button('disable');
		CTRLCTNR.find('#toggleAllWaypoint').button('disable');
		
		var wpFieldSet = $('<fieldset></fieldset>').append($('<legend></legend>').html(_e('waypointlist')));
		wpFieldSet.append($("<ul></ul>").attr('id', 'waypointList'));
		this.$panelC.append(wpFieldSet);
		
		// Add the events delegation for the buttons on the WPList
		this.$panel.find('#waypointList').on(TouchMouseEvent.DOWN, '.deleteWayPoint', function(e){
			var wp = me.waypointController.getWaypointWithID($(this).closest('li').attr('wpID'));
			me.waypointController.deleteWaypoint(wp);
		});
		this.$panel.find('#waypointList').on(TouchMouseEvent.DOWN, '.goToWayPoint', function(e){
			var wp = me.waypointController.getWaypointWithID($(this).closest('li').attr('wpID'));
			me.ATLASViewportController.setCenter(wp.pt);
			me.waypointController.deselectAllWaypoint();
			me.waypointController.selectWaypoint(wp);
			wp.setVisible(true);
		});
		
		this.$panel.find('#waypointList').on(TouchMouseEvent.DOWN, '.toggleWaypoint', function(e){
			var wp = me.waypointController.getWaypointWithID($(this).closest('li').attr('wpID'));
			if(wp.visible){
				wp.setVisible(false);
			}
			else if(!wp.visible){
				wp.setVisible(true);
			}
		});

		this.$panel.find('#waypointList').on(TouchMouseEvent.DOWN, '.lockWaypoint', function(e){
			var wp = me.waypointController.getWaypointWithID($(this).closest('li').attr('wpID'));
			if(wp.locked){
				wp.setLocked(false);
			}
			else {
				wp.setLocked(true);
			}
		});
		
		this.$panel.find('#waypointList').on(TouchMouseEvent.DOWN, '.toggleLabel', function(e){
			var wp = me.waypointController.getWaypointWithID($(this).closest('li').attr('wpID'));
			if(wp.captionVisible){
				wp.setCaptionVisible(false);
			}
			else if(!wp.captionVisible){
				wp.setCaptionVisible(true);
			}
		});
			
		this.$panel.on('blur', '#wpDescription', function(){
			var wp = me.waypointController.getWaypointWithID($(this).attr('wpID'));
			if(wp == undefined) return false;
			wp.description = $(this).val();
			wp.setCaptionVisible(true);
		});
		
		this.$panel.on('blur', '#wpCaption', function(){
			wp = me.waypointController.getWaypointWithID($(this).attr('wpID'));
			wp.caption = $(this).val();
			wp.setCaptionVisible(true);
			me.populateInfo(wp);
		});
		
		this.$panel.on('keydown', '#wpCaption', function(e){
			if(e.which == 13){
				wp = me.waypointController.getWaypointWithID($(this).attr('wpID'));
				wp.caption = $(this).val();
				wp.setCaptionVisible(true);
				me.populateInfo(wp);
			}
		});
							
		this.addForms();
	},
	addForms: function(){
		var me = this;
		this.$confirmDeleteAllWP = $('<div></div>').attr({
			id:'confirmDeleteAllWayPoints',
			title:_e('deleteallwaypoints'),
			'class':'aDialog'
		}).html('<p>'+ _e('pleaseconfirmbeforedeletingwaypoint') +'</p>');
		
		$('body').append(this.$confirmDeleteAllWP);		
		
		this.$confirmDeleteAllWP.dialog({autoOpen:false,
			modal:true,
			show: "fade",
			hide: "fade",
			resizable:false, 
			closeOnEscape:false,
			buttons: {'OK' : function(){
					me.waypointController.deleteAllWaypoint();
					$(this).dialog('close');
				},
				'Cancel':function(){
					$(this).dialog('close');
				}}});	
		
	},
	updateHTML: function(){
		
	},
	populateInfo: function(wp){
		this.$panel.find('#wpIndex').val(wp.index);
		this.$panel.find('#wpUID').val(wp.uid);	
		this.$panel.find('#wpCaption').val(wp.caption).attr('wpID', wp.uid);	
		this.$panel.find('#wpXVal').val(wp.pt.x.toFixed(2));
		this.$panel.find('#wpYVal').val(wp.pt.y.toFixed(2));		
		
		var labelToDisplay = _e('undefined');
		if(wp.caption != ''){
			labelToDisplay = wp.caption;			
		}
		
		var linkToDisplay = _e('undefined');
		if(wp.hasExternalLink()){
			linkToDisplay = wp.externalLink;			
		}		
		
		ptCaption =  wp.getLabel() + ':' + wp.caption;
		this.$panel.find('li[wpID='+ wp.uid+']').find('.wpLabelInList').html(ptCaption);
		this.$panel.find('#wpDescription').val(wp.description).attr('wpID', wp.uid);
		
	},
	clearInfo: function(){
		this.$panel.find('#wpIndex').val(null);
		this.$panel.find('#wpUID').val(null);		
		this.$panel.find('#wpXVal').val('');
		this.$panel.find('#wpYVal').val('');		
		this.$panel.find('#wpCaption').val('');
		this.$panel.find('#wpLink').html('');
		this.$panel.find('#wpDescription').val('');
	},
	addWaypointToList: function(wp){
		$wpL = this.$panel.find('#waypointList');
		var me = this;	
		var newLI = $('<li></li>');
		newLI.attr('wpID', wp.uid);
		
		ptCaption =  wp.getLabel() + ':' + wp.caption;
		
		newLI.append($('<span></span>').addClass('label').attr('class', 'wpLabelInList').html(ptCaption).attr('title', _e('doubleclicktogotowaypoint')));
		newLI.append($("<div></div>").addClass('waypointButtons'));
		// Delete Icon...
		var  deleteWayPtImg = $("<img>").attr('src', 'images/waypoints/delete_x.png').addClass('deleteWayPoint deleteX waypointButton').attr('title', _e('deletewaypoint'));
		newLI.find('.waypointButtons').append(deleteWayPtImg);		
	
		//showAllWayPoint();		
		newLI.find('.waypointButtons').append($('<img>').attr('src', 'images/waypoints/sign-out.png').attr('alt', _e('gotowaypoint')).attr('title', _e('gotowaypoint')).addClass('goToWayPoint waypointButton'));
		newLI.find('.waypointButtons').append($('<img>').attr('src', 'images/waypoints/lightbulb.png').attr('alt', _e('showhidewaypoint')).attr('title', _e('showhidewaypoint')).addClass('toggleWaypoint waypointButton'));
		newLI.find('.waypointButtons').append($('<img>').attr('src', 'images/waypoints/locked_not.png').attr('alt', _e('lockunlockwaypoint')).attr('title', _e('lockunlockwaypoint')).addClass('lockWaypoint waypointButton'));
		var newToggleImg = $('<img>').attr('src', 'images/waypoints/tag.png').attr('alt', _e('showhidelabel')).attr('title', _e('showhidelabel')).addClass('toggleLabel waypointButton');
		newLI.find('.waypointButtons').append(newToggleImg);
		newLI.find('img[title], div.deleteX').tipsy({gravity: 's'});
		newLI.css('display', 'none');
	
		newLI.click(function(){
			var theWP = me.waypointController.getWaypointWithID($(this).attr('wpID'));
			me.populateInfo(theWP);
			me.waypointController.deselectAllWaypoint();
			me.waypointController.selectWaypoint(theWP);			
		});
		newLI.dblclick(function(){
			var theWP = me.waypointController.getWaypointWithID($(this).attr('wpID'));
			me.waypointController.selectWaypoint(theWP);	
			me.ATLASViewportController.setCenter(theWP.pt);
		});
		$wpL.append(newLI);
		newLI.show(100);
	},
	removeWaypointFromList: function(wp){
		this.$panel.find('#waypointList').find("li[wpID=" + wp.uid + "]").hide(100, function(){
			$(this).remove();
		});		
	},
	selectLine: function(wp){
		this.$panel.find('#waypointList').find("li").removeClass('ui-state-active');
		this.$panel.find('#waypointList').find("li[wpID=" + wp.uid + "]").addClass('ui-state-active');
	},
	deselectLines:function(){
		this.$panel.find('#waypointList').find("li").removeClass('ui-state-active');		
	}
});