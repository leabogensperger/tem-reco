TLongMeasurement = TSimpleMeasurement.extend({
	init: function (pt1, pt2, aLongType){
		this._super(pt1, pt2);		
		this.longMeasurementType = aLongType;
		if(this.longMeasurementType == TLongMeasurementType.horizontal)
			this.type = TMeasurementType.horizontaltool;
		if(this.longMeasurementType == TLongMeasurementType.vertical)
			this.type = TMeasurementType.verticaltool;
	},
	initVar: function(){
		this._super();
		this.className = 'TLongMeasurement';
	},
	updateCaption: function(){
		switch(this.longMeasurementType){
			case TLongMeasurementType.horizontal:
				var absLength = Math.abs(this.pt[0].x - this.pt[1].x);
				
			break;
			case TLongMeasurementType.vertical:
				var absLength = Math.abs(this.pt[0].y - this.pt[1].y);
			break;
		}
		var absLength = this.length();
		sLCaption = formatDim(absLength, false);		
		this.caption.clear();
		this.caption.addLine(sLCaption);
	},
	toXML: function ($n){
		this._super($n);
		newXMLNode('LongMeasurementType').html(this.longMeasurementType).appendTo($n);	
	},
	fromXML: function($n){
		this._super($n);
		this.longMeasurementType  = parseInt($n.children('LongMeasurementType').text());
	},
	setAngle : function(aA){
		// no op.
	},
	packInfo: function(obj){
		if(obj == undefined) 
			obj = new Object();
		this._super(obj);
		try{
			this._super(obj);
			obj.longMeasurementType = this.longMeasurementType;
		}
		catch(error){
			displayError(error);
		}
		return obj;
	},
	fromJSON: function(obj){
		this._super(obj);
		this.longMeasurementType = obj.longMeasurementType;
	}
});