TViewportInfo = Class.extend({
	init: function (AVController){
		this.ATLASViewportController = AVController;
		this.VPInfoUpdateRequired = false;
		this.$e = null;
		this.build();
		var me = this;

		$(this.ATLASViewportController).on('onChange', function(){
			me.resetUpdateFlag();
		});

		$(this.ATLASViewportController).on('onAddATLASViewport', function(e, VP){
			// Make sure to update the info when the viewport load
			$(VP).on('onLoad', function(){
				me.resetUpdateFlag();
			});

			VP.$e.closest('.ATLASViewportCTNR').on(TouchMouseEvent.MOVE, function(e){
				var	pix = new Seadragon.Point(e.pageX, e.pageY);
				pix.x = pix.x - VP.$e.offset().left;
				pix.y = pix.y - VP.$e.offset().top;
				if(VP.sdViewer.viewport != undefined){
					var pt = VP.sdViewer.viewport.pointFromPixel(pix);
					var ptum = VP.micronFromPoint(pt);
					me.$e.find('#VPCursorPos').html(formatDim(ptum.x) + " , " + formatDim(ptum.y));
					normPt = VP.sdViewer.viewport.pointFromPixel(pix);
					if(G_DEBUG){
						me.$e.find('#VPCursorPos').html(me.$e.find('#VPCursorPos').html() + '<br /> ' + normPt.x.toFixed(5) + ', ' + normPt.y.toFixed(5));
						me.$e.find('#VPCursorPos').html(me.$e.find('#VPCursorPos').html() + '; ' + pix.x + ', ' + pix.y);
					}
				}
			});
			VP.$e.closest('.ATLASViewportCTNR').on('mouseout', function(e){
				me.$e.find('#VPCursorPos').html('');
			});
		});

		$(this.ATLASViewportController).on(TouchMouseEvent.MOVE, function(e, originalE){
			a = me.ATLASViewportController.getATLASViewportAt(originalE.pageX, originalE.pageY);
			return false;
			if(a != undefined){
				var	pix = new Seadragon.Point(originalE.pageX, originalE.pageY);
				pix.x = pix.x - a.$e.offset().left;
				pix.y = pix.y - a.$e.offset().top;
				if(a.sdViewer.viewport != undefined){
					var pt = a.sdViewer.viewport.pointFromPixel(pix);
					var ptum = a.micronFromPoint(pt);

					me.$e.find('#VPCursorPos').html(formatDim(ptum.x) + ", " + formatDim(ptum.y));
				}
			}
		});
	},
	close: function(){
		this.$MagForm.dialog('destroy');
		this.$FOVWidthForm.dialog('destroy');
		this.$PSForm.dialog('destroy');
	},
	build: function(){
		this.$e = $('<div></div>').attr('id', 'ViewportInfo').addClass('no-select');
		$VPInfoTable = $('<table></table>');
		this.$e.append($VPInfoTable);
		$VPInfoTable.append(this.getVPInfoRow('VPPixelSize', _e('pixelsize'), _e('setpixelsize'), 'pixelSizeRelated'));
		$VPInfoTable.append(this.getVPInfoRow('VPDimension', _e('dimensions'), _e('setdimensions'), 'FOVDimensionRelated'));
		$VPInfoTable.append(this.getVPInfoRow('VPMagnification', _e('magnification'), _e('setmagnification'), 'magRelated'));
		$VPInfoTable.append(this.getVPInfoRow('VPCursorPos', _e('cursor'), '', 'cursorRelated'));
		var me = this;
		this.updateVPInfoInterval = setInterval(function(){
				me.updateVPInfo();
			}, 100);
		this.VPInfoUpdateRequired =  true;
		this.buildFOVWidthForm();
		this.buildSetPixelSizeForm();
		this.buildMagnificationForm();

		this.$e.on('dblclick', '#MagNotCalibrated', function(){
			$('#magCalibration').dialog('open');
		});

	},
	buildImageScaleForm : function(){
		this.$imageScaleForm = $('<div></div>').attr({'id': 'changeImageScale',
			'title':'Enter Image Scale',
			'class':'aDialog'});
		var me = this;
		this.$imageScaleForm.append($('<p></p>').html('Enter the desired image scale.'));
		this.$imageScaleForm.append($('<label></label>').attr('for', 'imageScaleValue').html('Scale value'));
		this.$imageScaleForm.append($('<input></input>').attr({type:'text', 'id':'imageScaleValue', 'size':'10'}));
		this.$imageScaleForm.append($('<span></span>').attr('class','inputUnit').html('%'));
		this.$e.append(this.$imageScaleForm);

		this.$e.on('dblclick','#VPImageScale', function(){
			$('#changeImageScale').dialog('open');
		});

		this.$e.find('#imageScaleValue').keypress(function(event){
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == 13){
				$('#changeImageScale').attr('agreed', true);
				$('#changeImageScale').dialog('close');
			}
		});

		// the jQuery stuff
		this.$e.find('#changeImageScale').dialog({
			autoOpen:false,
			modal:true,
			resizable:false,
			open : function(){
				$('#changeImageScale').attr('agreed', false);
				$('#imageScaleValue').val(me.ATLASViewportController.getImageScale().toFixed(1));
				$('#imageScaleValue').focus();
				$('#imageScaleValue').select();
			},
			beforeclose: function(){
				if(hasAgreed($('#changeImageScale').attr('agreed'))){
					var newImageScale =	parseFloat($(this).find('input').val());
					// Verification on the entered value

					if((!checkFloat(newImageScale))
						|| (newImageScale == 0)){
						jAlert(_e('theenteredvalueisnotvalid'),
								"Incorrect Input Value" );
						return false;
					}
					else if((newImageScale/100) > Seadragon.Config.maxZoomPixelRatio){
						jAlert('The maximum image scale that can be entered is ' + (Seadragon.Config.maxZoomPixelRatio*100) + '%.',
						"Incorrect Input Value" );
						return false;
					}
					else if((me.ATLASViewportController != undefined)
							&& (me.ATLASViewportController.getMinImageScale() > newImageScale)){
						jAlert('The minimum image scale that can be entered is ' + me.ATLASViewportController.getMinImageScale().toFixed(2) +'%.',
						"Incorrect Input Value" );
						return false;
					}
				}
				return true;
			},
			close: function(){
				if(hasAgreed($('#changeImageScale').attr('agreed'))){
					var newImageScale =	parseFloat($(this).find('input').val());
					me.ATLASViewportController.setImageScale(newImageScale);
				}
			},
			buttons:{
				'OK':function(){
					$('#changeImageScale').attr('agreed', true);
					$(this).dialog('close');
				},
				'Cancel': function(){
						$('#changeImageScale').attr('agreed', false);
						$(this).dialog('close');
				}}
		});
	},
	updateMagFields: function(){
		$('#setMagForm').attr('agreed', false);
		var	mag = this.ATLASViewportController.getMagnification();

		if (mag == undefined){return;} //do nothing if first time

		$('#magInputValue').val(mag.toFixed(0));
		//$('#magInputValue').focus();
		//$('#magInputValue').select();
		$('#magScreenMode').prop('checked', this.ATLASViewportController.magnificationMode == 'screen');
		$('#magPolaroidMode').prop('checked', this.ATLASViewportController.magnificationMode == 'polaroid');
		$('#magMode').buttonset('refresh');

		// Check if it is calibrated or not
		if(this.ATLASViewportController.isMagCalibrated()){
		}
	},
	buildMagnificationForm: function(){
		this.$MagForm = $('<div></div>').attr({id: 'setMagForm',
			title: 'Set Magnification',
			'class': 'aDialog'});
		this.$e.append(this.$MagForm);
		this.$MagForm.append($('<p></p>').html('Enter the desired magnification.'));
		this.$MagForm.append($('<label></label>').attr('for', 'magInputValue'));
		this.$MagForm.append($('<input></input>').attr({'type': 'text',
			'id': 'magInputValue',
			'size': 10}));
		this.$MagForm.append($('<span></span>').html('X'));

		this.$MagForm.append($('<br/>'));
		this.$MagForm.append($('<br/>'));
		this.$MagForm.append($('<div></div>').html('Magnification Mode'));

		// The Selector between Polaroid and Screen
		$MagModeSelector = $('<div></div>').attr({id:'magMode'});
		$MagModeSelector.append($('<label></label>').attr({'for': 'magScreenMode'}).html('Screen'));
		$MagModeSelector.append($('<input></input>').attr({
			id:'magScreenMode',
			type:'radio',
			name:'magDisplayLayout'
		}));
		$MagModeSelector.append($('<label></label>').attr({'for': 'magPolaroidMode'}).html('Polaroid'));
		$MagModeSelector.append($('<input></input>').attr({
			id:'magPolaroidMode',
			type:'radio',
			name:'magDisplayLayout'
		}));

		if(this.ATLASViewportController.magnificationMode == 'polaroid'){
			$('#magScreenMode').prop('checked', false);
			$('#magPolaroidMode').prop('checked', true);
		}
		else{
			$('#magPolaroidMode').prop('checked', false);
			$('#magScreenMode').prop('checked', true);
		}
		this.$MagForm.append($MagModeSelector);
		this.$MagForm.find('#magMode').buttonset();

		this.$MagForm.find('#magMode').children().on('click', function(){
			if($(this).attr('id') == 'magPolaroidMode')
				me.ATLASViewportController.magnificationMode = 'polaroid';
			else{
				if(!me.ATLASViewportController.isMagCalibrated()){
					$('#magCalibration').on( "dialogclose", function(){
						me.updateMagFields();
					});
					$('#magCalibration').dialog('open');
				}
				me.ATLASViewportController.magnificationMode = 'screen';
			}
			me.updateMagFields();
		});

			this.$MagForm.append($('<div></div>').html('Calibrate Screen').attr({id:'btCalMagScreenButton'}));
		this.$MagForm.find('#btCalMagScreenButton').button();

		this.$MagForm.find('#btCalMagScreenButton').on(TouchMouseEvent.UP, function(){
				$('#magCalibration').dialog('open');
		});

		this.$e.find('.magRelated').dblclick(function(){
			$('#setMagForm').dialog('open');
		});

		var me = this;
		/* Set Mag Dialog */
		this.$e.find('#setMagForm').dialog({autoOpen:false,
			show: "fade",
			hide: "fade",
			modal:true,
			close: function(){
				if(hasAgreed($('#setMagForm').attr('agreed'))){
					var magVal = parseFloat($(this).find('input#magInputValue').val());
					me.ATLASViewportController.setMagnification(magVal);
					// Save the mag mode
					me.ATLASViewportController.pAppC.ioStorage.globalSave('magMode', me.ATLASViewportController.magnificationMode);
				}
			},
			beforeclose: function(){
				if(!hasAgreed($('#setMagForm').attr('agreed'))) return true;

				var newMag = parseFloat($(this).find('input#magInputValue').val());
				if((!newMag) || (isNaN(newMag))){
					jAlert("The magnification entered is not valid. ", 'Cannot Set Magnification' );
					return false;
				}

				if(!checkForEmptyVal(newMag))	return false;

				if(me.ATLASViewportController.getMaxMagnification()  < newMag){
					jAlert("The magnification cannot be set beyond " + me.ATLASViewportController.getMaxMagnification().toFixed(0) + ' X.', 'Cannot Set Magnification' );
					return false;
				}
				if(me.ATLASViewportController.getMinMagnification() > newMag){
					jAlert("The magnification cannot be set smaller than " + me.ATLASViewportController.getMinMagnification().toFixed(1) + ' X.', 'Cannot Set Magnification' );
					return false;
				}

			},
			open : function(){
				me.updateMagFields();

			},
			buttons:{'OK':function(){
						$('#setMagForm').attr('agreed', true);
						$('#setMagForm').dialog('close');
					},
					'Cancel': function(){
						$('#setMagForm').attr('agreed', false);
						$('#setMagForm').dialog('close');
					}}
		});
	},
	buildFOVWidthForm: function(){
		this.$FOVWidthForm = $('<div></div>').attr({id: 'changeImageWidth',
			title: 'Enter Image Width',
			'class': 'aDialog'});
		this.$FOVWidthForm.append($('<p></p>').html('Enter the desired field of view width.'));
		this.$FOVWidthForm.append($('<label></label>').attr('for', 'imageWidthValue'));
		this.$FOVWidthForm.append($('<input></input>').attr({'type': 'text',
			'id': 'imageWidthValue',
			'size': 10}));
		this.$FOVWidthForm.append($("<span></span>").attr( {'class':'inputUnit'}).html('&mu;m'));
		this.$e.append(this.$FOVWidthForm);
		var me = this;

		this.$e.find('#VPDimension').dblclick(function(){
			$('#changeImageWidth').dialog('open');
		});
		this.$e.find('#imageWidthValue').keypress(function(event){
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == 13){
				$('#changeImageWidth').attr('agreed', true);
				$('#changeImageWidth').dialog('close');
			}
		});
		/* Image Scale form */
		this.$e.find('#changeImageWidth').dialog({autoOpen:false,
			show: "fade",
			hide: "fade",
			modal:true,
			close: function(){
				if(hasAgreed($('#changeImageWidth').attr('agreed'))){
					me.ATLASViewportController.setImageWidth(parseFloat($(this).find('input').val()));
				}
			},
			beforeclose: function(){
				if(!hasAgreed($('#changeImageWidth').attr('agreed'))) return true;
				var newWidth = parseFloat($(this).find('input').val());
				if(isNaN(newWidth) || !newWidth){
					jAlert("Invalid FOV width.", 'Cannot Set FOV Width' );
					return false;
				}

				if(me.ATLASViewportController.getMaxFOVExtension() < newWidth){
					jAlert("The FOV cannot be extended beyond " + me.ATLASViewportController.getMaxFOVExtension().toFixed(0) + ' µm.', 'Cannot Set FOV Width' );
					return false;
				}
				if(me.ATLASViewportController.getMinFOVExtension() > newWidth){
					jAlert("The FOV cannot be set smaller than " + me.ATLASViewportController.getMinFOVExtension().toFixed(1) + ' µm.', 'Cannot Set FOV Width' );
					return false;
				}
			},
			open : function(){
				$('#changeImageWidth').attr('agreed', false);
				var	d = me.ATLASViewportController.getFOVDim();
				$('#imageWidthValue').val(d.width.toFixed(1));
				$('#imageWidthValue').focus();
				$('#imageWidthValue').select();
			},
			buttons:{'OK':function(){
						$('#changeImageWidth').attr('agreed', true);
						$('#changeImageWidth').dialog('close');
					},
					'Cancel': function(){
						$('#changeImageWidth').attr('agreed', false);
						$('#changeImageWidth').dialog('close');
					}}
		});
	},
	buildSetPixelSizeForm: function(){
		this.$PSForm = $('<div></div>').attr({id: 'changePixelSize',
								title: _e('enterpixelsize'),
								'class': 'aDialog'});

		this.$PSForm.append($('<p></p>').html(_e('enterthedesiredpixelsize')));
		this.$PSForm.append($('<label></label>').attr('for', 'pixelSizeValue').html(_e('pixelsize')));
		this.$PSForm.append($('<input></input>').attr({'type': 'text',
			'id': 'pixelSizeValue',
			'size': 10}));
		this.$PSForm.append($("<span></span>").attr( {'class':'inputUnit'}).html('nm'));
		this.$e.append(this.$PSForm);


		this.$e.find('#VPPixelSize').dblclick(function(){
			$('#changePixelSize').dialog('open');
		});

		this.$e.find('#pixelSizeValue').keypress(function(event){
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == 13){
				$('#changePixelSize').attr('agreed', true);
				$('#changePixelSize').dialog('close');
			}
		});

		var me = this;
		this.$e.find('#changePixelSize').dialog({
			autoOpen:false,
			resizable:false,
			modal:true,
			show: "fade",
			hide: "fade",
			open : function(){
				$(this).attr('agreed', false);
				$('#pixelSizeValue').val((me.ATLASViewportController.getPixelSize()*1000).toFixed(1));
				$('#pixelSizeValue').focus();
				$('#pixelSizeValue').select();
			},
			beforeclose: function(){
				if(hasAgreed($(this).attr('agreed'))){
					var newPixelSize = parseFloat($('#pixelSizeValue').val())/1000;

					if (isNaN(newPixelSize)) {
						jAlert(_e('invalidpixelsize'));
						$('#pixelSizeValue').focus().select();
						return false;
					}
					if(newPixelSize > me.ATLASViewportController.getMaxPixelSize()){
						var tooLargeText = _e('theenteredpixelsizeistoolarge');
						tooLargetText = tooLargeText.replace('%v%', me.ATLASViewportController.getMaxPixelSize().toFixed(1) );
						jAlert(tooLargeText);
						return false;
					}
					else if(newPixelSize < me.ATLASViewportController.getMinPixelSize()){
						var tooLargeText = _e('theenteredpixelsizeistoosmall');
						tooLargetText = tooLargeText.replace('%v%', me.ATLASViewportController.getMinPixelSize().toFixed(1) );
						jAlert(tooLargeText);
						return false;
					}
				}
				return true;
			},
			close: function(){
				if(hasAgreed($(this).attr('agreed'))){
					var newPixelSize = $('#pixelSizeValue').val();
					me.ATLASViewportController.setPixelSize(newPixelSize);
				}
			},
			buttons:{
				'OK':function(){
					$(this).attr('agreed', true);
					$(this).dialog('close');
				},
				'Cancel': function(){
					$(this).attr('agreed', false);
					$(this).dialog('close');
				}
			}
		});
	},
	updateVPInfo: function(){
		if(this.VPInfoUpdateRequired){
			// Pixel Size
			var ps = this.ATLASViewportController.getPixelSize();
			if(ps != undefined){
				if(ps < 1){
					psStr = (ps*1000).toFixed(1);
					psUnits =  ' nm';
				}
				else{
					psStr = ps.toFixed(1);
					psUnits = ' &mu;m';
				}
				this.$e.find('#VPPixelSize').html(psStr +  "<span class='infoUnits'>" + psUnits + "</span>");
			}
			this.VPInfoUpdateRequired =  false;

			// VP FOV
			var wStr = '';
			var hStr = '';
			var	hUnits = '';
			var wUnits = '';
			var d = this.ATLASViewportController.getFOVDim();
			if (d != null){
				this.$e.find('#VPDimension').html( formatDim( d.width ) + " <span class='WxH'>x</span> " + formatDim( d.height ));
			}

			// add normalized bounds
			if(G_DEBUG){
				var b = this.ATLASViewportController.getBounds();
				if(b != null)
					this.$e.find('#VPDimension').html(this.$e.find('#VPDimension').html() +  '<br />' + b.x.toFixed(2) + ', ' + b.y.toFixed(2)+'; ' + b.width.toFixed(2) + ', ' + b.height.toFixed(2));
			}

			this.updateMagnification();
		}
	},
	getVPInfoRow: function(id, Caption, Hint, Class){
		$row = $("<tr></tr>");
		$row.append($('<td></td>').attr({'title': Hint}).addClass('vpInfoCaption no-select ' +  Class).html(Caption));
		$row.append($('<td></td>').addClass(Class).html('<div class="vpInfoValue no-select" class="' + Class + '" id='+id+'></div>'));
		return $row;
	},
	shutDown: function(){
		this.$e.remove();
	},
	updateMagnification: function(){
		xMag = this.ATLASViewportController.getMagnification();
		if(xMag <= 0){ // not calibrated
			if (this.$e.find('#VPMagnification').find('#MagNotCalibrated').size() == 0){
				this.$e.find('#VPMagnification').children().html('');
				this.$e.find('#VPMagnification').append($('<div></div>').attr('id', 'MagNotCalibrated').html(_e('notcalibrated')));
			}
			return false;
		}
		if (this.$e.find('#VPMagnification').find('#MagNotCalibrated').size() == 1){
			this.$e.find('#VPMagnification').find('#MagNotCalibrated').remove();
		}
		if(xMag < 1000){
			this.$e.find('#VPMagnification').html(xMag.toFixed(0) + ' X');
		}
		else if(xMag < 100000){
			this.$e.find('#VPMagnification').html((xMag/1000).toFixed(2) + ' <span class="kiloUnits">k</span>X');
		}
		else{
			this.$e.find('#VPMagnification').html((xMag/1000).toFixed(1) + ' <span class="kiloUnits">k</span>X');
		}
		// append the mag mode
		if ( this.ATLASViewportController.magnificationMode == 'polaroid')
			this.$e.find('#VPMagnification').append('<span class="magModeDisplay">' + _e('polaroid') + '</span>');
		else if ( this.ATLASViewportController.magnificationMode == 'screen')
			this.$e.find('#VPMagnification').append('<span class="magModeDisplay">' + _e('screen') + '</span>');
	},
	resetUpdateFlag: function(){
		this.VPInfoUpdateRequired =  true;
	}
});
