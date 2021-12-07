// JavaScript Document
TUIElement = Class.extend({
	init: function(){
		this.$e = $('<div></div>');	
		this.visible = true;
		this.hideDirection = 'down';
	},
	isVisible: function(){
		return this.visible;
		//return this.$e.is(':isvisible');
	},
	toggle: function(){	
		if(this.visible) this.hideUI();
		else this.showUI();
	},
	resize: function(w, h){
		this.$e.outerWidth(w);
		this.$e.outerHeight(h);	
		$(this).trigger('changeSize');
	},
	appendTo: function($e){
		this.$e.appendTo($e);	
	},
	hideUI: function(){
		this.$e.hide('slide'/* + this.hideDirection*/, {direction: this.hideDirection});
		this.visible = false;
	},
	showUI: function(){
		this.$e.show('slide' /*+ this.hideDirection */, {direction: this.hideDirection});
		this.visible = true;
	}
});