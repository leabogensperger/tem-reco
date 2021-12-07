TProtractor = TMeasurementWithCaption.extend({
	init: function(x,y){
		this._super();
		this.line = new Array();
	/*	if((pt1 != undefined) && (pt2 != undefined))
			this.line.push(new TLine(pt1.clone(), pt2.clone()));
		else */
		this.line.push(new TLine(new TAtlasPoint(x,y), new TAtlasPoint(x,y)));
	/*	if((pt3 != undefined) && (pt4 != undefined))
			this.line.push(new TLine(pt3.clone(), pt4.clone()));
		else */
		this.line.push(new TLine(new TAtlasPoint(x,y), new TAtlasPoint(x,y)));
		this.arcRadius = 50;
		//this.startAngle = 0;
	//	this.endAngle = 0;
		this.type = TMeasurementType.protractor;
		this.m_bUpdateCaptionChangeCount = -1;
	},
	initVar: function(){
		this._super();
		this.className = 'TProtractor';
	},
	packInfo: function(obj){
		try{
			if(obj == undefined)
				var obj = new Object();
			obj.l0 = this.line[0].packInfo();
			obj.l1 = this.line[1].packInfo();
			obj.mClass =  'TProtractor';
			obj.caption = this.caption.packInfo();
			this._super(obj);
		}
		catch(error){
			displayError(error);
		}
		return obj;
	},
	fromJSON: function(obj){
		this._super(obj);
		this.line[0].fromJSON(obj.l0);
		this.line[1].fromJSON(obj.l1);
		this.caption.fromJSON(obj.caption);
	},
	toXML : function($n){
		this._super($n);
		$l = newXMLNode('Line1').appendTo($n);
		this.line[0].toXML($l);
		$l = newXMLNode('Line2').appendTo($n);
		this.line[1].toXML($l);
		newXMLNode('ArcRadius').html(this.arcRadius).appendTo($n);

	},
	fromXML: function($n){
		this._super($n);
		this.line[0].fromXML($n.children('Line1'));
		this.line[1].fromXML($n.children('Line2'));
		this.arcRadius = parseFloat($n.children('ArcRadius').text());
	},
	moveBy : function(delta){
		this.line[0].moveBy(delta);
		this.line[1].moveBy(delta);
		this.caption.moveBy(delta);
	},
	moveTo: function(pt){
		this.line[0].moveTo(pt);
		this.line[1].moveTo(pt);
	},
	setState : function(aState){
		this.state = aState;
		if(aState == TMeasurementState.idle){
			this.line[0].state = TMeasurementState.idle;
			this.line[1].state = TMeasurementState.idle;
		}
	},
	getAngle : function(){
		var a1 = this.line[0].angle();
		var a2 = this.line[1].angle();

		var angleCaption =  (360*(a2-a1)/(2*Math.PI));

		if(angleCaption < 0){
			angleCaption += 360;
		}
		return angleCaption;
	},
	setAngle: function(aA){
		var currentA = 2*Math.PI*(this.getAngle()/360);
		var delta = aA - currentA;
		this.line[0].setAngle(this.line[0].angle() - delta);
		this.updateNormCoords();
	},
	getCenter : function(){
		return new point((this.line[0].pt[0].x
							+ this.line[0].pt[1].x
							+ this.line[1].pt[0].x
							+ this.line[1].pt[1].x)/4,
							(this.line[0].pt[0].y
							+ this.line[0].pt[1].y
							+ this.line[1].pt[0].y
							+ this.line[1].pt[1].y)/4);
	},
	select: function(){
		this.line[0].select();
		this.line[1].select();
		this._super();
	},
	deselect: function(){
		this.line[0].deselect();
		this.line[1].deselect();
		this._super();
	},
	connectSegments : function(){
			this.line[0].registerMouseDown(this.line[0].pt[0]);
			this.line[0].moveTo(this.line[1].pt[0]);
			this.updateNormCoords();
	},
	updateCaption : function(SDConverter, forceUpdate){



		// this is necessary here since we update the caption here and updating the caption trigger a global display update change count.
		// so we want to minimize that.
		if ((this.m_bUpdateCaptionChangeCount == this.changeCount) && (!forceUpdate))
			return false;

		this.m_bUpdateCaptionChangeCount = this.changeCount;

		// do not update the caption if NOT in measurement mode and Lock to FOV
		var sg = new Segment(this.line[0].pt[0], this.line[0].pt[1]);
		var sg2 = new Segment(this.line[1].pt[0], this.line[1].pt[1]);

		// var a1 = this.line[0].angle(); // this.startAngle;//this.line[0].angle();
		// var a2 = this.line[1].angle(); //this.endAngle; //this.line[1].angle();
        //
		// var angleCaption =  (360*(a2-a1)/(2*Math.PI));
        //
		// if(angleCaption < 0){
		// 	angleCaption += 360;
		// }
		// use internal function instead
		var angleCaption = this.getAngle();

		var lengthUnit = '°';
		var lengthPrecision = 1;
		var a = sg.angle();
		var textOffset = 20;

		if((Math.abs(angleCaption) > 360)  || (Math.abs(angleCaption) < 0.1)){
			angleCaption = 0;
			lengthPrecision = 0;
		}

		var captionText = angleCaption.toFixed(lengthPrecision) +  '' + lengthUnit;
		this.caption.clear();
		this.caption.addLine(captionText);
	}
});
