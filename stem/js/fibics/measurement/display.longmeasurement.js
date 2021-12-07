TDisplayLongMeasurement = TDisplaySimpleMeasurement.extend({
	init: function(M){
		this._super(M);	
	},
	hitTest: function(pt, pSDConverter){		
		if(!this.measurement.isVisible) 
			return false;	
		
		if(this.hitTestBar(pt, pSDConverter)	!= -1) 
			return true;
		if(this.displayCaption.hitTest(pt, pSDConverter)) 
			return true;
		return false;
	},
	hitTestBar: function (pt, pSDConverter){
		var dPt1 = pSDConverter.pixelFromMicron(this.measurement.pt[0], true);
		var dPt2 = pSDConverter.pixelFromMicron(this.measurement.pt[1], true);
		switch(this.measurement.longMeasurementType){
			case TLongMeasurementType.horizontal:
				var d1x = Math.abs(dPt1.x - pt.x);
				var d2x = Math.abs(dPt2.x - pt.x);
				if(d1x <= (this.measurement.getLineThickness() + g_lineHitTestThreshold))
					return 0;
				if(d2x <= (this.measurement.getLineThickness() + g_lineHitTestThreshold))
					return 1;
			break;
			case TLongMeasurementType.vertical:
				var d1y = Math.abs(dPt1.y - pt.y);
				var d2y = Math.abs(dPt2.y - pt.y);
				if(d1y <= (this.measurement.getLineThickness() + g_lineHitTestThreshold))
					return 0;
				if(d2y <= (this.measurement.getLineThickness() + g_lineHitTestThreshold))
					return 1;
			break;
		}
		return -1;
	},
	draw: function(pSDCNVTR, cnv){
		ctx = cnv.getContext('2d');
		
		if((this.viewportChanged) 
				|| (this.measChangeCount != this.measurement.changeCount)) {
			this.measurement.caption.incChangeCount();
			this.measurement.updateCaption(pSDCNVTR);
			this.updateCaptionPosition(pSDCNVTR);
			this.displayCaption.updateBoundingBox(pSDCNVTR, cnv);
			this.viewportChanged = false;
			this.measChangeCount = this.measurement.changeCount;
		}
		
		var dPt1 = pSDCNVTR.pixelFromMicron(this.measurement.pt[0], true);
		var dPt2 = pSDCNVTR.pixelFromMicron(this.measurement.pt[1], true);
		var vpHeight = $(cnv).height();
		var vpWidth = $(cnv).width();
		switch(this.measurement.longMeasurementType){
			case TLongMeasurementType.horizontal:
				var lPt1 = new TAtlasPoint(dPt1.x, 0);
				var lPt2 = new TAtlasPoint(dPt1.x, vpHeight);
				var lPt3 = new TAtlasPoint(dPt2.x, 0);
				var lPt4 = new TAtlasPoint(dPt2.x, vpHeight);
			break;
			case TLongMeasurementType.vertical:
				var lPt1 = new TAtlasPoint(0, dPt1.y);
				var lPt2 = new TAtlasPoint(vpWidth, dPt1.y);
				var lPt3 = new TAtlasPoint(0, dPt2.y);
				var lPt4 = new TAtlasPoint(vpWidth, dPt2.y);
			break;
		}		
		ctx.strokeStyle = this.measurement.getOutlineColor(); 
		ctx.fillStyle = this.measurement.getOutlineColor();
		ctx.lineWidth = parseFloat(this.measurement.getLineThickness()) + Math.max(3, this.measurement.getLineThickness()*0.6);
		ctx.lineCap = 'square';
		ctx.beginPath();
		this.drawLine(ctx, lPt1, lPt2);
		this.drawLine(ctx, lPt3, lPt4);
		
		ctx.strokeStyle = this.measurement.getLineColor(); 
		ctx.fillStyle = this.measurement.getLineColor();
		ctx.lineWidth = parseFloat(this.measurement.getLineThickness());
		ctx.lineCap = 'square';
		this.drawLine(ctx, lPt1, lPt2);
		this.drawLine(ctx, lPt3, lPt4);	
		
		if(this.measurement.selected)
			this.drawNodes(pSDCNVTR, cnv);
		if(this.displayCaption != undefined){
			this.displayCaption.draw(pSDCNVTR, cnv);
		}
	},
	mousemove: function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt, true);		
		switch(this.measurement.state){
			case TMeasurementState.inCreation:
				switch(this.measurement.longMeasurementType){
					case TLongMeasurementType.horizontal:
						this.measurement.pt[0].y = umPt.y;
						this.measurement.pt[1].y = umPt.y;
						this.measurement.pt[1].x = umPt.x;
					break;
					case TLongMeasurementType.vertical:
						this.measurement.pt[0].x = umPt.x;
						this.measurement.pt[1].x = umPt.x;
						this.measurement.pt[1].y = umPt.y;
					break;
				}
				this.measurement.updateCaption(pSDConverter);
			break;
			case TMeasurementState.moveNode:
				switch(this.measurement.longMeasurementType){
					case TLongMeasurementType.horizontal:
						this.measurement.pt[0].y = umPt.y;
						this.measurement.pt[1].y = umPt.y;
						this.measurement.pt[this.measurement.activeNode].x = umPt.x;
					break;
					case TLongMeasurementType.vertical:
						this.measurement.pt[0].x = umPt.x;
						this.measurement.pt[1].x = umPt.x;
						this.measurement.pt[this.measurement.activeNode].y = umPt.y;
					break;
				}
			this.measurement.updateCaption(pSDConverter);
			break;
			case TMeasurementState.moveCaption:
				this.displayCaption.mousemove(e, pt, pSDConverter);
				this.displayCaption.measurement.hasCustomPosition = true;
				this.measurement.updateCaption(pSDConverter);
			break;
		}
		this.updateCaptionPosition(pSDConverter);
	},
	mousedown : function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt, true);
	
		switch(this.measurement.state){
			case TMeasurementState.inCreation:
				this.measurement.pt[0].x = umPt.x;
				this.measurement.pt[0].y = umPt.y;
				this.measurement.pt[1].x = umPt.x;
				this.measurement.pt[1].y = umPt.y;
				this.updateCaptionPosition(pSDConverter);
			break;
			case TMeasurementState.idle:
				this.measurement.activeNode = this.hitTestBar(pt, pSDConverter);
				if(this.measurement.activeNode != -1) 
					this.measurement.setState(TMeasurementState.moveNode);
				if(this.displayCaption.hitTest(pt, pSDConverter)){
					this.measurement.setState(TMeasurementState.moveCaption);
					this.displayCaption.mousedown(e, pt, pSDConverter);
				}
			break;
		}
	}
});