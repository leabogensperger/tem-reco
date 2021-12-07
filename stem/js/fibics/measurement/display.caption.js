TDisplayCaption = TDisplayMeasurement.extend({
	init: function(M){
	this._super(M);	
	var tempPt = new TAtlasPoint(0,0);
	this.displayBounds = new rect(0, 0, 0, 0);
	//this.activeAnchor = -1;
	this.mouseDownPoint = undefined;
	this.isCustomFontSize = false;
	this.displayCenter = new TAtlasPoint(0, 0);
	this.calloutPt = this.displayCenter;//new TAtlasPoint(pt.x, pt.y);
	this.callout = null;
	this.normPt = new TAtlasPoint();
	// All for moving the anchor
	this.oppositeAnchorPos = new TAtlasPoint(0,0);
	this.initialAnchorPos = new TAtlasPoint(0,0);
	this.initFontSize = this.measurement.getFontSize();
	this.initBounds = new rect(0,0,0,0);	
	this.anchorList[0] = new TAnchorPoint(tempPt); 
	this.anchorList[1] = new TAnchorPoint(tempPt);
	this.anchorList[2] = new TAnchorPoint(tempPt);
	this.anchorList[3] = new TAnchorPoint(tempPt);
	this.displayBasePt = new TAtlasPoint(0,0);
	this.textDisplayDim = new rect(0,0,0,0);
	this.updateBoundsFlag = true;
	this.mouseActive = false;
	this.measChangeCount = -1;
	
	var me = this;	
	this.mustUpdateDisplaySize = true;
	//this.updateAnchorWithBasePointRequired = false;
	$(M).on('onUpdateBoundsFlag',  function(e){
		me.updateBoundsFlag = true;
	});
	$(M).on('onResetDisplaySize', function(e, MM){
		me.mustUpdateDisplaySize = true;
	});
},
setFontSize : function(newFontSize){
	this.measurement.setFontSize(newFontSize);
},
getDisplayTopLeft : function(){
	return new TAtlasPoint(this.displayBounds.x, this.displayBounds.y);
},
moveBy : function(delta){
	this.displayBasePt.x += delta.x;
	this.displayBasePt.y += delta.y;
	this.displayBounds.x += delta.x;
	this.displayBounds.y += delta.y;
	this.displayBounds.width += 2*delta.x;
	this.displayBounds.height += 2*delta.y;
	//this.updateAnchorWithBasePointRequired = true;
},
getTextWithBR: function(){		
	return this.textlines.join('\n');
},
setPixelSize : function(ps){
	this.pixelSize = ps;	
},
moveToFromReferencePoint : function(pt, refPoint){
	this.displayBasePt.x = pt.x;
	this.displayBasePt.y = pt.y;	
	this.measurement.incChangeCount();	
},
registerMouseDown : function(pt){
	this.mouseDownPoint = pt.clone();		
},
hitTest: function(pt, pSDConverter){
	
	if(!this.measurement.isVisible) 
		return false;	
	var i = 0;
	
	if(this.measurement.nodeVisible){
		while(i < this.anchorList.length){
			if(this.anchorList[i].hitTest(pt, pSDConverter)){
				this.measurement.activeAnchor = i;
				return true;
			}			
			i++;	
		}
	}
	return this.displayBounds.hitTest(pt);		
},
updateBoundsAndCenterFromAnchor : function(avp){
	this.displayBounds.width = Math.abs(this.anchorList[0].displayPt.x - this.anchorList[1].displayPt.x);
	this.displayBounds.height = Math.abs(this.anchorList[0].displayPt.y - this.anchorList[2].displayPt.y);
	this.displayCenter.x = (this.anchorList[0].displayPt.x + this.anchorList[1].displayPt.x)/2;
	this.displayCenter.y = (this.anchorList[0].displayPt.y + this.anchorList[3].displayPt.y)/2;	
	
	if(this.measurement.textAlign == 'left'){
		this.displayBasePt.x = this.displayCenter.x + (g_captionPadding) - (this.displayBounds.width/2);	
	}
	else if(this.measurement.textAlign == 'right'){
		this.displayBasePt.x = this.displayCenter.x  + (this.displayBounds.width/2) - (g_captionPadding);	
	}
	else{ // center
		this.displayBasePt.x = this.displayCenter.x ;
	}
	
	if(this.measurement.baseline == 'top'){
		this.displayBasePt.y = this.displayCenter.y + (g_captionPadding) - ((this.displayBounds.height/2));			
	}
	else if(this.measurement.baseline == 'bottom'){
		this.displayBasePt.y = this.displayCenter.y  + ((this.displayBounds.height/2)) - (g_captionPadding);			
	}
	else
		this.displayBasePt.y = this.displayCenter.y;
			
	this.displayBounds.x = this.displayCenter.x - (this.displayBounds.width/2);
	this.displayBounds.y = this.displayCenter.y - (this.displayBounds.height/2);
	
	// Update the base point from the measurement
	var bPt = avp.micronFromPixel(this.displayBasePt, true);
	/*this.measurement.basePt.x = bPt.x;
	this.measurement.basePt.y = bPt.y;*/	
},
mousemove : function(e, pt, pSDConverter){
	var umPt = pSDConverter.micronFromPixel(pt, true);
	switch(this.measurement.state){
		case TMeasurementState.moveAnchor:
			this.mouseMoveOnAnchor(pt, pSDConverter);
		break;
		case TMeasurementState.moveShape:
			this.measurement.moveTo(umPt);
		break;
	}	
},
mouseMoveOnAnchor: function (pt, avp){
	if(this.measurement.activeAnchor == -1) return false;
	
	this.anchorList[this.measurement.activeAnchor].displayPt.x = pt.x;
	this.anchorList[this.measurement.activeAnchor].displayPt.y = pt.y;
	
	// supposed w & h
	var sW = Math.abs(this.anchorList[this.measurement.activeAnchor].displayPt.x - this.oppositeAnchorPos.x);
	var sH = Math.abs(this.anchorList[this.measurement.activeAnchor].displayPt.y - this.oppositeAnchorPos.y);
	var dirX = Math.abs(this.oppositeAnchorPos.x - pt.x)/(this.oppositeAnchorPos.x - pt.x);
	var dirY = Math.abs(this.oppositeAnchorPos.y - pt.y)/(this.oppositeAnchorPos.y - pt.y);
	
	// must maintain aspect ratio
	var hAR = sH/this.initBounds.height;
	var wAR = sW/this.initBounds.width;
	var usedAR = Math.max(hAR, wAR);

	this.measurement.setFontSize(Math.max(1,Math.abs(this.initFontSize*usedAR)));	
	
},
updateBasePointFromAnchor: function(avp){
	var maxX = -1E9;
	var maxY = -1E9;
	var minX = 1E9;
	var minY = 1E9;
	
	var i = 0;
	while(i < this.anchorList.length){
		maxX =  Math.max(maxX, this.anchorList[i].displayPt.x);
		maxY =  Math.max(maxY, this.anchorList[i].displayPt.y);
		minX =  Math.min(minX, this.anchorList[i].displayPt.x);
		minY =  Math.min(minY, this.anchorList[i].displayPt.y);
		i++;
	}
	
	// Remove the padding
	maxX -= g_captionPadding;
	maxY -= g_captionPadding;
	minX += g_captionPadding;
	minY += g_captionPadding;	
	
	if(this.measurement.textAlign == 'left'){
		this.displayBasePt.x = minX;		
	}
	else if(this.measurement.textAlign == 'right'){
		this.displayBasePt.x = maxX;
	}
	else{ // center
		this.displayBasePt.x = (maxX + minX)/2;
	}
	
	if(this.measurement.baseline == 'top'){
		this.displayBasePt.y = minY;		
	}
	else if(this.measurement.baseline == 'bottom'){
		this.displayBasePt.y = maxY;
	}
	else
		this.displayBasePt.y = (minY + maxY)/2;
	
	var dBasePt = avp.micronFromPixel(this.displayBasePt, true);
	this.measurement.basePt.x = dBasePt.x;
	this.measurement.basePt.y = dBasePt.y;	
},
getTextDisplaySize : function(pCNV){
	if(this.mustUpdateDisplaySize){
		this.textDisplaySize = this.measurement.getTextDim(pCNV);
		this.mustUpdateDisplaySize = false;
	}	
	return this.textDisplaySize;
},
updateAnchorUsingBasePoint: function(pSDConverter, cnv){
	this.displayBasePt = pSDConverter.pixelFromMicron(this.measurement.basePt, true);
	var textDim = this.getTextDisplaySize(cnv);
	this.displayBounds.width = textDim.width + 2*g_captionPadding;
	this.displayBounds.height = textDim.height + 2*g_captionPadding;
	
	if(this.measurement.textAlign == 'left'){
		this.displayBounds.x = this.displayBasePt.x - g_captionPadding;		
	}
	else if(this.measurement.textAlign == 'right'){
		this.displayBounds.x = this.displayBasePt.x - (g_captionPadding + (textDim.width));
	}
	else{ // center
		this.displayBounds.x = this.displayBasePt.x - (g_captionPadding + (textDim.width/2));
	}
	
	if(this.measurement.baseline == 'top'){
		this.displayBounds.y = this.displayBasePt.y - g_captionPadding;		
	}
	else if(this.measurement.baseline == 'bottom'){
		this.displayBounds.y = this.displayBasePt.y - (g_captionPadding + textDim.height);
	}
	else
		this.displayBounds.y = this.displayBasePt.y - (g_captionPadding + (textDim.height)/2);	
	
	// Update the anchor points
	this.anchorList[0].displayPt.x = this.displayBounds.x;
	this.anchorList[0].displayPt.y = this.displayBounds.y;		
	this.anchorList[1].displayPt.x = this.displayBounds.x + this.displayBounds.width;
	this.anchorList[1].displayPt.y = this.displayBounds.y;		
	this.anchorList[2].displayPt.x = this.displayBounds.x + this.displayBounds.width;
	this.anchorList[2].displayPt.y = this.displayBounds.y +  this.displayBounds.height;		
	this.anchorList[3].displayPt.x = this.displayBounds.x ;
	this.anchorList[3].displayPt.y = this.displayBounds.y +  this.displayBounds.height;
	//this.updateAnchorWithBasePointRequired = false;
	
},
mouseup: function(e, pt, pSDConverter){
	switch(this.measurement.state){
		case TMeasurementState.inCreation:			
		break;
		case TMeasurementState.moveShape:
		case TMeasurementState.moveAnchor:
			this.measurement.setState(TMeasurementState.idle);	
		break;
	}	
	this.measurement.activeAnchor = -1;
},
mousedown : function(e, pt, avp){
	var umPt = avp.micronFromPixel(pt, true);
	var i = 0;		
	this.mouseDownPoint = pt;
	this.measurement.mouseDownPointUm.x = umPt.x;
	this.measurement.mouseDownPointUm.y = umPt.y;
	if((this.measurement.activeAnchor > -1) && (this.measurement.selected)){
		this.initialAnchorPos.x = this.anchorList[this.measurement.activeAnchor].displayPt.x;
		this.initialAnchorPos.y = this.anchorList[this.measurement.activeAnchor].displayPt.y;
		this.initFontSize = parseFloat(this.measurement.getFontSize());
		this.initBounds.x = this.displayBounds.x;
		this.initBounds.y = this.displayBounds.y;
		this.initBounds.width = this.displayBounds.width;
		this.initBounds.height = this.displayBounds.height;		
		
		switch(this.measurement.activeAnchor){
			case 0: // Top Left
				this.oppositeAnchorPos.x = this.anchorList[2].displayPt.x;
				this.oppositeAnchorPos.y = this.anchorList[2].displayPt.y;				
			break;
			case 1: // Top Right
				this.oppositeAnchorPos.x = this.anchorList[3].displayPt.x;
				this.oppositeAnchorPos.y = this.anchorList[3].displayPt.y;	
			break;
			case 2: // Bottom right
				this.oppositeAnchorPos.x = this.anchorList[0].displayPt.x;
				this.oppositeAnchorPos.y = this.anchorList[0].displayPt.y;
			break;
			case 3: // Bottom Left
				this.oppositeAnchorPos.x = this.anchorList[1].displayPt.x;
				this.oppositeAnchorPos.y = this.anchorList[1].displayPt.y;
			break;			
		}		 
		this.measurement.setState(TMeasurementState.moveAnchor);
		this.mouseActive = true;
	}
	else if(this.measurement.state == TMeasurementState.inCreation){
		this.measurement.basePt.x = umPt.x;
		this.measurement.basePt.y = umPt.y;		
	}
	else if(this.displayBounds.hitTest(pt)){
		this.measurement.setState(TMeasurementState.moveShape);
	}	
},
updateTextDisplayDim : function(pCNV){
	var dtd = this.measurement.getTextDim(pCNV);
	this.textDisplayDim.width = dtd.width;
	this.textDisplayDim.height = dtd.height;	
},
dblclick : function(e, pt, pSDConverter){		
	this.measurement.hasCustomPosition = false;
	this.measurement.incChangeCount();
	//this.updateBoundingBox(pSDConverter);
},
updateBoundingBox : function(pSDConverter, pCNV){	
			
	// if no Context is passed, it means that the width (the text) has not changed.
	if(pCNV == undefined){
	}
	else{
		pCNV.font = "bold " +  this.measurement.getFontSize() +  "px " + this.measurement.getFontFamily();	
	}	
	this.updateTextDisplayDim(pCNV);	
	this.displayBounds.height =  this.textDisplayDim.height;//this.measurement.getTextDisplayHeight();// + (g_captionPadding*2);	
	this.displayBounds.width = this.textDisplayDim.width; //this.getTextWidth(AVP);// + (g_captionPadding*2);
	
	this.displayBasePt = pSDConverter.pixelFromMicron(this.measurement.basePt, true);
	
	if(this.measurement.baseline == 'middle'){
		this.displayBounds.y = this.displayBasePt.y - (this.displayBounds.height/2) ;//- (parseFloat(this.measurement.getFontSize())*0.5);	
	}
	else if(this.measurement.baseline == 'bottom'){
		this.displayBounds.y = this.displayBasePt.y - (this.displayBounds.height);
	}
	else if(this.measurement.baseline == 'top'){
		this.displayBounds.y = this.displayBasePt.y ; 
	}			
			
	if( (this.measurement.textAlign == "left")){
		this.displayBounds.x = this.displayBasePt.x;
	}
	else if((this.measurement.textAlign == "center")){
		this.displayBounds.x = this.displayBasePt.x - (this.textDisplayDim.width*0.5);
	}
	else{
		this.displayBounds.x = this.displayBasePt.x - this.textDisplayDim.width*1;
	}
	
	this.displayBounds.height =  this.textDisplayDim.height + (g_captionPadding*2);	
	this.displayBounds.width = this.textDisplayDim.width + (g_captionPadding*2);
	this.displayBounds.x = this.displayBounds.x - g_captionPadding;
	this.displayBounds.y = this.displayBounds.y - g_captionPadding;	
				
	// Update the anchor points
	this.anchorList[0].displayPt.x = this.displayBounds.x;
	this.anchorList[0].displayPt.y = this.displayBounds.y;		
	this.anchorList[1].displayPt.x = this.displayBounds.x + this.displayBounds.width;
	this.anchorList[1].displayPt.y = this.displayBounds.y;		
	this.anchorList[2].displayPt.x = this.displayBounds.x + this.displayBounds.width;
	this.anchorList[2].displayPt.y = this.displayBounds.y +  this.displayBounds.height;		
	this.anchorList[3].displayPt.x = this.displayBounds.x ;
	this.anchorList[3].displayPt.y = this.displayBounds.y +  this.displayBounds.height;	
	
	this.displayCenter.x = this.displayBounds.x + this.displayBounds.width/2;
	this.displayCenter.y = this.displayBounds.y + this.displayBounds.height/2;

	if(g_showCallOutTail){
		if((this.callout != undefined) && (this.callout != null)){   
			var aPt = getIntersectionRectSegment(this.displayBounds, this.callout.segment, true);
			if(aPt != null){
				this.callout.endPt.x = aPt.x;
				this.callout.endPt.y = aPt.y;		
			}		
		}
	}
	this.updateBoundsFlag = false;
},	
drawAnchor : function(pSDCNVTR, cnv){
	var i = 0;
	while(i<this.anchorList.length){
		this.anchorList[i].draw(pSDCNVTR, cnv);
		i++;
	}
},
draw: function(pSDCNVTR, cnv){
	if (this.measurement.getText() == '') return false;
	
	var ctx = cnv.getContext('2d');	
	ctx.font = "bold " +  this.measurement.getFontSize() +"px " + this.measurement.getFontFamily();
	
	if((this.measChangeCount != this.measurement.changeCount) || (this.viewportChanged)) {
		if(!this.mouseActive) 
			this.updateBoundingBox(pSDCNVTR, cnv); 
		this.updateAnchorUsingBasePoint(pSDCNVTR, cnv);
		this.measChangeCount = this.measurement.changeCount;
	}

	ctx.textAlign = this.textAlign;		
	ctx.textAlign = this.measurement.textAlign;
	if(g_drawTextSolidBackground){
		ctx.fillStyle =  this.measurement.getTextOutlineColor();
		ctx.fillRect(this.displayBounds.x, this.displayBounds.y, this.displayBounds.width, this.displayBounds.height);		
	}	
	if((this.measurement.selected) && (this.measurement.nodeVisible))
		this.drawAnchor(pSDCNVTR, cnv);		

	var i = 0;			
	// OLD WAY
	ctx.textAlign = this.measurement.textAlign;
	this.displayBasePt = pSDCNVTR.pixelFromMicron(this.measurement.basePt, true);
	switch(this.measurement.baseline){
		case 'top':
			var initY = this.displayBasePt.y; //+ g_captionPadding;		
		break;
		case 'middle':
			var initY = this.displayBasePt.y - ((this.displayBounds.height - (2*g_captionPadding))/2);		
		break;
		case 'bottom':
			var initY = this.displayBasePt.y - ((this.displayBounds.height - (2*g_captionPadding)));		
		break;
	}	
	
	while(i < this.measurement.textlines.length){		
		ctx.textBaseline = 'top';		
		ctx.strokeStyle = this.measurement.getTextOutlineColor();
		ctx.lineWidth = 0.1*this.measurement.getFontSize(); 
		if(!g_drawTextSolidBackground){
			ctx.beginPath();
			ctx.strokeText(this.measurement.textlines[i],  this.displayBasePt.x,  initY + (this.measurement.getLineHeight() * i));		
			ctx.closePath();
		}
		ctx.fillStyle = this.measurement.textColor;		
		ctx.fillText(this.measurement.textlines[i], this.displayBasePt.x,  initY + (this.measurement.getLineHeight() * i));	
		i++;			
	}
}
});