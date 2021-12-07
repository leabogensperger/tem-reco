TMeasurementWidget = TBaseWidget.extend({
	init: function(pAppC){
		var me = this;
		this._super(pAppC);
		this.measurementController = pAppC.measurementController;
		this.icone = 'um_icon.png';
		this.title = _e('measurementsandannotations');
		this.hint = _e('measurementsandannotations');
		this.id = 'MeasurementWidget';
		this.buildHTML();

		// make sure you can actually save
		$(this.appController.pBrowserCheck).on('CheckComplete', function(e, pBC){
			if (!pBC.bCanDrawToCanvasFlag){
				$('#createExportToPNGImg').remove();
				$('#createExportToPNG').button('destroy');
				$('#createExportToPNG').remove();
				$('#exportFieldSet').remove();
			}
		});

		// make the panel resizable
		var resizeOpts = { handles: "w",  minWidth: this.$panel.css('width') + 'px'};
		this.$panel.resizable(resizeOpts);

		me.pRegionEditor = new TRegionEditor(me.measurementController);

		$(this).on('onPanelHide', function(){
			this.measurementController.setState(TMeasurementControllerState.idle);
		});

		// Register the required Events to the Measurement Controller
		$(this.measurementController).on('onMeasurementSelect', function(e, M){
			if(M.isRegion()){
				me.enabledRegionFields();
				me.populateRegionFields(M);
			}
			else{
				me.disableRegionFields();
				me.clearRegionFields();
			}
		});

		// Register the required Events to the Measurement Controller
		$(this.measurementController).on('onMeasurementDeselect', function(e, M){
				// make sure the latest changed were done on the shape.
				me.updateRegionFromFields(M);
				me.disableRegionFields();
				me.clearRegionFields();
		});

		$(this.measurementController).on('onChangeState', function(e, MC){
			$('.measurementCheckbox').removeAttr('checked').button('refresh');
			switch(MC.state){
				case TMeasurementControllerState.create:
					switch(MC.measurementTypeToCreate){
						case TMeasurementType.line:
							$('#createLine').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.ruler:
							$('#createRuler').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.textannotation:
							$('#createTextAnnotation').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.protractor:
							$('#createProtractor').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.horizontaltool:
							$('#createHMeasurement').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.verticaltool:
							$('#createVMeasurement').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.pointtopoint:
							$('#createPointToPoint').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.rectangulararea:
							$('#createRectangularArea').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.polygonalArea:
							$('#createPolygonalArea').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.ellipticalarea:
							$('#createEllipticalArea').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.ellipseRegion:
							$('#createEllipseRegion').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.exporttopng:
							$('#createExportToPNG').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.rectangleRegion:
							$('#createRectangle').prop('checked', 'checked').button('refresh');
						break;
						case TMeasurementType.ellipseRegion:
							$('#createEllipse').prop('checked', 'checked').button('refresh');
						break;
					}
				break;
			}
		});
	},
	buildHTML : function(){
		this._super();
		this.buildPanelHTML();
	},
	shutDown: function(){
		this._super();
		this.$confirmDeleteAllMeasurements.dialog('destroy');
		this.$confirmDeleteAllMeasurements.remove();
	},
	buildHorizontalButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createHMeasurement',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createHMeasurement', 'class':'measurementButton'}).append($('<img></img>').attr({
			src : 'images/measurements/h_measure_tool.png',
			alt: _e('horizontalmeasurement'),
			'class': 'measurementIcon',
			id: 'createHMeasurementImg',
			mType:2,
			title:_e('horizontalmeasurement')}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
	},
	buildProtractorButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createProtractor',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createProtractor', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/protractor.png',
			alt: _e('protractor'),
			'class': 'measurementIcon',
			mType:5,
			id: 'createProtratorImg',
			title: _e('protractor')
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
	},
	buildVerticalButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createVMeasurement',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createVMeasurement', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/v_measure_tool.png',
			alt: _e('verticalmeasurement'),
			'class': 'measurementIcon',
			id: 'createVMeasurementImg',
			mType:3,
			title: _e('verticalmeasurement')
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
	},
	buildExportToPNGButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createExportToPNG',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createExportToPNG',  'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/export_rect_to_png.png',
			alt: _e('drawareatoexport'),
			title: _e('drawareatoexport'),
			'mType':9,
			id: 'createExportToPNGImg',
			'class': 'measurementIcon'
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
	},
	buildLineButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createLine',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createLine', 'class':'measurementButton'
			}).append($('<img></img>').attr({
			src : 'images/measurements/line_annotation.png',
			alt: _e('line'),
			title: _e('line'),
			id: 'createLineImg',
			'mType':10,
			'class': 'measurementIcon'
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
	},
	buildRulerButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createRuler',
			type : 'checkbox'
		});

		$HMImg = $('<label></label>').attr({'for':'createRuler', 'class':'measurementButton'
			}).append($('<img></img>').attr({
			src : 'images/measurements/ruler_icon.png',
			alt: _e('ruler'),
			id: 'createRulerImg',
			'class': 'measurementIcon',
			title: _e('ruler'),
			'mType':6
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
	},
	buildPointToPointButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createPointToPoint',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createPointToPoint', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/simple_measure.png',
			alt: _e('pointtopointmeasurement'),
			'class': 'measurementIcon',
			title: _e('pointtopointmeasurement'),
			'mType':4
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
	},
	buildTextAnnotationButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createTextAnnotation',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createTextAnnotation', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/annotations_icon.png',
			alt: _e('textannotation'),
			'class': 'measurementIcon',
			title: _e('textannotation'),
			mType:1
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
		$mCTNR.find('#createTextAnnotation').on(TouchMouseEvent.DOWN, function(){  // former click
			me.measurementController.setMeasurementToCreate(TMeasurementType.textannotation);
		});
	},
	buildRectangularAreaButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createRectangularArea',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createRectangularArea', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/rect_area.png',
			alt: _e('rectangulararea'),
			'class': 'measurementIcon',
			mType:7,
			title: _e('rectangulararea')
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
		$mCTNR.find('#createRectangularArea').on(TouchMouseEvent.DOWN, function(){  // former click
			me.measurementController.setMeasurementToCreate(TMeasurementType.rectangulararea);
		});
	},
	buildRectangleButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createRectangle',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createRectangle', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/rectangle.png',
			alt: _e('rectangle'),
			mType:11,
			'class': 'measurementIcon',
			title: _e('rectangle')
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
		$mCTNR.find('#createRectangle').on(TouchMouseEvent.DOWN, function(){  // former click
			me.measurementController.setMeasurementToCreate(TMeasurementType.rectangleRegion);
		});
	},
	buildEllipseButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createEllipseRegion',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createEllipseRegion', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/circle_annotation.png',
			alt: _e('ellipse'),
			mType:12,
			'class': 'measurementIcon',
			title: _e('ellipse')
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
		$mCTNR.find('#createEllipse').on(TouchMouseEvent.DOWN, function(){// former click
			me.measurementController.setMeasurementToCreate(TMeasurementType.ellipseRegion);
		});
	},
	buildEllipticalAreaButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createEllipticalArea',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createEllipticalArea', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/circle_area.png',
			alt: _e('ellipticalarea'),
			id:'createEllipticalAreaImg',
			title: _e('ellipticalarea'),
			mType:8,
			'class': 'measurementIcon'
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);

	},
	buildPolygonButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createPolygon',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createPolygon', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/polygon.png',
			alt: _e('polygon'),
			id: 'createPolygonImg',
			title: _e('polygon'),
			mType: TMeasurementType.polygonRegion,
			'class': 'measurementIcon'
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
	},
	buildPolygonalAreaButton: function($mCTNR){
		var me = this;
		$HMbutton = $('<input></input>').addClass('button measurementButton measurementCheckbox').attr({
			id : 'createPolygonalArea',
			type : 'checkbox'
		});
		$HMImg = $('<label></label>').attr({'for':'createPolygonalArea', 'class':'measurementButton'
		}).append($('<img></img>').attr({
			src : 'images/measurements/polygon_area.png',
			alt: _e('polygonalarea'),
			mType:14,
			'class': 'measurementIcon',
			title: _e('polygonalarea')
		}));
		$mCTNR.append($HMImg);
		$mCTNR.append($HMbutton);
		$mCTNR.find('#createPolygonalArea').on(TouchMouseEvent.DOWN, function(){// former click
			me.measurementController.setMeasurementToCreate(TMeasurementType.polygonalArea);
		});
	},

	buildPanelHTML : function(){
		var me = this;
		this.$mCTNR = $('<div></div>').addClass('measurementTools');
		this.$measFS = $("<fieldset></fieldset>").appendTo(this.$mCTNR);
		this.$measFS.append($('<legend></legend>').html(_e('measurements')));

		this.$exportFS = $("<fieldset></fieldset>").appendTo(this.$mCTNR).attr({'id':'exportFieldSet'});
		this.$exportFS.append($('<legend></legend>').html(_e('export')));

		this.$regionFS = $("<fieldset></fieldset>").appendTo(this.$mCTNR);
		this.$regionFS.append($('<legend></legend>').html(_e('regions')));
		this.$regionButtonCTNR = $('<div></div>').attr({'id':'regionCreateButtonsCTNR'}).appendTo(this.$regionFS);

		this.$panelC.append(this.$mCTNR);
		this.buildHorizontalButton(this.$measFS);
		this.buildVerticalButton(this.$measFS);

		this.buildTextAnnotationButton(this.$measFS);
		this.buildPointToPointButton(this.$measFS);
		this.buildRulerButton(this.$measFS);
		this.buildProtractorButton(this.$measFS);
		this.buildRectangularAreaButton(this.$measFS);
		this.buildEllipticalAreaButton(this.$measFS);
		if (G_DEBUG)
			this.buildPolygonalAreaButton(this.$measFS);
		this.buildRectangleButton(this.$regionButtonCTNR);
		this.buildEllipseButton(this.$regionButtonCTNR);
		this.buildLineButton(this.$regionButtonCTNR);
		this.buildPolygonButton(this.$regionButtonCTNR);
		this.buildExportToPNGButton(this.$exportFS);

		this.$mCTNR.find('.button').button();

		this.$mCTNR.find('label.measurementButton').wrap($('<div></div>').addClass('measurementButtonMargin'));

		$bottomButtons = $('<div></div>').attr('id', 'measurementBottomButtonsCTNR');
		this.$panelC.append($bottomButtons);

		$bottomButtons.append($('<div></div>').html(_e('hideall')).addClass('button').attr('id', 'toggleMeasurement'));
		$bottomButtons.find('#toggleMeasurement').button();
		$bottomButtons.find('#toggleMeasurement').on(TouchMouseEvent.DOWN, function(){  // former click
			me.measurementController.setShowMeasurements(!me.measurementController.showMeasurements);
		});

		$(this.measurementController).on('onSetShowMeasurements', function(e, mc){
			if(mc.showMeasurements)
				$('#toggleMeasurement').button('option', 'label', _e('hideall'));
			else
				$('#toggleMeasurement').button('option', 'label', _e('showall'));
		});

		$bottomButtons.append($('<div></div>').html(_e('deleteall')).addClass('button').attr('id', 'deleteAllMeasurement'));
		$bottomButtons.find('#deleteAllMeasurement').button();
		this.buildConfirmFormDeleteAll();
		$bottomButtons.find('#deleteAllMeasurement').on(TouchMouseEvent.DOWN, function(){  // former click
			$('#confirmDeleteAllMeasurements').dialog('open');
		});

		$bottomButtons.find('#deleteAllMeasurement').button('disable');

		$(this.measurementController).on('onDeleteMeasurement', function(e, aM, mc){
			if(mc == null) return false;
			if(mc.measurementList.length == 1)
				$('#deleteAllMeasurement').button('disable');
			else
				$('#deleteAllMeasurement').button('enable');
		});
		$(this.measurementController).on('onAddMeasurement', function(e, aM, mc){
			$('#deleteAllMeasurement').button('enable');
		});

		// now I have to register all the events here...
		this.$mCTNR.on(TouchMouseEvent.DOWN, '.measurementIcon', function(){
			var aType = parseInt($(this).attr('mType'));
			me.appController.ATLASViewportController.setMode(TATLASViewportMode.measurement);
			me.measurementController.setMeasurementToCreate(aType);
		});

		// add the edit Region fields
		this.$regionDetailsFS = $('<fieldset></fieldset>').attr({'id': 'regionEditFields'}).appendTo(this.$regionFS).hide();
		this.$regionDetailsFS.append($('<legend></legend>').html(_e('regiondetails')));
		$('<label></label>').html(_e('label')/*.UCFirstLetter()*/).appendTo(this.$regionDetailsFS);
		this.$regionNameEdit = $('<input />').attr({'type':'text', 'id': 'regionName'}).addClass('regionInput').appendTo(this.$regionDetailsFS);
		this.$regionDetailsFS.append('<br>');
		$('<label></label>').html(_e('link')/*.UCFirstLetter()*/).appendTo(this.$regionDetailsFS);
		this.$regionExtLinkEdit = $('<input />').attr({'type':'text', 'id': 'regionLink'}).addClass('regionInput').appendTo(this.$regionDetailsFS);
		this.$regionLockCTNR = $('<div></div>').appendTo(this.$regionDetailsFS);
		this.$regionLockLabel = $('<label></label>').html(_e('lockedqm')).appendTo(this.$regionLockCTNR);
		this.$regionLockCB = $('<input></input>').attr({'type':'checkbox', 'id':'regionLockCB'}).appendTo(this.$regionLockCTNR);


		$('<label></label>').html(_e('description')).appendTo(this.$regionDetailsFS);
		this.$regionDesc = $('<textarea></textarea>').attr({'name':'regionDescription',
																			'id': 'regionDescription'}).appendTo(this.$regionDetailsFS);

		this.$regionLockCB.click(function(){
			me.pRegionEditor.setLocked($(this).is(':checked'));
		});

		this.$regionNameEdit.change(function(){
			me.pRegionEditor.setName($(this).val());
		});
		this.$regionNameEdit.keydown(function(e){
			var code = e.keyCode || e.which;
 			if(code == 13) {
				me.pRegionEditor.setName($(this).val());
			}
		});

		this.$regionExtLinkEdit.change(function(e){
			var code = e.keyCode || e.which;
 			if(code == 13) {
				me.pRegionEditor.setExtLink($(this).val());
			}
		});

		this.$regionExtLinkEdit.change(function(){
			me.pRegionEditor.setExtLink($(this).val());
		});

		this.$regionDesc.blur(function(){
			me.pRegionEditor.setDescription($(this).val());
		});

	},
	disableRegionFields: function(){
		$('#regionEditFields').hide();
		this.fitContentHeight();
	},
	enabledRegionFields: function(){
		$('#regionEditFields').show();
		this.fitContentHeight();
	},
	updateRegionFromFields: function(aR){
		this.pRegionEditor.setDescription(this.$regionDesc.val());
		this.pRegionEditor.setExtLink(this.$regionExtLinkEdit.val());
		this.pRegionEditor.setName(this.$regionNameEdit.val());
	},
	populateRegionFields: function(aR){
		$('#regionLink').val(aR.region.extLink);
		$('#regionName').val(aR.region.name);
		$('#regionDescription').val(aR.region.description);
		if(aR.locked)
			this.$regionLockCB.prop('checked', true);
		else
			this.$regionLockCB.prop('checked', false);
	},
	clearRegionFields: function(aR){
		$('#regionLink').val('');
		$('#regionName').val('');
		$('#regionDescription').val('');
	},
	buildConfirmFormDeleteAll: function(){
		this.$confirmDeleteAllMeasurements = $('<div></div>').attr({'id':'confirmDeleteAllMeasurements', 'title':_e('deleteallannotations'), 'class':'aDialog'});
		this.$confirmDeleteAllMeasurements.append($('<p></p>').html(_e('pleaseconfirmbeforedeletingallannotations')));
		$('body').append(this.$confirmDeleteAllMeasurements);
		var me = this;
		var cancelStr = _e('cancel');

		var dialog_buttons = {};
			dialog_buttons['OK'] = function(){ me.measurementController.deleteAllMeasurement(); $(this).dialog('close'); }
			dialog_buttons[cancelStr] = function(){ $(this).dialog('close'); }

		this.$confirmDeleteAllMeasurements.dialog({autoOpen:false,
			modal:true,
			show: "fade",
			hide: "fade",
			resizable:false,
			closeOnEscape:false,
			buttons: dialog_buttons
		});
	}
});
