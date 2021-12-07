// JavaScript Document

var g_pScaleBarFixedWidthForm = null;

TScaleBarFixedWidthForm = Class.extend({
	init: function(pScaleBar){
		this.pScaleBar = pScaleBar;
		g_pScaleBarFixedWidthForm = this;
		this.buildHTML();
	},
	show: function(){
		this.$e.dialog('open');
	},
	hide: function(){
		
	},
	apply: function(){
		var fixedW = parseFloat(this.$e.find('#fixedScaleBarWidth').val());
		if (isNaN(fixedW)){
		jAlert(_e('theenteredwidthisnotvalid'));																
		}
		else{
			this.pScaleBar.fixedValue = fixedW;	
			
		}
		this.pScaleBar.draw();
		this.$e.dialog('close');	
	},
	buildHTML: function(){
		var me = this;
		this.$e = $("<div />").attr({'id':'ScaleBarFixedWidthForm'});			
		this.$e.append($('<div />').html("<label>" + _e('fixedwidth') + "</label><input id='fixedScaleBarWidth' type='text' />&mu;m"));
		this.$e.find('#fixedScaleBarWidth').keydown(function(e){
			if(e.which == 13){
				me.apply();	
			}																										 
		});
		this.$e.dialog({
									 'modal':true,
									 'resizable': false,
									 'open': function(e, ui){
											ui.find('#fixedScaleBarWidth').focus();
									 },
									 'title': _e('setthewidthofthescalebar'),
									 buttons:{'Ok':function(){															
															me.apply();
														}, 
														'Cancel':function(){
															$(this).dialog('close');
														},
														'Make Variable':function(){
															if(me.pScaleBar != null)																
																me.pScaleBar.fixedValue = null;
															$(this).dialog('close');
														}}
									});
	}
});

