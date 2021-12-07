TExportToPNG = TRectangularArea.extend({
	init: function(x,y,w,h){
		this._super(x,y,w,h);
		this.type = TMeasurementType.exporttopng;
		this.lineColor = g_exportToPNGColor;
		this.fillOpacity = 0.1;
	},
	initVar: function(){
		this._super();
		this.mClass = 'TExportToPNG';
	},
	getLineColor: function(){
		return g_exportLineColor;
	},
	updateCaption: function(pSDConverter){
		this.caption.textlines.length = 0;
		// get the display size
		var wh = pSDConverter.deltaPixelsFromMicrons(new Seadragon.Point(this.bounds.width, this.bounds.height));		
		this.caption.addLine(wh.x.toFixed(0) + ' x ' + wh.y.toFixed(0) + ' pixels');
		var totalPix = wh.x * wh.y;		
		totalPix /= 1E6;		
		this.caption.addLine((totalPix).toFixed(2) + ' megapixels');
		
		//this.caption
	}
});


g_exportLineColor = '#0000ff';