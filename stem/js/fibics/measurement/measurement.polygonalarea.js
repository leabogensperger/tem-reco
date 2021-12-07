TPolygonalArea = TPolygon.extend({
	init: function(x,y,w,h){
		this._super(x,y,w,h);
		this.caption = new TCaption('', new TAtlasPoint(0,0));
	},
	initVar: function(){
		this._super();
		this.className = 'TPolygonalArea';
		this.name = _e('polygonalarea');
		this.type = TMeasurementType.PolygonalArea;
	},
	updateCaption: function(){
		var a = this.getArea();
		var MaxBounds = this.getMaxBounds();
		var w = MaxBounds.width;
		var h = MaxBounds.height;
		wStr = formatDim(w, false);
		hStr = formatDim(h, false);

		var areaText = _e("area") + ": " + formatArea(a, false);
		var wText = _e("width") + ": " + wStr;
		var hText = _e('height') + ": " + hStr;

		this.caption.clear();
		this.caption.addLine(areaText);
		this.caption.addLine(wText);
		this.caption.addLine(hText);
	}
});
