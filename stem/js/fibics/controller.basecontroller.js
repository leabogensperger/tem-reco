// JavaScript Document

TBaseController = Class.extend({		
	init: function(){
		this.mouseIsDown = false;
		this.prevMouseXY = new TAtlasPoint(0,0);
		this.currentMouseXY = new TAtlasPoint(0,0);
		this.mouseDownXY = new TAtlasPoint(0,0);
	},
	shutDown: function(){		
	},	
	setState: function(aState){
		this.state = aState;	
	},
	mouseup: function(e, pt, pSDConverter, handled){
		this.mouseIsDown = false;
	},
	mousedown: function(e, pt, pSDConverter, handled){
		this.mouseIsDown = true;
		this.mouseDownXY.x = pt.x;
		this.mouseDownXY.y = pt.y;		
	},
	mousemove: function(e, pt, pSDConverter, handled){
		this.currentMouseXY.x = pt.x;
		this.currentMouseXY.y = pt.y;		
	}
});