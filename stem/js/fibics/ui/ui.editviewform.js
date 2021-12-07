// JavaScript Document

TEditViewForm = Class.extend({
	init: function(pAppC){
			this.pAppsCTRL = pAppC;
			this.buildHTML();
			this.view = null;
	},
	shutDown: function(){
		this.$form.dialog('destroy');
		$('#editViewForm').remove();
	},
	
addRow: function(caption, fields, postFields){
	var $div = $('<div />').addClass('editViewRow').appendTo(this.$form);
	$("<label>").html(caption).addClass('viewCaption').appendTo($div);
	$div.append(fields);
	$div.append(postFields);	
},
// takes a view and populates the fields of the form
populateFields: function(aView){
	this.$form.find('#viewLabel').val(aView.name);	
	this.$form.find('#viewDescription').val(aView.description);
	this.$form.find('#viewWidth').val(aView.dim.width.toFixed(1));
	this.$form.find('#viewHeight').val(aView.dim.height.toFixed(1));
	this.$form.find('#viewX').val(aView.center.x.toFixed(1));
	this.$form.find('#viewY').val(aView.center.y.toFixed(1));
},
// takes the fields value
pushToView: function(aView){
	aView.name = this.$form.find('#viewLabel').val();	
	aView.description = this.$form.find('#viewDescription').val();
	aView.dim.width = parseFloat(this.$form.find('#viewWidth').val());
	aView.dim.height = parseFloat(this.$form.find('#viewHeight').val());
	aView.center.x = parseFloat(this.$form.find('#viewX').val());
	aView.center.y = parseFloat(this.$form.find('#viewY').val());
},
validateFields: function(){	
	if(!$.isNumeric(this.$form.find('#viewWidth').val())) 
		return false;
	if(!$.isNumeric(this.$form.find('#viewHeight').val())) 
		return false;
	if(!$.isNumeric(this.$form.find('#viewX').val())) 
		return false;
	if(!$.isNumeric(this.$form.find('#viewY').val())) 
		return false;
	return true;
},
validateBounds: function(){
	var w = this.$form.find('#viewWidth').val();
	var h = this.$form.find('#viewHeight').val();
	var x = this.$form.find('#viewX').val();
	var y = this.$form.find('#viewY').val();
	
	var minW = this.pAppsCTRL.ATLASViewportController.getMinFOVExtension();
	var maxW = this.pAppsCTRL.ATLASViewportController.getMaxFOVExtension();
	var R = this.pAppsCTRL.ATLASViewportController.getViewAspectRatio();	
	
	if( Math.abs(w) < minW){
		jAlert( 'The width of the view cannot be smaller than ' + minW.toFixed(1) + ' &mu;m.',_e('invalidfield'));	
		return false;	
	}
	if( Math.abs(h) < minW*R){
		jAlert('The height of the view cannot be smaller than ' + (minW*R).toFixed(1)+ ' &mu;m.', _e('invalidfield') );	
		return false;	
	}
	
	if( x < (-maxW/2)){
		jAlert('The center x of the view cannot be smaller than ' + (-maxW/2).toFixed(1)+ ' &mu;m.', _e('invalidfield') );	
		return false;	
	}
	if( y < (-maxW*R/2)){
		jAlert('The center y of the view cannot be smaller than ' + (-maxW*R/2).toFixed(1)+ ' &mu;m.', _e('invalidfield') );	
		return false;	
	}
	if( x > (maxW/2)){
		jAlert('The center x of the view cannot be larger than ' + (maxW/2).toFixed(1)+ ' &mu;m.', _e('invalidfield') );	
		return false;	
	}
	if( y > (maxW*R/2)){
		jAlert('The center y of the view cannot be larger than ' + (maxW*R/2).toFixed(1)+ ' &mu;m.', _e('invalidfield') );	
		return false;	
	}
	
	return true;
},
buildHTML: function(){
	this.$form = $('<div></div>').attr({id:'editViewForm', title:_e('editview'), 'class':'aDialog'});
	
	// add all the fields	
	this.addRow(_e('label'), $('<input />').attr({'id': 'viewLabel', 'type':'text'}));
	this.addRow(_e('description'), $('<textarea />').attr({'id':'viewDescription'}));
	this.addRow(_e('center'), $('<div />').append($('<input />').attr({'id':'viewX', 'class':'viewCenterCoord', 'type':'text'})).append($('<input />').attr({'type':'text','id':'viewY', 'class':'viewCenterCoord'})));
	this.addRow(_e('width'), $('<input />').attr({'id': 'viewWidth', 'class':'viewDim', 'type':'text'}), '&mu;m');
	this.addRow(_e('height'), $('<input />').attr({'id': 'viewHeight', 'class':'viewDim', 'type':'text'}), '&mu;m');
		
	$('body').append(this.$form);	
	var mC = this;
	
	this.$form.dialog({
			autoOpen:false,
			modal:true,
			open : function(){				
					$('#editViewForm').attr('agreed', false);
				},
			beforeclose: function(){
				if(hasAgreed($('#editViewForm').attr('agreed'))){
					if(!mC.validateFields()){
						jAlert(_e('itappearsthatsomevalues'), _e('invalidfield'));
						return false;
					}
					if(!mC.validateBounds()) return false;				
				}
			},
			close: function(){	
				if(hasAgreed($('#editViewForm').attr('agreed'))){				
					 mC.pushToView(mC.view);
					 $(mC.view).trigger('RefreshPreviewNeeded', [mC.view]);
					}						
				},
				buttons:{
					'OK': function(){
						$('#editViewForm').attr('agreed', true);
						$(this).dialog('close');
					},
					'Cancel': function(){
						$('#editViewForm').attr('agreed', false);
						$(this).dialog('close');}
				}
		});
},
show: function(){
	this.$form.dialog('open');	
}
});