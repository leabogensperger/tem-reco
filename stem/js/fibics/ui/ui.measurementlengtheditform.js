// JavaScript Document

TMeasurementLengthEditForm = Class.extend({
	init: function(pAppC){
			this.pAppCTRL = pAppC;
			this.buildHTML();
	},
	shutDown: function(){
		this.$form.dialog('destroy');
		$('#measurementLengthForm').remove();
	},
buildHTML: function(){
	this.$form = $('<div></div>').attr({id:'measurementLengthForm',
			title:_e('editmeasurement'),
			'class':'aDialog'});
		this.$form.append($('<label></label>').addClass('editForm').attr('for', 'measurementLengthValue').html(_e('length')));
		this.$form.append($('<input />').attr({
			type:'text',
			id:'measurementLengthValue',
			size:'10'
		}));
		this.$form.append($('<span></span>').addClass('inputUnit').html('&mu;m'));
		this.$form.append('<br/>');
		this.$form.append($('<label></label>').addClass('editForm').attr('for', 'measurementAngleValue').html(_e('angle')));
		this.$form.append($('<input />').attr({
			type:'text',
			id:'measurementAngleValue',
			size:'10',
			maxlength:6		
		}));
		this.$form.append($('<span></span>').addClass('inputUnit measurementAngleField').html('&deg;'));
		$('body').append(this.$form);		
		var mC = this;
		
		this.$form.dialog({ 
			autoOpen:false,
			modal:true,
			open : function(){				
				$('#measurementLengthForm').attr('agreed', false);
			},
			beforeclose: function(){
				if(hasAgreed($('#measurementLengthForm').attr('agreed'))){
					try{
						var newLength = parseFloat($(this).find('input#measurementLengthValue').val());
						var newAngle = parseFloat($(this).find('input#measurementAngleValue').val());
					}
					catch(error){
						jAlert(_e('theenteredvalueisnotvalid'));
						return false;
					}
					// Verification on the entered value
					if(!checkFloat(newLength)){
						jAlert(_e('theenteredlengthisnotvalid'));
						return false;
					}	
					if(!checkFloat(newAngle)){
						jAlert(_e('theenteredangleisnotvalid'));
						return false;
					}
					if(newLength == 0){
						jAlert(_e('theenteredvalueisnotvalid'));
						return false;
					}
					if(newLength >= mC.pAppCTRL.ATLASViewportController.getMaxMeasurementLength()){
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
				if(hasAgreed($('#measurementLengthForm').attr('agreed'))){				
					var newLength = parseFloat($(this).find('input#measurementLengthValue').val());
					var newAngle = parseFloat($(this).find('input#measurementAngleValue').val());				
					newAngle = deg2Rad(newAngle);			
					
					var i = 0;
					while(i < mC.pAppCTRL.measurementController.selectedMeasurementList.length){
						try{
							mC.pAppCTRL.measurementController.selectedMeasurementList[i].setLength(newLength);
							mC.pAppCTRL.measurementController.selectedMeasurementList[i].setAngle(newAngle);
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
						$('#measurementLengthForm').attr('agreed', true);
						$(this).dialog('close');
					},
					'Cancel': function(){
						$('#measurementLengthForm').attr('agreed', false);
						$(this).dialog('close');}
				}
		});	
	}
});