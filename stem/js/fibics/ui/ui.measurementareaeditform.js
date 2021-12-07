// JavaScript Document

TMeasurementAreaEditForm = Class.extend({
	init: function(pAppC){
			this.pAppCTRL = pAppC;
			this.buildHTML();
	},
	shutDown: function(){
		this.$form.dialog('destroy');
		$('#measurementAreaForm').remove();
	},
buildHTML: function(){
	this.$form = $('<div></div>').attr({id:'measurementAreaForm',
		title:_e('editmeasurement'),
		'class':'aDialog'});
	
	this.$form.append($('<label></label>').addClass('editForm').attr('for', 'measurementWidthValue').html(_e('width')));
	this.$form.append($('<input />').attr({
		type:'text',
		id:'measurementWidthValue',
		size:'10'
	}));
	this.$form.append($('<span></span>').addClass('inputUnit').html('&mu;m'));
	this.$form.append('<br/>');
	this.$form.append($('<label></label>').addClass('editForm').attr('for', 'measurementHeightValue').html(_e('height')));
	this.$form.append($('<input />').attr({
		type:'text',
		id:'measurementHeightValue',
		size:'10',
		maxlength:6		
	}));
	this.$form.append($('<span></span>').addClass('inputUnit').html('&mu;m'));
	$('body').append(this.$form);
	
	var mC = this;
	
	this.$form.dialog({
			autoOpen:false,
			modal:true,
			open : function(){				
					$('#measurementAreaForm').attr('agreed', false);
				},
			beforeclose: function(){
				if(hasAgreed($('#measurementAreaForm').attr('agreed'))){
					try{
						var newW = parseFloat($(this).find('input#measurementWidthValue').val());
						var newH = parseFloat($(this).find('input#measurementHeightValue').val());
					}
					catch(error){
						jAlert(_e('theenteredvalueisnotvalid'));
						return false;
					}
					// Verification on the entered value
					if(!checkFloat(newW)){
						jAlert(_e('theenteredwidthisnotvalid'));
						return false;
					}	
					if(!checkFloat(newH)){
						jAlert(_e('theenteredheightisnotvalid'));
						return false;
					}
					if(newW == 0){
						jAlert(_e('theenteredwidthisnotvalid'));
						return false;
					}
					if(newW >= mC.pAppCTRL.ATLASViewportController.getMaxMeasurementLength()){
						var errorMessageStr = "<p>" + _e('theenteredvalueisgreaterthanmax') + "</p>";
						var secondRow = _e('themaximumallowedis');
						secondRow = secondRow.replace('%v%', mC.pAppCTRL.ATLASViewportController.getMaxMeasurementLength().toFixed(0));
						errorMessageStr += '<p>' + secondRow + '</p>';
						jAlert(errorMessageStr);
						return false;
					}
				}
			},
			close: function(){	
				//if(isDefined(g_mViewport)) g_mViewport.keyDisabled = false;
				if(hasAgreed($('#measurementAreaForm').attr('agreed'))){				
					var newW = parseFloat($(this).find('input#measurementWidthValue').val());
					var newH = parseFloat($(this).find('input#measurementHeightValue').val());
					var i = 0;
					while(i < mC.pAppCTRL.measurementController.selectedMeasurementList.length){
						try{
							mC.pAppCTRL.measurementController.selectedMeasurementList[i].setDimensions(newW, newH);
						}
						catch(error){
							displayError(error);
						}
						i++;
						}							
					}						
				},
				buttons:{
					'OK': function(){
						$('#measurementAreaForm').attr('agreed', true);
						$(this).dialog('close');
					},
					'Cancel': function(){
						$('#measurementAreaForm').attr('agreed', false);
						$(this).dialog('close');}
				}
		});
	}
});