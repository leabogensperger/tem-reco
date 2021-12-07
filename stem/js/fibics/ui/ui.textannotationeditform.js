// JavaScript Document
TEditTextAnnotationForm = Class.extend({

	init: function(pAppsCTRL){
		this.appsCTRL = pAppsCTRL;
		this.addCaptionHTMLCode();
	},
	shutDown: function(){
		this.$form.dialog('destroy');
		this.$form.remove();
	},
	addCaptionHTMLCode: function(){
		this.$form  = $('<div></div>').addClass('aDialog').attr({'title':_e('textannotationproperties'),
															'id': 'formTextAnnotationProperty'});
		this.$form.append($('<label></label>').attr('for', 'textAnnotationText').html(_e('text')));
		
		this.$form.append($('<textarea></textarea>').attr({'id': 'textAnnotationText',
													'rows': 10}));
		sWarningSize =  _e('textlimitedtoxxx');
		sWarningSize  = sWarningSize.replace('%v%', g_textAnnotationLimit);
		
		this.$form.append($('<div></div>').attr('id', 'annotationLimit').html(sWarningSize));			
		this.$form.append($('<br />'));
		
		$fontSizeInput = $('<input />').attr({'type':'text', 'id':'textAnnotationFontSize'});
		$fsDivLine = $('<div></div>').attr({'id':'fontSizeLine'}).appendTo(this.$form);
		$fsDivLine.append($('<label></label>').attr('for', 'textAnnotationFontSize').html(_e('fontsize')));
		$fsDiv = $('<div></div>').attr({'id':'fontSizeCTNR'}).appendTo($fsDivLine);
		$fontSizeInput.appendTo($fsDiv);
		$fsDiv.append('px');
		$fsSlider = $('<div></div>').attr({'id':'fontSizeSlider'}).appendTo($fsDiv);
		$fsSlider.slider({
 					 slide: function( event, ui ) {
							$('#textAnnotationFontSize').val(ui.value);
						}});
		this.$form.append($('<br />'));
		
		this.$form.append($('<br />'));
		this.$form.append($('<label></label>').attr('for', 'textAnnotationFontFamily').addClass('fontSelectElement').html(_e('font')));
		$fontSelect = $('<select></select>').attr('id', 'textAnnotationFontFamily').addClass('fontSelectElement');
		$fontSelect.append($('<option></option>').val('monospace').html('Monospace').addClass('monospaceFont'));
		$fontSelect.append($('<option></option>').val('georgia').html('Georgia').addClass('georgiaFont'));
		$fontSelect.append($('<option></option>').val('times new roman').html('Times New Roman').addClass('timesNewRomanFont'));
		$fontSelect.append($('<option></option>').val('trebuchet ms').html('Trebuchet').addClass('trebuchetFont'));
		$fontSelect.append($('<option></option>').val('verdana').html('Verdana').addClass('verdanaFont'));
		$fontSelect.append($('<option></option>').val('courier').html('Courier').addClass('courierFont'));
		$fontSelect.append($('<option></option>').val('arial').html('Arial').addClass('arialFont'));
		$fontSelect.append($('<option></option>').val('symbol').html('Symbol').addClass('symbolFont'));
		this.$form.append($fontSelect);	
		$('body').append(this.$form);
		
		var me = this;
		
		this.$form.dialog({
			autoOpen:false,
			modal:true,
			show: "fade",
			hide: "fade",
			minHeight: 300,
			open: function(){
				$('textAnnotationFontFamily').val();				
				// get the measurement and set the values in the form
				var pMeas = me.appsCTRL.measurementController.activeMeasurement;
				var fontSize = pMeas.getFontSize();
				fontSize = Math.round(fontSize);
				$('#textAnnotationFontSize').val(fontSize);
				$('#fontSizeSlider').slider('value', fontSize);				
				$(this).find('textarea').val(pMeas.textlines.join("\n"));
				$(this).find('#textAnnotationFontFamily').children('option').prop('selected', false);
				$(this).find('#textAnnotationFontFamily').children('option[value="' + pMeas.getFontFamily() + '"]').prop('selected', true);				
			},
			minWidth : 300,
			resizeStop : function(event, ui){
				var height = parseFloat($('#annotationForm').dialog( "option", "height" )) - 150;
				$('#textAnnotationText').css('height', height + 'px !important');
				$('#textAnnotationText').closest('.textAreaWrapper').css('height' ,height + 'px');
			},
			buttons :{'OK':function(){
				// Check if the value is empty
				var theText = $('#textAnnotationText').val();
				
				if(theText == ''){										
					jAlert(_e('thetextcannotbeempty'));
					return null;
				}
				
				if(theText.length > g_textAnnotationLimit){
					var sMaxSizeWarning = _e('thetextcannotbelongerthan');
					var sCurrentTextL = _e('therearexxxcharacters');
					sMaxSizeWarning = sMaxSizeWarning.replace('%v%',  g_textAnnotationLimit );
					sCurrentTextL =  sCurrentTextL.replace('%v%', $(this).find('textarea').val().length);
					jAlert('<p>' + sMaxSizeWarning + '</p><p>' + sCurrentTextL + '</p>', 'Text is Too Long' );
					return null;
				}
				
				// assign the text to the annotation
				if( me.appsCTRL.measurementController.activeMeasurement != null){
					 me.appsCTRL.measurementController.activeMeasurement.clear();
					 me.appsCTRL.measurementController.activeMeasurement.setFontSize($('#textAnnotationFontSize').val());
					 me.appsCTRL.measurementController.activeMeasurement.fontFamily = $('#textAnnotationFontFamily').val();										
					var allLines = theText.split('\n');
					var i = 0;
					while(i < allLines.length){
						 me.appsCTRL.measurementController.activeMeasurement.addLine(allLines[i]);
						i++;	
					}										
				}
				$(this).dialog('close');
				$(this).find('.newMeasurement').val(false);
				},
				'Cancel':function(){
					if($(this).find('.newMeasurement').val() == 'true'){
						this.deleteMeasurement( me.appsCTRL.measurementController.activeMeasurement);	
					}
					$(this).dialog('close');
					$(this).find('.newMeasurement').val(false);
				}
			}
		});
	}
});