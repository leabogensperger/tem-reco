TMagCalibrationForm = Class.extend({
	init: function(pAppCTRL){
		this.pAppsCTRL = pAppCTRL;
		this.buildCalMagForm();
		this.calMagUnits = 'mm';
	},
	shutDown: function(){
		this.$calMagDiv.dialog('destroy');
		this.$calMagDiv.remove();
	},
	buildCalMagForm: function(){
		
		var me = this;
		this.$calMagDiv = $("<div></div>").attr({'id': 'magCalibration', 'title': _e('screenmagnificationcalibration'), 'class': 'aDialog'});
		this.$calMagDiv.append($('<p></p>').html(_e('pleasemeasuretheredline')));
		this.$calMagDiv.append($('<div></div>').addClass('magCalLineMargin').append($('<div></div>').attr('id', 'magCalLine')));
		
		this.$calMagDiv.append($('<table></table>').append($('<tr></tr>')));
		this.$calMagDiv.find('tr').append($('<td></td>'));
		this.$calMagDiv.find('td').append($('<label></label>').attr({'for':'lineLength'}).html('Line Length'));
		this.$calMagDiv.find('label').after($('<input></input>').attr({type:'text', 'id':'lineLength', 'size':'10'}));
		this.$calMagDiv.find('td').after($('<td></td>'));
		this.$calMagDiv.find('td:last').append($('<div></div>').attr({'id': 'imperialUnits', 'class':'buttonSet'}));
		this.$calMagDiv.find('#imperialUnits').append($('<input></input>').attr({'type':"radio",'name':'imperialUnits', 'id':'imperialUnits1', 'checked':"checked", 'value':'mm'}));
		this.$calMagDiv.find('#imperialUnits').append($('<label></label>').attr('for', 'imperialUnits1').html('mm'));
		this.$calMagDiv.find('#imperialUnits').append($('<input></input>').attr({'type':"radio",'name':'imperialUnits', 'id':'imperialUnits2', 'value': 'inch'}));
		this.$calMagDiv.find('#imperialUnits').append($('<label></label>').attr('for', 'imperialUnits2').html(_e('inch')));
		this.$calMagDiv.append($('<p></p>').addClass('note').html(_e('notemonitordependent')));
		this.$calMagDiv.find('#imperialUnits').buttonset();
		
		
		this.$calMagDiv.find('#imperialUnits').children('input').on(TouchMouseEvent.DOWN, function(){  // former click
			try{
				var currentVal = parseFloat($('#lineLength').val());
				if(isNaN(currentVal)) return null;
			}
			catch(error){
				currentVal = 0;
			}
			newVal = $('#lineLength').val();
			if($(this).val() == 'inch' && (me.calMagUnits != 'inch')){
				newVal = (currentVal/25.4).toFixed(2);
				me.calMagUnits = 'inch';
			}
			else if(($(this).val() == 'mm') && (me.calMagUnits != 'mm')){
				newVal = (currentVal*25.4).toFixed(0);
				me.calMagUnits = 'mm';
			}
			$('#lineLength').val(newVal);
		});
		
		this.$calMagDiv.dialog({ autoOpen: false,
			modal:true,
			show: "fade",
			hide: "fade",
			beforeclose: function(){
				// Verification on the entered value
				// Calculate the DPMM (dot per mm).
				if(hasAgreed($('#magCalibration').attr('agreed'))){
					var lineLength = parseFloat($(this).find('#lineLength').val());
					if(!checkForEmptyVal(lineLength)){
						jAlert(_e('theenteredvalueisnotvalid'));
						return false;
					}		
					else if((!checkFloat(lineLength)) || (lineLength == 0)){
						jAlert(_e('theenteredvalueisnotvalid'));
						return false;
					}
				}
				return true;		
			},
			close: function(){
				
			},
			open : function(){
				$('#magCalibration').attr('agreed', false);
			},
			closeOnEscape:false,
			width:600,
			resizable:false, 
			buttons: {	
				'OK' : function(){
					$('#magCalibration').attr('agreed', true);
					$(this).dialog('close');
				},
				'Cancel' : function(){
					$('#magCalibration').attr('agreed', false);
					$(this).dialog('close');
				}}
			});
		this.$calMagDiv.on('dialogclose', function(){
			if(hasAgreed($('#magCalibration').attr('agreed'))){
				var lineLength = parseFloat($(this).find('#lineLength').val());
				if($('#imperialUnits').children(':checked').val() == 'inch'){			
					lineLength = lineLength*25.4;
				}			
				G_PIXELTOMM = 500/lineLength;
				me.pAppsCTRL.ioStorage.globalSave('screenDPItomm',G_PIXELTOMM);
			}
		});
	}	
});