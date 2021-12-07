// JavaScript Document

TBlendingInfo = Class.extend({
	init: function(){		
		this.visible = true;
		this.strength = 1;
		this.blendingMode = 'overlay';
		this.canvas = null;
		this.uid = guid();
	}
});

TAtlasBlendingInfo = TBlendingInfo.extend({
	init: function(){		
		this._super();
		this.signal = 0;
		this.signalName = '';
	}
});