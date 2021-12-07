TRectangularArea = TMeasurement.extend({
	init: function(x,y,w,h){
		this._super();
		this.bounds = new rect(x,y,w,h);
		this.caption = new TCaption('', new TAtlasPoint(0,0));
		// need to be populated since it will be dragged.
		this.mouseDownPointUm.x = x;
		this.mouseDownPointUm.y = y;
	},
	initVar: function(){
		this._super();
		this.showCaption = true;
		this.type = TMeasurementType.rectangulararea;
		this.className = 'TRectangularArea';
	},
	packInfo: function(obj){
		try	 {
			if(obj == undefined)
				var obj = new Object();
			obj.mClass =  'TRectangularArea';
			obj.bounds = new Object();
			this.bounds.packInfo(obj.bounds);
			obj.caption = new Object();
			this.caption.packInfo(obj.caption);
			obj.showCaption = this.showCaption;
			this._super(obj);
		}
		catch(error){
			displayError(error);
		}
		return obj;
	},
	fromJSON: function (obj){
		this._super(obj);
		this.caption.fromJSON(obj.caption);
		this.showCaption = obj.showCaption;
		this.bounds.fromJSON(obj.bounds);
	},
	toXML : function($n){
		this._super($n);
		$c = newXMLNode('Caption').appendTo($n)
		this.caption.toXML($c);

		newXMLNode('ActiveAnchor').html(this.activeAnchor).appendTo($n);
		$c = newXMLNode('Bounds').appendTo($n);
		this.bounds.toXML($c);
		newXMLNode('ShowCaption').html(this.showCaption).appendTo($n);
		// save the call out
		if(this.callout != undefined) {
			$c = newXMLNode('Callout').appendTo($n);
			this.callout.toXML($c);
		}
	},
	fromXML: function($n){
		this._super($n);
		this.caption.fromXML($n.children('Caption'));
		this.bounds.fromXML($n.children('Bounds'));
		//this.center.fromXML($n.children('center'));
		this.showCaption = $n.children('ShowCaption').text() == 'true';
	},
	getCenter : function(){
		return new point(this.bounds.x + (this.bounds.width)/2, this.bounds.y + (this.bounds.height)/2);
	},
	scaleBy : function(sX, sY, pt){

		// In order to scale, we need to do the following
		//	1. Move its center to 0,0
		//	2. Scale it
		//	3. Move it back

		var c = this.getCenter();

		c.x = pt.x;
		c.y = pt.y;

		// First Translation
		var M = $M([[1, 0, c.x],
		        [0, 1, c.y],
		        [0, 0, 1]]);

		// The actual Scaling
		M = M.multiply($M([[sX, 0, 0],
		   	        [0, sY, 0],
		   	        [0, 0, 1]]));

		// Second Translation
		M = M.multiply($M([[1, 0, -c.x],
		                   [0, 1, -c.y],
		                   [0, 0, 1]]));

		this.transform(M);
	},
	transform: function(M){
		var vPt1 = $V([this.bounds.x, this.bounds.y, 1]);
		var vPt2 = $V([this.bounds.x + this.bounds.width, this.bounds.y + this.bounds.height, 1]);

		vPt1 = M.x(vPt1);
		vPt2 = M.x(vPt2);

		this.bounds.x = vPt1.e(1);
		this.bounds.y = vPt1.e(2);

		this.bounds.width = vPt2.e(1) - vPt1.e(1);
		this.bounds.height = vPt2.e(2) - vPt1.e(2);
	},
	moveTo : function(pt){
		var offsetPt;
		if(this.mouseDownRegistered){
			offsetPt = this.mouseDownPointUm;
		}
		// Take Center
		else{
			var aseg = new Segment(this.pt[0], this.pt[1]);
			offsetPt = aseg.center();
		}

		var delta = new TAtlasPoint(offsetPt.x - pt.x, offsetPt.y - pt.y);

		this.bounds.x -= delta.x;
		this.bounds.y -= delta.y;

		if(this.mouseDownRegistered){
			this.mouseDownPointUm.x -= delta.x;
			this.mouseDownPointUm.y -= delta.y;
		}

		if ((delta.x != 0)
				 || (delta.y != 0))
		this.incChangeCount();
	},
	moveBy : function(delta){
		this.bounds.x += delta.x;
		this.bounds.y += delta.y;
		this.incChangeCount();
	},
	setDimensions : function(W, H){
		this.bounds.width = W;
		this.bounds.height = H;
		this.incChangeCount();
	},
	getArea: function(){
		return this.bounds.getArea();
	},
	updateCaption : function() {
		var a = this.getArea();
		var w = this.bounds.width;
		var h = this.bounds.height;

		// Width
		wStr = formatDim(w, false);
		hStr = formatDim(h, false);
	
	  // Area
	/*	if(a < 1){
			a *= 1000000;
			var aUnits = ' nm²';
			var aStr = a.toFixed(0) + aUnits;
		}
		else if(a < 10){
			var aUnits = ' µm²';
			var aStr = a.toFixed(2) + aUnits;
		}
		else if(a < 100){
			var aUnits = ' µm²';
			var aStr = a.toFixed(1) + aUnits;
		}
		else{
			var aUnits = ' µm²';
			var aStr = a.toFixed(0) + aUnits;
		}
		var areaText = _e("area") + ": " + aStr;
		*/

		var areaText = _e("area") + ": " + formatArea(a, false);
		var wText = _e("width") + ": " + wStr;
		var hText = _e('height') + ": " + hStr;

		this.caption.clear();
		this.caption.addLine(areaText);
		this.caption.addLine(wText);
		this.caption.addLine(hText);
	},
	select: function(){
		this._super();
		if((this.caption != null) && (this.caption != undefined))
			this.caption.select();
	},
	deselect: function(){
		this._super();
		if((this.caption != null) && (this.caption != undefined))
			this.caption.deselect();
	}
});
