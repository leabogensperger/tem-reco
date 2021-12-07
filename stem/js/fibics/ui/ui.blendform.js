// JavaScript Document

TBlendForm = Class.extend({
	init: function(pAppC){
			this.pAppsCTRL = pAppC;
			this.buildHTML();
			this.view = null;
	},
	shutDown: function(){
		this.$form.dialog('destroy');
		$('#BlendForm').remove();
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

buildHTML: function(){
	this.$form = $('<div></div>').attr({id:'BlendForm',
		title:_e('blending'),
		'class':'aDialog'});
	
	// add all the fields	
	this.addRow('Label', $('<input />').attr({'id': 'viewLabel', 'type':'text'}));
	this.addRow('Description', $('<textarea />').attr({'id':'viewDescription'}));
	this.addRow('Center', $('<div />').append($('<input />').attr({'id':'viewX', 'class':'viewCenterCoord', 'type':'text'})).append($('<input />').attr({'type':'text','id':'viewY', 'class':'viewCenterCoord'})));
	this.addRow('Width', $('<input />').attr({'id': 'viewWidth', 'class':'viewDim', 'type':'text'}), '&mu;m');
	this.addRow('Height', $('<input />').attr({'id': 'viewHeight', 'class':'viewDim', 'type':'text'}), '&mu;m');
		
	$('body').append(this.$form);	
	var mC = this;
	
	this.$form.dialog({
			autoOpen:false,
			modal:true,
			open : function(){				
					$('#BlendForm').attr('agreed', false);
				},
			beforeclose: function(){
				if(hasAgreed($('#BlendForm').attr('agreed'))){
					if(!mC.validateFields()){
						jAlert(_e('itappearsthatsomevalues'), _e('invalidfield'));	
						return false;
					}
					if(!mC.validateBounds()) return false;				
				}
			},
			close: function(){	
				if(hasAgreed($('#BlendForm').attr('agreed'))){				
					 mC.pushToView(mC.view);
					 $(mC.view).trigger('RefreshPreviewNeeded', [mC.view]);
					}						
				},
				buttons:{
					'OK': function(){
						$('#BlendForm').attr('agreed', true);
						$(this).dialog('close');
					},
					'Cancel': function(){
						$('#BlendForm').attr('agreed', false);
						$(this).dialog('close');}
				}
		});
},
show: function(){
	this.$form.dialog('open');	
}
});