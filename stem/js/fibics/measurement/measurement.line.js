var TLine = TMeasurement.extend({
	init: function (pt1 /*TAtlasPoint*/, pt2 /*TAtlasPoint*/){
		this._super();
		this.initVar();

		if(pt1 != undefined)
			this.pt[0] = new TAtlasPoint(pt1.x, pt1.y);
		else
			this.pt[0] = new TAtlasPoint(0,0);

		if(pt2 != undefined)
			this.pt[1] = new TAtlasPoint(pt2.x, pt2.y);
		else
			this.pt[1] = new TAtlasPoint(0,0);

		//this.measurement.setState(TMeasurementState.inCreation);
		//this.callout = new TCallout(this.pt[0], this.caption.calloutPt);
		//this.caption.callout = this.callout;

	},
	initVar : function(){
		this._super();
		this.pt = new Array();
		//this.normPt = new Array();
		this.mouseDownPoint = undefined;
		this.className = 'TLine';
		this.showCaption = true;
		this.showAngle = true;
		this.activeNode = -1;
		this.type = TMeasurementType.line;
		//this.caption = new TCaption(new TAtlasPoint(0,0), '');
		//this.nodeList = new Array();
	},
	loadFromSavedData : function(pt1, pt2){
	/*	this.normPt[0].x = pt1.x;
		this.normPt[0].y = pt1.y;
		this.normPt[1].x = pt2.x;
		this.normPt[1].y = pt2.y;		*/
		// Transform Coords
	},
	getNotActiveNode : function(){
		if(this.activeNode == -1) return -1;
		else if(this.activeNode == 0) return 1;
		else return 0;
	},
	packInfo: function(obj){
		if(obj == undefined)
			obj = new Object();
		try{
			obj.pt0 = this.pt[0].packInfo();
			obj.pt1 = this.pt[1].packInfo();
			obj.showCaption = this.showCaption;
			obj.showAngle = this.showAngle;
			this._super(obj);
		}
		catch(error){
			displayError(error);
		}
		return obj;
	},
	fromJSON: function(obj){
		this._super(obj);
		this.showCaption = obj.showCaption;
		this.showAngle = obj.showAngle;
		this.pt[0].fromJSON(obj.pt0);
		this.pt[1].fromJSON(obj.pt1);
	},
	toXML: function($n){
		this._super($n);
		$p1 = newXMLNode('Pt1').appendTo($n);
		this.pt[0].toXML($p1);
		$p2 = newXMLNode('Pt2').appendTo($n);
		this.pt[1].toXML($p2);
		if((this.caption != undefined)
				&& (this.caption != null)){
					//case 5959
					var cn = newXMLNode('Caption').appendTo($n);
					this.caption.toXML(cn);
		}
		newXMLNode('ShowCaption').html( this.showCaption).appendTo($n);
		newXMLNode('ShowAngle').html(this.showAngle).appendTo($n);
	},
	fromXML: function ($n){
		this._super($n);
		this.pt[0].fromXML($n.children('Pt1'));
		this.pt[1].fromXML($n.children('Pt2'));
		/*this.normPt[0].fromXML($n.children('normpt1'));
		this.normPt[1].fromXML($n.children('normpt2'));*/
		if((this.caption != undefined)
			&& (this.caption != null))
			this.caption.fromXML($n.children('TextCaption'));
		var aSc = $n.children('ShowCaption');
		if(aSc != null)
			this.showCaption = aSc.text() == 'true';
		var an = $n.children('ShowAngle');
		if(an != null)
			this.showAngle = an.text() == 'true';
		/*
		var an = $n.children('pixelsize');
		if(an != null)
			this.pixelSize = parseFloat(an.text());
		*/
	},
	getCenter : function(){
		return new TAtlasPoint((this.pt[0].x + this.pt[1].x)/2, (this.pt[0].y + this.pt[1].y)/2);
	},
	setLength : function(l){
		var sg = new Segment(this.pt[0], this.pt[1]);
		var a = sg.angle();
		var r = sg.length();
		var delta = l-r;
		this.pt[0].x -= (delta*Math.cos(a)/2);
		this.pt[0].y -= (delta*Math.sin(a)/2);
		this.pt[1].x += (delta*Math.cos(a)/2);
		this.pt[1].y += (delta*Math.sin(a)/2);
		sg = null;
		this.incChangeCount();
	},
	setAngle : function(aA){
		var sg = new Segment(this.pt[0], this.pt[1]);
		sg.setAngle(aA);
		sg = null;
		this.incChangeCount();
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
	/*setPixelSize : function(ps){
		this.pixelSize = ps;
		this.updateCaption();
	},*/
	select : function(){
		if((this.caption != undefined)
			&& (this.caption != null))
			this.caption.select();
		this.selected = true;
	},
	deselect : function(){
		if((this.caption != undefined)
			&& (this.caption != null))
			this.caption.deselect();
		this.selected = false;
	},
	length : function(){
		return distance(this.pt[0], this.pt[1]);
	},
	angle : function(){
		 return Math.atan2(this.pt[0].y - this.pt[1].y, this.pt[1].x - this.pt[0].x);
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

		this.pt[0].x -= delta.x;
		this.pt[0].y -= delta.y;
		this.pt[1].x -= delta.x;
		this.pt[1].y -= delta.y;

		if(this.mouseDownRegistered){
			this.mouseDownPointUm.x -= delta.x;
			this.mouseDownPointUm.y -= delta.y;
		}
		this.incChangeCount();
	},
	moveBy: function(delta){
		this.pt[0].x += delta.x;
		this.pt[0].y += delta.y;
		this.pt[1].x += delta.x;
		this.pt[1].y += delta.y;
		this.incChangeCount();
	},
	updateCaption : function(){
		if((this.caption == null) || (this.caption == undefined)) return false;

		// Draw the length
		var textOffset = 10;
		this.updateCaptionPosition();
		var mustUpdate = false;

		// Check if must update if then g_showAngle was toggled...
		if(this.showAngle && g_showAngle && (this.caption.lines.length != 2))
			mustUpdate = true;
		else if((!(this.showAngle && g_showAngle)) && (this.caption.lines.length != 1))
			mustUpdate =  true;

		// do not update the caption if NOT in measurement mode and Lock to FOV
		if(!mustUpdate){
				return null;
		}
		var absLength = this.length();
		sLCaption = formatDim(absLength, false);
		this.caption.clear();
		this.caption.addLine(sLCaption);
		if(this.showAngle && g_showAngle){
			var aAn = (360*this.angle()/(2*Math.PI));
			if(aAn < 0) aAn += 180;
			else aAn -=180;
			this.caption.addLine((-aAn).toFixed(1) + "&deg;");
		}
	}
});
