TSavePanel = TBaseWidget.extend({
	init: function(pAppC){
		this._super(pAppC);
		this.icone = 'save_icon.png';
		this.title = _e('saveandload');
		this.hint = _e('saveandload');
		this.id = 'SaveLoadWidget';
		this.buildHTML();
	},
	buildHTML : function(){
		this._super();
	},
	buildPanel: function(){
		this._super();
		this.$panelC.append($("<div />").attr({'id':'saveLoadButtonCTNR'}));
		this.$saveButton = $("<div />").html('save').button();
		this.$panelC.find('#saveLoadButtonCTNR').append(this.$saveButton);
		this.$loadButton = $("<div />").html('load').button();
		this.$panelC.find('#saveLoadButtonCTNR').append(this.$loadButton);
		var sp = this;
		// hook the callbacks on the buttons
		this.$saveButton.click(function(){
			if(sp.appController.sessionSerializer.saveToSession()){
				jMessage(_e('successfullysavedeverything'));
			}
			else
				jAlert(_e('errorwhilesavingeverything'));
		});
		this.$loadButton.click(function(){
			if(sp.appController.sessionSerializer.loadFromSession()){
				jMessage(_e('successfulload'));
			}
			else
				jAlert(_e('errowhileloading'));
		});

		// add the explanation
		this.$explanationFS = $("<fieldset/>").append($('<legend />').html(_e('aboutsaveload')));
		this.$panelC.append(this.$explanationFS);

		this.$explanationFS.append($('<p />').html(_e('usebrowserstorage')));
		this.$explanationFS.append($('<p />').html(_e('saveloadconsequence1') +'<ul><li>' + _e('saveloadconsequence2') + '</li><li>' + _e('saveloadconsequence3') + '</li></ul>'));

		sDataURL = GetURLParameter(G_SAVETOFILE_ACTIVATOR);
		if(sDataURL){
			this.buildSaveXMLPanel();
		}

	},
	buildSaveXMLPanel: function(){
		this.$saveDiv = $('<fieldset/>').appendTo(this.$panelC);
		this.$saveDiv.append($('<legend/>').html(_e('savetofile')));
		this.serialButton = $('<div><div>').html(_e('generate')).attr('id', 'testSerializer').button();
		this.instructionButton = $('<div><div>').html('instructions').attr('id', 'instructions').button();
		this.$saveDiv.append(this.serialButton);
		this.$saveDiv.append(this.instructionButton);


		// blob export-xml
		this.downloadButton = $('<div><div>').html(_e('savetofile')).attr('id', 'downloadXML').button();
		this.$saveDiv.append(this.downloadButton);
		// blob load-from-file-xml, hack used to hide fileselector
		this.FileSelector = $('<div><div>').html('<input type="file" id="loadFromXMLFS" name="file" style="position:absolute;display:block;width:0;height:0;z-index:-9999;cursor:none" />').button();
		this.FileSelectButton = $('<div><div>').html(_e('loadfromfile')).attr('id', 'loadFromXML').button();
		this.FileSelector.css({ opacity: 0 });
		this.$saveDiv.append(this.FileSelectButton);
		this.$saveDiv.append(this.FileSelector);


		$('<textarea />').attr({'id': 'xmlstr', 'col':60, 'line':10}).appendTo(this.$saveDiv);
		var me = this;
		this.serialButton.click(function(){
			$xml = $('<xml />');
			me.appController.project.toXML($xml);
			me.appController.measurementController.serializer.saveToXML($xml.find('Project'));
			me.appController.waypointController.serializer.saveToXML($xml.find('Project'));
			me.appController.viewController.serializer.saveToXML($xml.find('Project'));
			var projStr = "var g_sProjectData = '" + XMLToString($xml[0]) + "';";
			$('#xmlstr').val(projStr);
		});
		this.downloadButton.click(function(){
			$xml = $('<xml />');
			me.appController.project.toXML($xml);
			me.appController.measurementController.serializer.saveToXML($xml.find('Project'));
			me.appController.waypointController.serializer.saveToXML($xml.find('Project'));
			me.appController.viewController.serializer.saveToXML($xml.find('Project'));
			var rawXMLData = XMLToString($xml[0]);
			var projStr = "var g_sProjectData = '" + rawXMLData + "';";
			saveAs(new Blob([projStr], {type: "application/javascript;charset=" + document.characterSet}), "projectdata.js");
		});
		this.FileSelectButton.click(function(){
			$('#loadFromXMLFS').focus().trigger('click');
		});
		this.FileSelector.change(function(){
			var files = document.getElementById('loadFromXMLFS').files;
			if (!files.length) {
				//jAlert('ERROR: Please select a file!');
				return;
			}

			var f = files[0];
			var reader = new FileReader();

			// If we use onloadend, we need to check the readyState.
			reader.onloadend = function(evt) {
				if (evt.target.readyState == FileReader.DONE) { // DONE == 2
					var readContent = $.trim(evt.target.result);
					var rawXMLData = readContent.slice(22,-2); //simple slice for now, removes "var g_sProjectData = '", etc.

					//clear current session
					me.appController.measurementController.deleteAllMeasurement();
					me.appController.waypointController.deleteAllWaypoint();
					me.appController.viewController.deleteAllView();

					//load data into app
					me.appController.measurementController.serializer.loadFromXML($($.parseXML(rawXMLData)));
					me.appController.waypointController.serializer.loadFromXML($($.parseXML(rawXMLData)));
					me.appController.viewController.serializer.loadFromXML($($.parseXML(rawXMLData)));
				}
			};

			reader.readAsText(f);
		});
		this.instructionButton.click(function(){
			var $instDiv = $("<div/>");
			$instDiv.append($('<p/>').append('The instructions below will allow to incorporate into the project file the annotations, waypoints and views for a given export.'));
			$steps = $('<ol/>').appendTo($instDiv);
			$steps.append($('<li/>').html('Add to the current project all the information to be saved.'));
			$steps.append($('<li/>').html('Locate the projectdata.js file in the data/ folder where your export lives.'));
			$steps.append($('<li/>').html('Click the "' + _e('generate') + '" button.'));
			$steps.append($('<li/>').html('Click anywhere inside the text box with all the new code.'));
			$steps.append($('<li/>').html('Press CTRL + A'));
			$steps.append($('<li/>').html('Press CTRL + C'));
			$steps.append($('<li/>').html('Open the projectdata.js in a text editor like notepad.'));
			$steps.append($('<li/>').html('Press CTRL + A'));
			$steps.append($('<li/>').html('Press CTRL + V'));
			$steps.append($('<li/>').html('Save and close the projectdata.js.'));
			$steps.append($('<li/>').html('Reload the current page.'));





			jAlert($instDiv.html(),'Instructions to save to file');
			$instDiv.append();
		});
	},
});
