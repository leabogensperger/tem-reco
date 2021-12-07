TSimpleMeasurement = TLine.extend({
	init: function (pt1, pt2){
		this._super(pt1, pt2);
		this.caption = new TCaption('', new TAtlasPoint(0,0));	
		this.showEnds = true;
		this.type = TMeasurementType.pointtopoint;
		this.endBarLength = g_defaultEndBarLength;
		this.captionChangeCount = -1;
	},
	initVar: function(){
		this._super();
		this.className = 'TSimpleMeasurement';
	},
	packInfo: function(obj){
		if(obj == undefined) 
			obj = new Object();
		this._super(obj);
		try{
			obj.showEnds = this.showEnds;
			obj.caption = new Object();
			this.caption.packInfo(obj.caption);
		}
		catch(error){
			displayError(error);
		}
		return obj;
	},
	fromJSON: function(obj){
		this._super(obj);
		this.caption.fromJSON(obj.caption);
	},
	updateCaption : function(pSDCNVTR){
		if((this.caption == null) || (this.caption == undefined)) return false;
	//	if(this.captionChangeCount == this.caption.changeCount) return false;
		
	//	this.captionChangeCount = this.caption.changeCount;
		
		// Draw the length
		var textOffset = 10;		
		var mustUpdate = false;
		
		// Check if must update if then g_showAngle was toggled...
		if(this.showAngle && g_showAngle && (this.caption.textlines.length != 2))
			mustUpdate = true;
		else if((!(this.showAngle && g_showAngle)) && (this.caption.textlines.length != 1)) 
			mustUpdate =  true;
		
		// do not update the caption if NOT in measurement mode and Lock to FOV
		if(!isDefined(pSDCNVTR) && ! mustUpdate){
			return false;
		}	
				
		var absLength = this.length();
		sLCaption = formatDim(absLength, false);		
		this.caption.clear();
		this.caption.addLine(sLCaption);	
		
		if(this.showAngle && g_showAngle){
			aAn = rad2Deg(this.angle());
			this.caption.addLine((aAn).toFixed(1) + "°");	
		}
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
	},
	getTextOutlineColor: function(){
		return this.caption.getTextOutlineColor();	
	}
});