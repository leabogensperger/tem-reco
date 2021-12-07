TExportInfoWidget = TBaseWidget.extend({
	init: function(pAppC){

		this.ChannelsTab = null;
		this.$tab = null;
		this.$ExportedInstanceHeader = null;
		this._super(pAppC);

		this.icone = 'info_i.png';
		this.title = _e('information');
		this.hint = _e('information');
		this.id = 'MosaicInfoWidget';
		this.buildHTML();
		this.previousCaption = '';
		this.tabCount = 0;

		var me = this;
		$(this.appController).on('onFinalizeLoad', function(){
				me.populateInfo();
				for(var i = 0; i < me.appController.project.pExportedInstances.length; i++){
					var pExpInst = me.appController.project.pExportedInstances[i];
					for(var j = 0; j < pExpInst.pChannelList.length; j++){
						var pCT = new TChannelTab(pExpInst.pChannelList[j], pExpInst, me.appController);
						pCT.$e.appendTo(me.ChannelsTab);
						me.$ExportedInstanceHeader.append($('<li></li>').append($('<a></a>').attr({'href': '#' + pCT.id}).html(pCT.caption)));
						//me.populateExportedInstanceInfo(me.appController.project.pExportedInstances[i]);
					}
				}
				me.ChannelsTab.tabs();
		});

		$(this.appController).on('onResetApp', function(){
				me.clearFields();
		});
	},
	buildHTML : function(){
		var me = this;
		this._super();
		this.$projectInfoDiv = $('<div></div>').attr({'id':'projectInfoDiv'}).appendTo(this.$panel.find('.wContentPadding'));

		// Add the project info section
		this.$projectFS = $('<fieldset></fieldset>').appendTo(this.$projectInfoDiv);
		this.$projectFS.append($('<legend></legend>').attr({'id':'ProjectInfoName'}));
		this.$projectFS.append($('<span></span>').attr({'id':'ProjectInfoDescription'}));

		// Add the exported Instances Tabs
		this.ChannelsTab = $('<div></div>').attr({'id':'exportedInstancesTab'}).appendTo(this.$panel.find('.wContentPadding'));
		this.$ExportedInstanceHeader = $('<ul></ul>').appendTo(this.ChannelsTab);

		// Add an event handler to the ACController
		$(this.appController.ATLASViewportController).on('onAddATLASViewport', function(event, avp){
			//	me.tabCount++;
		});
	},

	buildForms: function(){
		this._super();
	},
	populateInfo: function(){
		var ds = this.appController.ATLASViewportController.getDetectors();

		aInfo = this.appController.project.ATLASInfo;
		this.$panel.find('#ProjectInfoName').html(this.appController.project.name);
		this.$panel.find('#ProjectInfoDescription').html(this.appController.project.description);

  	return true;
	},
	addRow: function(aCaption, anID, aVal, $theTable){
		otherClass = '';
		if( aCaption == this.previousCaption){
			otherClass = ' noTopLine'
			aCaption = '';
		}
		var aRow = $('<tr></tr>').addClass('miInfoRow' + otherClass).append($('<td></td>').addClass('miInfoCaption').html(aCaption)).append(
				$('<td></td>').addClass('miInfoValue').attr('id', anID).html(aVal));
		$theTable.append(aRow);
		this.previousCaption = aCaption;
	},
	clearFields: function(){
		if (this.$tab == null) return false;
		this.$tab.find('li').remove();
		this.$tab.find('.ui-tabs-panel').remove();
		this.$header.html('');
		this.$tab.tabs('refresh');
	},
	addProjectInfo: function(){

	},
	// list all the parameter exported for a given channel.
	populateExportedInstanceInfo: function(pC){
		// Add the Export Info of the ExportedInstance
		// right now only one exported instances is supported.
		if(pC != null){
			var $t = this.ChannelsTab.find('table');
			if ((pC.pExportInfoSet != null) && (pC.pExportInfoSet != undefined)){
				for(var j = 0; j < pC.pExportInfoSet.infoList.length; j++){
					pC.pExportInfoSet.infoList[j].appendTo($t);
				}
			}
		}
	}
});

TChannelTab = Class.extend({
	init: function(pChannel, pExpInst, pApp){
		this.pChannel = pChannel;
		this.pExpInst = pExpInst;
		this.appController = pApp;
		this.id = 'ChannelTab' + this.pChannel.uid;
		this.$e = null;
		this.caption = pChannel.sAlias;
		this.buildHTML();
	},
	buildHTML: function(){
		// Add the tab container
		this.$e = $('<div></div>').attr({'id': this.id});

		this.$e.append($('<table></table>'));
		this.addRow(_e('detector'), 'miDetector', this.pChannel.sAlias, this.$e.find('table'));

		// is visible or not
		var $visibleCheckBox = $('<input />').attr({'type': "checkbox",
								 'checked':'checked',
								 'class': 'ChannelVisibleCheckBox',
								 'uid': this.pChannel.uid,
								 'id':'ChannelVisible' + this.pChannel.uid});

		var me = this;
		$visibleCheckBox.click(function(e){
			var avp = me.appController.ATLASViewportController.getATLASViewportWithID($(this).attr('uid'));
			if (avp != null){
				if((!$(this).is(':checked'))
						&& (me.appController.ATLASViewportController.getVisibleViewportCount() == 1)){
						jAlert(_e('musthaveonechannelvisible'));
						$(this).prop('checked', true);
				}
				avp.pChannelInfo.isVisible = $(this).is(':checked');
				me.appController.ATLASViewportController.updateViewportVisibleState();
				me.appController.ATLASViewportController.fitViewportSize();
			}
		});

		// now add all the different custom fields of the pExpInstance.
		var i = 0;
		while (i < this.pExpInst.pExportInfoSet.infoList.length){
			var infoItem = this.pExpInst.pExportInfoSet.infoList[i];
			this.addRow(_et(infoItem.caption), i, infoItem.getValueStr(), this.$e.find('table'));
			i++;
		}
		// now add all the different custom fields of the channel
		var i = 0;
		while (i < this.pChannel.pExportInfoSet.infoList.length){
			var infoItem = this.pChannel.pExportInfoSet.infoList[i];
			this.addRow(_et(infoItem.caption), i, infoItem.getValueStr(), this.$e.find('table'));
			i++;
		}

		this.addRow(_e('visibleqm'), 'miVisible', $visibleCheckBox, this.$e.find('table'));
		this.$e.append(this.$e);
	},
	clearHTML: function(){

	},
	// list all the parameter exported for a given channel.
	populateChannelInfo: function(pC, $tab){
		// Add the Export Info of the ExportedInstance
		// right now only one exported instances is supported.
		if(pC != null){
			var $t = $tab.find('table');
			if ((pC.pExportInfoSet != null) && (pC.pExportInfoSet != undefined)){
				for(var j = 0; j < pC.pExportInfoSet.infoList.length; j++){
					pC.pExportInfoSet.infoList[j].appendTo($t);
				}
			}
		}
	},
	addChannelTab: function(pChannelInfo){

	},
	addRow: function(aCaption, anID, aVal, $theTable){
		otherClass = '';
		if( aCaption == this.previousCaption){
			otherClass = ' noTopLine'
			aCaption = '';
		}
		var aRow = $('<tr></tr>').addClass('miInfoRow' + otherClass).append($('<td></td>').addClass('miInfoCaption').html(aCaption)).append(
				$('<td></td>').addClass('miInfoValue').attr('id', anID).html(aVal));
		$theTable.append(aRow);
		this.previousCaption = aCaption;
	}
});
