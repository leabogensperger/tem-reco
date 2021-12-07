// JavaScript Document
TSaveImageForm = Class.extend({
	init: function(pAppC){
			this.pAppCTRL = pAppC
			this.$saveImageForm = null;
			this.buildForm();
			var me = this;
			this.imgGenerator = new TSeadragonImageGenerator(pAppC);
			this.imgGenerator.bDrawScaleBar =  true;
			var theDialog = this;
			this.$tdImgDim = null;

			function onError(){
				$(theDialog).dialog('close');
			}
			this.imgGenerator.onError = onError;
			this.ATLASViewportController = pAppC.ATLASViewportController;
			$(this.ATLASViewportController).on('onAddATLASViewport', function(){
				me.refreshATLASViewportButton();
				// if there is only one detector, hides it
				if(me.pAppCTRL.ATLASViewportController.ATLASViewportList.length <= 1)
					me.$saveImageForm.find('#detectorSelectCTNR').hide();
				else
					me.$saveImageForm.find('#detectorSelectCTNR').show();
			});
	},
	shutDown: function(){
		this.$saveImageForm.dialog('destroy');
		$('#savedImageForm').remove();
	},
	refreshATLASViewportButton: function(){
		$('#ATLASViewportButtonsSaveImage').remove();
		$AVButtons = $("<div></div>").attr('id', 'ATLASViewportButtonsSaveImage');
		var me = this;
		// Build the buttons for the viewport
		var i = 0;
		while(i < this.ATLASViewportController.ATLASViewportList.length){
			var avp = this.ATLASViewportController.ATLASViewportList[i];
			if(avp.pChannelInfo.isVisible){
				$AVButtons.append($('<input></input>').attr({'type': 'radio','avpid': avp.id, 'name':'ATLASViewportImgSelector', 'id': 'AVP' + i}));
				$AVButtons.append($('<label></label>').attr({'for':'AVP' + i, 'avpid': avp.id}).html(this.ATLASViewportController.ATLASViewportList[i].pChannelInfo.sAlias));
			}
			i++;
		}
		$AVButtons.buttonset();
		this.$saveImageForm.find('#detectorSelect').append($AVButtons);
		me.activeVP = me.ATLASViewportController.ATLASViewportList[0];
		$('#ATLASViewportButtonsSaveImage').find('label').on(TouchMouseEvent.DOWN, function(e){  // former click
			me.activeVP = me.ATLASViewportController.getATLASViewportWithID($(this).attr('avpid'));
			me.regenerateImage();
		});
	},
	showLoading: function(){
		$('#loadingString').show();
	},
	repositionLoading: function(){
		$('#loadingString').css('top', Math.round($('#loadingString').closest('#savedImageCTNR').height()/2) + 'px' );
		$('#loadingString').css('left', Math.round($('#loadingString').closest('#savedImageCTNR').width()/2) + 'px' );
		$('#loadingString').children('span').css('left', 0);

	},
	hideLoading: function(){
		$('#loadingString').hide();
	},
	generateATLASViewportImage: function(AVP)/*, displayDim, umBounds, normBounds)*/{
		if(AVP == undefined) return false;
		AVP.resetDisplayViewportChange();
		$('#savedImagePreview').hide();
		this.showLoading();
		var displayDim = this.imgGenerator.getEffectiveDisplayDim();
		// figure out the display size for the image.
		// must not exceed 800px X 500px;
		var displayRW = 800/displayDim.width;
		var displayRH = 500/displayDim.height;
		// take the smallest of the 2
		var displayR = Math.min(displayRW, displayRH);

		$('#savedImagePreview').height( Math.round(displayDim.height * displayR));
		$('#savedImagePreview').width( Math.round(displayDim.width * displayR));
		var me = this;

		function whenURLIsReady(cnv){
			var cnvH = $(cnv).css('height');
			var cnvW = $(cnv).css('width');
			var maxWidth = $('body').width() - 200; //$('#savedImageForm').width();
			var maxHeight = $('body').height();// - 200;
			me.$saveImageForm.dialog('option', 'width', maxWidth);
			me.$saveImageForm.dialog('option', 'height', maxHeight);
			me.$saveImageForm.trigger( "dialogresizestop");
			$('#savedImagePreview').show();
			$('#loadingString').hide();
			me.resizeImagePreview();
		}
		this.imgGenerator.saveViewToImg($('#savedImagePreview').get(0), whenURLIsReady);
		var sdContentWidth = $('#sdContent').width();
		var sdContentHeight = $('#sdContent').height();
		var newWidth = $("#savedImageForm").find('.belowImage').outerWidth();
		var newHeight = newWidth*(sdContentHeight/sdContentWidth);
		$('#loadingString').css('margin-top', Math.round(newHeight/2) + 'px');
	},
	finishBuild: function(){
		var me = this;
		this.$saveImageForm.dialog({autoOpen:false,
			modal:true,
			position:'top',
			resizable:true,
			buttons:{'Done' : function(){
					$(this).dialog('close');
				}
			},
			open:function(){
				me.setExportWithMeasurement(me.imgGenerator.withAnnotation);
				me.setDrawScaleBar(me.imgGenerator.bDrawScaleBar);

				me.refreshATLASViewportButton();
				// get the activeVP from ATLASViewportController
				me.activeVP = me.ATLASViewportController.activeVP;
				//update selector
				$('#ATLASViewportButtonsSaveImage').find('input').prop('checked', false);
				//$('#ATLASViewportButtonsSaveImage').find('input:first').prop('checked', true);
				$('#ATLASViewportButtonsSaveImage').find('#AVP'+me.activeVP.iVPIndex).prop('checked', true);
				$('#ATLASViewportButtonsSaveImage').buttonset('refresh');

				me.regenerateImage();
				var formW = Math.min($('body').width() - 200, Math.max(800, $('#savedImagePreview').width()));
				$(this).dialog('option', 'width', formW);
			},
			close: function(){
				incDisplayChangeCount();
				me.pAppCTRL.ATLASViewportController.resetDisplayViewportChange();
			},
			buttons:{'Done':function(){
				$(this).dialog('close');}}
			});

		this.$saveImageForm.on( "dialogresizestop", function(e){
				$('#savedImageCTNR').width($(this).width() - 10);
				$('#savedImageCTNR').height($(this).height() - 210);
				// reposition the loading string...
				me.repositionLoading();
				me.resizeImagePreview();
		});
	},
	resizeImagePreview: function(){
		// this function makes sure that the image preview img obj fits inside its parent container
		var cW = this.$saveImageForm.find('#savedImageCTNR').width() - 5;
		var cH = this.$saveImageForm.find('#savedImageCTNR').height() - 5;
		// I have to get the W&H of the generated image, not the current image size.
		var displayDimPix = new TDimension(this.imgGenerator.getEffectiveDisplayDim().width,
																			this.imgGenerator.getEffectiveDisplayDim().height);
		var R = displayDimPix.width/displayDimPix.height;

		newW = Math.min(cW, displayDimPix.width);
		newH = newW / R;

		if( newH > cH){
			newH = Math.min(cH, displayDimPix.height);
			newW = newH * R;
		}
		$('#savedImagePreview').css({'width': newW, 'height':newH});
	},
	setExportWithMeasurement: function (F){
		this.imgGenerator.withAnnotation = F;
		$('#saveImageWithAnnotations').children().removeProp('checked').removeAttr('checked');
		if(this.imgGenerator.withAnnotation){
			$('#saveImageWithAnnotations').find('input[value=1]').prop('checked', true).attr('checked', 'checked');
		}
		else{
			$('#saveImageWithAnnotations').find('input[value=0]').prop('checked', true).attr('checked', 'checked');
		}
		$('#saveImageWithAnnotations').buttonset('refresh');
	},
	setDrawScaleBar: function (F){
		this.imgGenerator.bDrawScaleBar = F;
		$('#drawScaleBar').children().removeProp('checked').removeAttr('checked');
		if(this.imgGenerator.bDrawScaleBar){
			$('#drawScaleBar').find('input[value=1]').prop('checked', true).attr('checked', 'checked');
		}
		else{
			$('#drawScaleBar').find('input[value=0]').prop('checked', true).attr('checked', 'checked');
		}
		$('#drawScaleBar').buttonset('refresh');
	},
	buildForm: function(){
		var me = this;
		this.$saveImageForm = $('<div></div>').attr({'title': _e('savedimage'),'id':'savedImageForm'}).addClass('aDialog');
		this.$e = this.$saveImageForm;
		$('<div />').attr({id:'detectorSelectCTNR'}).html(_e('detector') + "<div id='detectorSelect'></div>").appendTo(this.$saveImageForm);

		var $savedImgCTNR = $('<div></div>').attr('id', 'savedImageCTNR');
		$savedImgCTNR.appendTo(this.$saveImageForm);
		$savedImgCTNR.append($('<div></div>').attr('id', 'loadingString'));
		$savedImgCTNR.append($('<img></img>').attr({'id': 'savedImagePreview', 'alt':_e('savedimagepreview')}));

		$errorDiv = $('<div></div>').attr('id', 'errorWhenSavingImage');
		var imgAttr = {'src':"images/warning_sign.png",
				'width':120,
				'height':111,
				'alt':_e("warning"),
				'class':'warningSavingImage'};
		$errorDiv.append($('<img />').attr(imgAttr));
		$errorDiv.append($('<h3></h3>').html(_e('cannotsaveimage')));
		$errorDiv.append($('<p></p>').html(_e('anerrorhasoccuredwhensavingthecurrentview')));

		var $infoCTNR = $('<div></div>').attr('id', 'SavedImageInfoCTNR');

		$layoutTable = $('<table></table>').addClass('belowImageLayout');
		$infoCTNR.append($layoutTable);
		this.$saveImageForm.append($infoCTNR);

		$layoutTable.append($("<tr></tr>").append("<td></td>"));
		$layoutTable.find('td:last').addClass('belowImageLayout');

		$FS1 = $('<fieldset></fieldset>').addClass('saveImageSettings');
		$FS1.append($('<legend></legend>').html(_e('settings')));
		$layoutTable.find('td:last').append($FS1);

		var $t = $('<table></table>').attr({'width': '100%', 'border':'0', 'cellspacing':1, 'cellpadding':1});
		$t.append($('<tr></tr>'));
		$t.find('tr:last').append($('<td></td>').addClass('SaveImageOptionCaption').html(_e('drawannotations')));
		$saveMeasButtons = $('<div></div>').attr('id', 'saveImageWithAnnotations').addClass('buttonSet');
		$saveMeasButtons.append($('<input></input>').attr({'type':"radio", 'name':'saveImageWithAnnotations','id':'saveImageWithAnnotations1', 'value':1}));
		$saveMeasButtons.append($('<label></label>').attr('for', 'saveImageWithAnnotations1').html(_e('yes')));
		$saveMeasButtons.append($('<input></input>').attr({'type':"radio", 'name':'saveImageWithAnnotations','id':'saveImageWithAnnotations2', 'value':0}));
		$saveMeasButtons.append($('<label></label>').attr('for', 'saveImageWithAnnotations2').html(_e('no')));
		$saveMeasButtons.find('input').on('change', function(){
			me.setExportWithMeasurement($(this).prop('value') == 1);
			me.regenerateImage();
		});
		$t.find('tr:last').append($('<td></td>').append($saveMeasButtons));
		$saveMeasButtons.find('input').on(TouchMouseEvent.DOWN, function(){  // former click
			me.setExportWithMeasurement($(this).val() == 1);
			me.regenerateImage();
		});
		$saveMeasButtons.buttonset();

		// add the include scalebar
		$t.append($('<tr></tr>'));
		$t.find('tr:last').append($('<td></td>').addClass('SaveImageOptionCaption').html(_e('drawscalebar')));
		$drawScaleBar = $('<div></div>').attr('id', 'drawScaleBar').addClass('buttonSet');
		$drawScaleBar.append($('<input></input>').attr({'type':"radio", 'name':'drawScaleBar','id':'drawScaleBar1', 'value':1}));
		$drawScaleBar.append($('<label></label>').attr('for', 'drawScaleBar1').html(_e('yes')));
		$drawScaleBar.append($('<input></input>').attr({'type':"radio", 'name':'drawScaleBar','id':'drawScaleBar2', 'value':0}));
		$drawScaleBar.append($('<label></label>').attr('for', 'drawScaleBar2').html(_e('no')));
		$drawScaleBar.find('input').on('change', function(){
			me.setDrawScaleBar($(this).prop('value') == 1);
			me.regenerateImage();
		});
		$drawScaleBar.find('input').on(TouchMouseEvent.DOWN, function(){  // former click
			me.setDrawScaleBar($(this).val() == 1);
			me.regenerateImage();
		});
		$t.find('tr:last').append($('<td></td>').append($drawScaleBar));
		$drawScaleBar.buttonset();

		// Add the aspect ratio
		$t.append($('<tr></tr>'));
		$t.find('tr:last').append($('<td></td>').addClass('SaveImageOptionCaption').html(_e('aspectratio')));
		$imgAspectRatio = $('<div></div>').attr('id', 'imageAspectRatio').addClass('buttonSet');
		$imgAspectRatio.append($('<input></input>').attr({'type':"radio", 'checked':true, 'name':'imageAspectRatio','id':'imageAspectRatio1', 'value':0}));
		$imgAspectRatio.append($('<label></label>').attr('for', 'imageAspectRatio1').html(_e('asis')));
		$imgAspectRatio.append($('<input></input>').attr({'type':"radio", 'name':'imageAspectRatio','id':'imageAspectRatio2', 'value':1}));
		$imgAspectRatio.append($('<label></label>').attr('for', 'imageAspectRatio2').html('4:3'));
		$imgAspectRatio.append($('<input></input>').attr({'type':"radio", 'name':'imageAspectRatio','id':'imageAspectRatio3', 'value':2}));
		$imgAspectRatio.append($('<label></label>').attr('for', 'imageAspectRatio3').html('1:1'));

		$t.find('tr:last').append($('<td></td>').append($imgAspectRatio));
		$imgAspectRatio.buttonset();

		$imgAspectRatio.find('input').on('change', function(){
			var val = $(this).prop('value');
			if(val == 0)
				me.imgGenerator.eImageAspectRatio = TImageAspectRatio.CurrentView;
			else if(val == 1)
				me.imgGenerator.eImageAspectRatio = TImageAspectRatio.FourThree;
			else if(val == 2)
				me.imgGenerator.eImageAspectRatio = TImageAspectRatio.Square;
			me.regenerateImage();
		});

		$t.appendTo($FS1);
		this.$refreshButton = $('<div></div>').addClass('button').attr('id', 'refreshSaveImage').html(_e('refresh'));
		$FS1.append(this.$refreshButton);
		this.$refreshButton.click(function(){
				me.regenerateImage();
		});
		$FS1.append($('<p></p>').html(_e('iftheimagedoesnotshowup')));
		$infoCTNR.find('.button').button();
		$('body').append(this.$saveImageForm);

		$savedImgCTNR.find('#loadingString').Loadingdotdotdot({
		    "speed": 100,
		    "maxDots": 3
		});

		//$layoutTable.find('tr:last').append($('<td></td>')).addClass('belowImageLayout');
		$FS2 = $('<fieldset></fieldset>').addClass('saveImgInstructions');
		$FS2.append($('<legend></legend>').html(_e('instructions')));

		$FS2.append($('<p>' + _e('tosavetheimage') + '</p>'));
		$FS2.append($('<ol></ol>'));
		$FS2.find('ol').append($('<li></li>').html(_e('rightclickontheimage')));
		$FS2.find('ol').append($('<li></li>').html(_e('selectsaveimageas')));
		$FS2.find('ol').append($('<li></li>').html(_e('chosealocation')));
		$FS2.find('ol').append($('<li></li>').html(_e('presssave')));
		$layoutTable.find('tr').append($("<td></td>"));
		$layoutTable.find('td:last').addClass('belowImageLayout').append($FS2);

		// Add the Image Info Fieldset
		$FS3 = $('<fieldset></fieldset>').addClass('saveImgInstructions');
		$FS3.append($('<legend></legend>').html('Image Information'));
		$layoutTable.find('tr').append($("<td></td>"));
		$layoutTable.find('td:last').addClass('belowImageLayout').append($FS3);
		$ImgInfoTable = $("<table />").appendTo($FS3);
		$aRow = $('<tr/>').appendTo($ImgInfoTable);
		$("<td>").prop({'class':'miInfoCaption'}).html(_e('dimensions')).appendTo($aRow);
		$("<td>").prop({'class':'miInfoValue', 'id': 'ImageDimension'}).appendTo($aRow);
		$aRow = $('<tr/>').appendTo($ImgInfoTable);
		$("<td>").prop({'class':'miInfoCaption'}).html(_e('size')).appendTo($aRow);
		$("<td>").prop({'class':'miInfoValue', 'id': 'ImageSize'}).appendTo($aRow);
		$aRow = $('<tr/>').appendTo($ImgInfoTable);
		$("<td>").prop({'class':'miInfoCaption'}).html(_e('pixelsize')).appendTo($aRow);
		$("<td>").prop({'class':'miInfoValue', 'id': 'ImagePixelSize'}).appendTo($aRow);
	},
	regenerateImage: function(){
		var FOVDim = new Seadragon.Rect(parseFloat($('#savedImageForm').attr('fovx')),
																		parseFloat($('#savedImageForm').attr('fovy')),
																		parseFloat($('#savedImageForm').attr('fovwidth')),
																		parseFloat($('#savedImageForm').attr('fovheight')));

		var xy = new Seadragon.Point(FOVDim.x, FOVDim.y);
		var wh = new Seadragon.Point(FOVDim.width, FOVDim.height);
		xy = this.activeVP.pointFromMicron(xy);
		wh = this.activeVP.deltaPointsFromMicrons(wh);
		bounds = new Seadragon.Rect(xy.x, xy.y, wh.x, wh.y);

		var displayDim = new TDimension(parseFloat($('#savedImageForm').attr('pixelwidth')), parseFloat($('#savedImageForm').attr('pixelheight')));

		this.imgGenerator.ATLASViewport = this.activeVP;
		this.imgGenerator.pSDSource = this.activeVP.sdViewer.source;
		this.imgGenerator.pAppCTRL = this.pAppCTRL;
		this.imgGenerator.displayDim = displayDim;
		this.imgGenerator.umBounds = FOVDim;
		this.imgGenerator.normBounds = bounds;
		this.generateATLASViewportImage(this.activeVP);//, displayDim, FOVDim, bounds );
		this.populateImgInfo();

	},
	populateImgInfo: function(){
		var dispWH = this.imgGenerator.getEffectiveDisplayDim();
		var boundsWH = this.imgGenerator.getEffectiveUmBounds();
		var dispWHStr =  Math.round(dispWH.width) + ' X ' + Math.round(dispWH.height) + ' pixels';
		var boundWHStr = Math.round(boundsWH.width) + ' X ' + Math.round(boundsWH.height) + ' &mu;m';
		var pixelSStr = ((boundsWH.width/dispWH.width)*1000).toFixed(1) +  ' nm/pixel';
		this.$e.find('#ImageDimension').html('');
		this.$e.find('#ImageDimension').append($('<span>').addClass('infoUnits').html(dispWHStr + '<br>' + boundWHStr));
		this.$e.find('#ImageSize').html('');
		this.$e.find('#ImageSize').append($('<span>').addClass('infoUnits').html(formatPixelCount(dispWH.width * dispWH.height)));
		this.$e.find('#ImagePixelSize').html('');
		this.$e.find('#ImagePixelSize').append($('<span>').addClass('infoUnits').html(pixelSStr));
	}
});
