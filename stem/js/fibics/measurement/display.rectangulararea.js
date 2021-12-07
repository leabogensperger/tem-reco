TDisplayRectangularArea = TDisplayMeasurement.extend({
	init: function(M){
		this._super(M);
		this.displayBounds = null;
		this.displayCaption = new TDisplayCaption(M.caption);
		this.anchorList = new Array();
		var tempPt = new TAtlasPoint(0,0);
		this.anchorList[0] = new TAnchorPoint(tempPt); 
		this.anchorList[1] = new TAnchorPoint(tempPt);
		this.anchorList[2] = new TAnchorPoint(tempPt);
		this.anchorList[3] = new TAnchorPoint(tempPt);
	},
	hitTest: function(pt, pSDConverter){
		if(!this.measurement.isVisible) 
			return false;	
			
		var i = 0;
		//this.measurement.activeAnchor = -1;
		while(i < this.anchorList.length){
			if(this.anchorList[i].hitTest(pt, pSDConverter)){
				return true;
			}			
			i++;	
		}
		var umPt = pSDConverter.micronFromPixel(pt);
		var  c = this.measurement.getCenter();
		if((umPt.x <= (c.x + (this.measurement.bounds.width/2)))
			&& (umPt.x >= (c.x - (this.measurement.bounds.width/2)))
			&& (umPt.y >= (c.y - (this.measurement.bounds.height/2)))
			&& (umPt.y <= (c.y + (this.measurement.bounds.height/2))))
			return true;
		
		return this.displayCaption.hitTest(pt, pSDConverter);		
	},
	dblclick : function(e, pt, pSDConverter){
		if(this.displayCaption.hitTest(pt, pSDConverter)){
			this.displayCaption.dblclick(e, pt, pSDConverter);
			this.updateCaptionPosition(pSDConverter);
			this.displayCaption.measurement.incChangeCount();
			this.displayCaption.measurement.hasCustomPosition = false;
		}
		else{			
			$('#measurementAreaForm').dialog('open');			
			$('#measurementAreaForm').find('#measurementWidthValue').val((this.measurement.bounds.width).toFixed(2)).select();
			$('#measurementAreaForm').find('#measurementHeightValue').val((this.measurement.bounds.height).toFixed(2));
		}
	},
	mousedown : function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt);
		this.registerPoint(pt, pSDConverter);		
		
		if(this.measurement.locked){		
			if(this.measurement.isRegion() 
				&& (this.measurement.region.extLink != '')
				&& !e.ctrlKey){
					this.measurement.region.goToLink();	
					return null;
			}	
			return false;
		}		
		
		var i = 0;
		//this.measurement.activeAnchor = -1;
		while(i < this.anchorList.length){
			if(this.anchorList[i].hitTest(pt, pSDConverter)){
				this.measurement.activeAnchor = i;
			}			
			i++;	
		}		
		
		switch(this.measurement.state){
			case TMeasurementState.inCreation:
				this.measurement.bounds.x = umPt.x;
				this.measurement.bounds.y = umPt.y;			
			break;
			case TMeasurementState.idle:
				if(this.displayCaption.hitTest(pt, pSDConverter)){
					this.displayCaption.mousedown(e, pt, pSDConverter);			
					this.measurement.setState(TMeasurementState.moveCaption);
					this.measurement.caption.hasCustomPosition = true;
					return null;
				}
				
				if(this.measurement.isRegion() 
					&& (this.measurement.region.extLink != '')
					&& e.ctrlKey){
						this.measurement.region.goToLink();		
						return null;
				}
				
				if(this.measurement.activeAnchor > -1){
					this.measurement.setState(TMeasurementState.moveAnchor);
					switch(this.measurement.activeAnchor){
					case TAnchorPosition.topLeft:
						var theOpposite = TAnchorPosition.bottomRight;
					break;
					case TAnchorPosition.topRight:
						var theOpposite = TAnchorPosition.bottomLeft;
					break;
					case TAnchorPosition.bottomRight:
						var theOpposite = TAnchorPosition.topLeft;
					break;
					case TAnchorPosition.bottomLeft:
						var theOpposite = TAnchorPosition.topRight; 
					break;
					}
					this.anchorOppositePt = new point(this.anchorList[theOpposite].displayPt.x, this.anchorList[theOpposite].displayPt.y);
				}
				else if(this.measurement.bounds.hitTest(umPt)){
					this.measurement.setState(TMeasurementState.moveShape);
				}
			break;
		}	
	},
	mousemove: function(e, pt, pSDConverter){
		if(this.measurement.locked) return false;
		var umPt = pSDConverter.micronFromPixel(pt);		
		switch(this.measurement.state){			
			case TMeasurementState.inCreation:				
				this.measurement.bounds.x = Math.min(umPt.x, this.measurement.mouseDownPointUm.x);
				this.measurement.bounds.y = Math.min(umPt.y, this.measurement.mouseDownPointUm.y);
				this.measurement.bounds.width = Math.abs(umPt.x - this.measurement.mouseDownPointUm.x);
				this.measurement.bounds.height = Math.abs(umPt.y - this.measurement.mouseDownPointUm.y);			
				this.updateAnchor(pSDConverter);		
				this.measurement.incChangeCount();
				this.measurement.updateCaption(pSDConverter);
			break;
			case TMeasurementState.moveAnchor:
				var oppPtum = pSDConverter.micronFromPixel(this.anchorOppositePt);				
				this.measurement.bounds.x = Math.min(umPt.x, oppPtum.x);
				this.measurement.bounds.y = Math.min(umPt.y, oppPtum.y);
				this.measurement.bounds.width = Math.abs(umPt.x - oppPtum.x);
				this.measurement.bounds.height = Math.abs(umPt.y - oppPtum.y);			
				this.updateAnchor(pSDConverter);
				this.measurement.incChangeCount();
				this.measurement.updateCaption(pSDConverter);
			break;
			case TMeasurementState.moveCaption:
				this.displayCaption.mousemove(e, pt, pSDConverter);
				this.displayCaption.hasCustomPosition = true;
				this.updateAnchor(pSDConverter);
				this.measurement.updateCaption(pSDConverter);
			break;
			case TMeasurementState.moveShape:
					this.measurement.moveTo(umPt);
					this.measurement.updateCaption(pSDConverter);
			break;
		}	
	},
	mouseup: function(e, pt, pSDConverter){
		this._super(e, pt, pSDConverter);
		this.measurement.activeAnchor = -1;
		this.displayCaption.mouseup(e, pt, pSDConverter);
		this.measurement.state = TMeasurementState.idle;
	},
	getDisplayBounds: function(pSDConverter){
		var wh = new Seadragon.Point(this.measurement.bounds.width, this.measurement.bounds.height);
		var whPx = pSDConverter.deltaPixelsFromMicrons(wh, true);
		var tL = new Seadragon.Point(this.measurement.bounds.x, this.measurement.bounds.y + this.measurement.bounds.height);
		var tlPx = pSDConverter.pixelFromMicron(tL, true);
		return new rect(tlPx.x, tlPx.y, whPx.x, whPx.y);
	},
	updateCaptionPosition : function (pSDConverter){
		var b = this.getDisplayBounds(pSDConverter, true);
		this.displayCaption.measurement.basePt.x = b.x + b.width + 20;
		this.displayCaption.measurement.basePt.y = b.y;
		this.displayCaption.measurement.basePt = pSDConverter.micronFromPixel(this.displayCaption.measurement.basePt, true);
	},
	draw: function(pSDCNVTR, cnv){
		var ctx = cnv.getContext('2d');
			
		this.updateAnchor(pSDCNVTR);
		ctx.beginPath();
		
		if(this.measChangeCount != this.measurement.changeCount){
			this.measurement.updateCaption();	
			this.measChangeCount = this.measurement.changeCount;
		}
		
		this.displayBounds = this.getDisplayBounds(pSDCNVTR, true);
		ctx.rect(this.displayBounds.x, this.displayBounds.y, this.displayBounds.width, this.displayBounds.height);
		
		var lineColorRGB = new RGBColor(this.measurement.getLineColor());
		if(g_drawFill){
			ctx.fillStyle =  "rgba(" + lineColorRGB.r + ", " + lineColorRGB.g + ", " + lineColorRGB.b + ", " + this.measurement.getFillOpacity() + ")";
			ctx.fill();			
		}
		ctx.strokeStyle = this.measurement.getLineColor();
		ctx.lineWidth = this.measurement.getLineThickness();		
		ctx.stroke();		
		
		if(this.measurement.selected){		
			var i = 0;
			while(i < this.anchorList.length){
				this.anchorList[i].draw(pSDCNVTR, cnv);
				i++;
			}
		}
		if(this.canDisplayCaption()){
			if(!this.displayCaption.measurement.hasCustomPosition)
				this.updateCaptionPosition(pSDCNVTR);
			this.displayCaption.draw(pSDCNVTR, cnv);
		}
		this.viewportChanged = false;
	},
	updateAnchor : function(SDConverter){
		this.anchorList[TAnchorPosition.topLeft].displayPt.x = this.measurement.bounds.x;
		this.anchorList[TAnchorPosition.topLeft].displayPt.y = this.measurement.bounds.y;
		this.anchorList[TAnchorPosition.topRight].displayPt.x = this.measurement.bounds.x +  this.measurement.bounds.width;
		this.anchorList[TAnchorPosition.topRight].displayPt.y = this.measurement.bounds.y;
		this.anchorList[TAnchorPosition.bottomRight].displayPt.x = this.measurement.bounds.x + this.measurement.bounds.width;
		this.anchorList[TAnchorPosition.bottomRight].displayPt.y = this.measurement.bounds.y + this.measurement.bounds.height;
		this.anchorList[TAnchorPosition.bottomLeft].displayPt.x = this.measurement.bounds.x;
		this.anchorList[TAnchorPosition.bottomLeft].displayPt.y = this.measurement.bounds.y + this.measurement.bounds.height;
		
		// transform the point into display space
		var i = 0;
		while(i < this.anchorList.length){
			this.anchorList[i].displayPt = SDConverter.pixelFromMicron(this.anchorList[i].displayPt, true);
			i++;
		}
	},
	registerPoint: function(pt, pSDConverter){
		this._super(pt, pSDConverter);
		this.displayCaption.registerPoint(pt, pSDConverter);
	},
	resetViewportChanged: function(){
		this._super();
		this.displayCaption.resetViewportChanged();
	},
	getCursor: function(pt, pSDConverter){
		if (this.measurement.locked){
			if ((this.measurement.region != undefined)
				&& (this.measurement.region.extLink != ''))
				return g_cursorLink;				
		}
		if((g_ctrldown )
			&& (this.measurement.region != undefined)){
			if (this.measurement.region.extLink != '')
				return g_cursorLink;
			else
				return g_cursorOverShape;
		}
		return g_cursorOverShape;	
	},
	getDisplaySize: function(){
		if (this.displayBounds == null)
			return new TDimension(0,0);
		else
			return new TDimension(this.displayBounds.width, this.displayBounds.height);
	},
});