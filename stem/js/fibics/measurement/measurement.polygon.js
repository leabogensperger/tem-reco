// JavaScript Document
TPolygon = TMeasurement.extend({
	init: function(){
		this._super();
		this.type = TMeasurementType.polygonalArea;
		this.caption = new TCaption('', new TAtlasPoint(0,0));
		this.showCaption = true;
		this.pts = new Array();
	},
	initVar: function(){
		this._super();
		this.className = 'TPolygon';
	},
	addPoint: function(aPt){
		// make sure you create a new point
		var nPt = new TAtlasPoint(aPt.x, aPt.y);
		this.pts.push(nPt);
		this.incChangeCount();
	},
	/*//this always calculates values that are way too big
	getArea: function(){
		if(this.pts.length < 2) return 0;
		var a = 0;
		for(var i = 0; i < this.pts.length - 2; i++){
			a += (this.pts[i].x * this.pts[i+1].y) - (this.pts[i].y * this.pts[i+1].x);
		}
		a += (this.pts[this.pts.length - 1].x * this.pts[0].y) - (this.pts[this.pts.length - 1].y * this.pts[0].x)
		a = Math.abs(a/2);
		return a;
	},*/
	pointsToArray: function(pts){
		var i = 0; var v_X = []; var v_Y = [];
		for (var i = 0; i < this.pts.length; i++) {
			v_X[i] = this.pts[i].x;
			v_Y[i] = this.pts[i].y;
		}
		return {x:v_X,y:v_Y};
	},
	getArea: function(){
		if(this.pts.length < 2) return 0;

		var p = this.pointsToArray(this.pts);

		return Math.abs(this.polygonArea(p.x,p.y,this.pts.length));
	},
	polygonArea: function(X, Y, numPoints) {  //  https://www.mathopenref.com/coordpolygonarea2.html
		// Does not support self-intersecting polygons
		area = 0;         // Accumulates area in the loop
		j = numPoints-1;  // The last vertex is the 'previous' one to the first

		for (i=0; i<numPoints; i++) {
			area = area +  (X[j]+X[i]) * (Y[j]-Y[i]);
			j = i;  //j is previous vertex to i
		}
		return area/2;
	},
	getMaxBounds: function(){
		if(this.pts.length < 2) return 0;
		var p = this.pointsToArray(this.pts);
		var w_min = Math.min.apply(null,p.x);
		var w_max = Math.max.apply(null,p.x);
		var w = Math.abs(w_max-w_min);
		var h_min = Math.min.apply(null,p.y);
		var h_max = Math.max.apply(null,p.y);
		var h = Math.abs(h_max-h_min);
		return {width:w,height:h};
	},
	getCenter : function(){
		var c = new TAtlasPoint(0,0);
		var minX = 1E9;
		var minY = 1E9;
		var maxX = -1E9;
		var maxY = -1E9;
		for(var i = 0; i < this.pts.length; i++){
			minX = Math.min(this.pts[i].x, minX);
			maxX = Math.max(this.pts[i].x, maxX);
			minY = Math.min(this.pts[i].y, minY);
			maxY = Math.max(this.pts[i].y, maxY);
		}
		c.x = (minX + maxX)/2;
		c.y = (minY + maxY)/2;
		return c;
	},
	moveBy : function(delta){
		for(var i = 0; i < this.pts.length; i++){
			this.pts[i].x += delta.x;
			this.pts[i].y += delta.y;
		}
		this.incChangeCount();
	//this.caption.moveBy(delta);
	},
	moveTo : function(pt){
		var offsetPt;
		if(this.mouseDownRegistered){
			offsetPt = this.mouseDownPointUm;
		}
		// Take Center
		else{
			offsetPt = this.getCenter();
		}
		var delta = new TAtlasPoint(offsetPt.x - pt.x, offsetPt.y - pt.y);

		for(var i = 0; i < this.pts.length; i++){
			this.pts[i].x += delta.x;
			this.pts[i].y += delta.y;
		}
		this.incChangeCount();
	},
	movePointTo: function(i, umPt){
		this.pts[i].x = umPt.x;
		this.pts[i].y = umPt.y;
		this.incChangeCount();
	},
	packInfo: function(obj){
		try	 {

			if(obj == undefined)
				var obj = new Object();

			this._super(obj);

			//obj.mClass =  'TPolygon';
			obj.mClass =  this.className;
			
			obj.pts = new Array();
			for(var i = 0; i < this.pts.length; i++){
				obj.pts.push(this.pts[i].packInfo());
			}
			obj.caption = new Object();

			this.caption.packInfo(obj.caption);
		}
		catch(error){
			displayError(error);
		}
		return obj;
	},
	fromJSON: function (obj){
		this._super(obj);
		this.caption.fromJSON(obj.caption);

		for(var i = 0; i < obj.pts.length; i++){
				pt = new TAtlasPoint();
				pt.fromJSON(obj.pts[i])
				this.pts.push(pt);
			}
	},
	toXML : function($n){
		this._super($n);
		$ns = newXMLNode('Pts').appendTo($n);
		for(var i = 0; i < this.pts.length; i++){
			$nPt = newXMLNode('Pt').appendTo($ns);
			this.pts[i].toXML($nPt);
		}
		$l = $('<Caption />').appendTo($n);
		this.caption.toXML($l);
	},
	fromXML: function($n){
		this._super($n);
		var ns = $n.children('Pts');
		var me = this;
		ns.find('Pt').each(function(){
			pt = new TAtlasPoint(0,0);
			pt.fromXML($(this))
			me.pts.push(pt);
		});
	}
});
