// JavaScript Document

var TNodePoint = TAnchorPoint.extend({
	init: function(pt){	
		this._super(pt);		
		this.refPt = pt;
		this.displayPt = new TAtlasPoint(pt.x, pt.y);
	},
	moveBy : function(delta){
		this.refPt.x += delta.x;
		this.refPt.y += delta.y;
	},
	draw: function(pSDCNVTR, cnv){
		var ctx = cnv.getContext('2d');
			
		// Transform to pixel from microns
		var dPt = pSDCNVTR.pixelFromMicron(this.refPt, true);
		this.displayPt.x = dPt.x;
		this.displayPt.y = dPt.y;			
		ctx.fillStyle = this.nodeFillColor;
		ctx.strokeStyle = this.nodeStrokeColor;
		
		var x = this.displayPt.x - this.getSize()/2 + 0.5;
		var y =  this.displayPt.y - this.getSize()/2 + 0.5;
		var w = this.getSize();
		ctx.lineWidth = 1;
		ctx.strokeRect(x, y, w, w);
		ctx.fillRect(x, y, w, w);		
	},
	hitTest : function(pt, pSDConverter){		
		var dPt = pSDConverter.pixelFromMicron(this.refPt, true);
		this.displayPt.x = dPt.x;
		this.displayPt.y = dPt.y;			
		return this._super(pt, pSDConverter);
	}
});