TDisplaySimpleMeasurement = TDisplayMeasurement.extend({
	init: function(aM){
		this._super(aM);
		this.displayCaption = new TDisplayCaption(aM.caption);
		this.displaySize = 0;
		this.nodeList.push(new TNodePoint(this.measurement.pt[0]));
		this.nodeList.push(new TNodePoint(this.measurement.pt[1]));	
	},
	hitTest: function (pt, pSDConverter){		
		if(!this.measurement.isVisible) 
			return false;	
		
		if(this.displayCaption.hitTest(pt, pSDConverter)){
			return true;
		}		
		
		var dPt1 = pSDConverter.pixelFromMicron(this.measurement.pt[0], true);
		var dPt2 = pSDConverter.pixelFromMicron(this.measurement.pt[1], true);		
		
		var dFromLine = distanceFromLine(dPt1, dPt2, pt);
		if(dFromLine < g_lineHitTestThreshold) 
			return true;
		
		var d1 = dPt1.distanceTo(pt);
		var d2 = dPt2.distanceTo(pt);
		var sg = new Segment(dPt1, dPt2);
		var a = sg.angle();		
				
		var endPt1 = new TAtlasPoint(dPt1.x + this.measurement.endBarLength*Math.cos(a+(Math.PI/2)), dPt1.y + this.measurement.endBarLength*Math.sin(a+(Math.PI/2)));
		var endPt2 = new TAtlasPoint(dPt1.x - this.measurement.endBarLength*Math.cos(a+(Math.PI/2)), dPt1.y - this.measurement.endBarLength*Math.sin(a+(Math.PI/2)));
		var endPt3 = new TAtlasPoint(dPt2.x + this.measurement.endBarLength*Math.cos(a+(Math.PI/2)), dPt2.y + this.measurement.endBarLength*Math.sin(a+(Math.PI/2)));
		var endPt4 = new TAtlasPoint(dPt2.x - this.measurement.endBarLength*Math.cos(a+(Math.PI/2)), dPt2.y - this.measurement.endBarLength*Math.sin(a+(Math.PI/2)));
		
		// Test First End Segment
		sg1 = new Segment(endPt1, endPt2);
		sg2 = new Segment(endPt3, endPt4);			
		
		if(d1 < (parseFloat(this.measurement.getLineThickness()) + 10)){
			return true;
		}
		else if(d2 < (parseFloat(this.measurement.getLineThickness()) + 10)){
			return true;
		}
		else if(sg2.distanceFrom(pt) <  (parseFloat(this.measurement.getLineThickness()) + 10)){
			return true;
		}
		else if(dPt1.distanceTo(pt) <  (parseFloat(this.measurement.getLineThickness()) + 10)){
			return true;
		}
		return false;
	},	
	drawLines : function(ctx, pt1, pt2){		
		this._super(ctx, pt1, pt2);
		// Draw the end point
		var sg = new Segment(pt1, pt2);
		var a = sg.angle();		
		if(this.showEnds){
			this.drawEnd(ctx, pt1);
			this.drawEnd(ctx, pt2);
		}	
	},	
	draw: function(pSDCNVTR, cnv){
		var ctx = cnv.getContext('2d');
		
		if((this.viewportChanged) 
				|| (this.measChangeCount != this.measurement.changeCount)) {
			this.measurement.caption.incChangeCount();
			this.measurement.updateCaption(pSDCNVTR);
			this.updateCaptionPosition(pSDCNVTR);
			this.displayCaption.updateBoundingBox(pSDCNVTR, cnv);
			this.viewportChanged = false;
			this.measChangeCount = this.measurement.changeCount;
		}
		
		if(this.canDisplayCaption()){
			this.updateCaptionPosition(pSDCNVTR);
			if(g_showCallOutTail && this.showCallout){
				if((this.callout != undefined) && (this.callout != null)){
					this.callout.draw(pSDCNVTR, cnv);
				}
			}
			this.displayCaption.draw(pSDCNVTR, cnv);			
		}
		
		var drawPt1 = pSDCNVTR.pixelFromMicron(this.measurement.pt[0], true);
		var drawPt2 = pSDCNVTR.pixelFromMicron(this.measurement.pt[1], true);
		
		drawPt1.x += 0.5;
		drawPt1.y += 0.5;
		drawPt2.x += 0.5;
		drawPt2.y += 0.5;		
		
		this.displaySize = Math.sqrt(Math.pow(drawPt1.x - drawPt2.x, 2) + Math.pow(drawPt1.y - drawPt2.y, 2));
		
		ctx.beginPath();
		ctx.strokeStyle = this.measurement.getOutlineColor(); 
		ctx.fillStyle = this.measurement.getOutlineColor();
		ctx.lineWidth = parseFloat(this.measurement.getLineThickness()) + Math.max(3, this.measurement.getLineThickness()*0.6);
		ctx.lineCap = 'square';
		this.drawLines(ctx, drawPt1, drawPt2);
		this.drawEnd(ctx, drawPt1);
		this.drawEnd(ctx, drawPt2);
 		ctx.stroke();		
		ctx.strokeStyle = this.measurement.getLineColor(); 
		ctx.fillStyle = this.measurement.getLineColor();
		ctx.lineWidth = this.measurement.getLineThickness();
		ctx.lineCap = 'square';
		this.drawLines(ctx, drawPt1,drawPt2);
		this.drawEnd(ctx, drawPt1);
		this.drawEnd(ctx, drawPt2);
		ctx.stroke();
		ctx.closePath();		
		if(this.measurement.selected)
			this.drawNodes(pSDCNVTR, cnv);		
			
		this.measChangeCount = this.measurement.changeCount;
	},
	drawEnd : function(ctx, pt1){		
		var endPt1 = new TAtlasPoint(pt1.x + this.measurement.endBarLength*Math.cos(this.measurement.angle()+(Math.PI/2)), pt1.y + this.measurement.endBarLength*Math.sin(this.measurement.angle()+(Math.PI/2)));
		var endPt2 = new TAtlasPoint(pt1.x - this.measurement.endBarLength*Math.cos(this.measurement.angle()+(Math.PI/2)), pt1.y - this.measurement.endBarLength*Math.sin(this.measurement.angle()+(Math.PI/2)));
		ctx.moveTo(endPt1.x, endPt1.y);
		ctx.lineTo(endPt2.x, endPt2.y);
	},
	mouseup : function(e, pt, pSDConverter){
		this.activeNode = -1;
		this.measurement.setState(TMeasurementState.idle);
		this._super(e, pt, pSDConverter);
		if(this.displayCaption != undefined)
			this.displayCaption.mouseup(e, pt, pSDConverter);
	},
	updateCaptionPosition : function(pSDConverter){
		if((this.displayCaption == undefined) 
				|| (this.displayCaption == null)) return false;
				
		var textOffset = 20;	
		var currentAngle = this.measurement.angle();
		if(!this.displayCaption.measurement.hasCustomPosition){			
			$('#debugger').html((currentAngle/Math.PI).toFixed(2));
			if((currentAngle < 0.25*Math.PI) && (currentAngle > -0.25*Math.PI)){
				this.displayCaption.measurement.textAlign = 'left';
				this.displayCaption.measurement.baseline = 'middle';				
			}
			else if((currentAngle < 0.75*Math.PI) && (currentAngle > 0.25*Math.PI)){
				this.displayCaption.measurement.textAlign = 'center';
				this.displayCaption.measurement.baseline = 'top';				
			}
			else if((currentAngle > -0.75*Math.PI) && (currentAngle < -0.25*Math.PI)){
				this.displayCaption.measurement.textAlign = 'center';
				this.displayCaption.measurement.baseline = 'bottom';				
			}
			else{
				this.displayCaption.measurement.textAlign = 'right';
				this.displayCaption.measurement.baseline = 'middle';				
			}
				
			var dPt1 = pSDConverter.pixelFromMicron(this.measurement.pt[1], true);
			toPt = new TAtlasPoint( dPt1.x + (textOffset * Math.cos(currentAngle)),
					dPt1.y + (textOffset * Math.sin(currentAngle)));
			
			var umToPt = pSDConverter.micronFromPixel(toPt, true);
			this.displayCaption.measurement.basePt.x = umToPt.x;
			this.displayCaption.measurement.basePt.y = umToPt.y;
		}		
	},
	dblclick : function(e, pt, pSDConverter){		
		if((this.displayCaption != undefined) 
				&& (this.displayCaption != null) 
				&& this.displayCaption.hitTest(pt, pSDConverter)){
			this.displayCaption.measurement.hasCustomPosition = false;
			this.measurement.updateCaption(pSDConverter);
			this.updateCaptionPosition(pSDConverter);
		}
		else{			
			$('#measurementLengthForm').dialog('open');	
			$('#measurementLengthValue').val(this.measurement.length().toFixed(2));
			var a = rad2Deg(this.measurement.angle());
			$('#measurementAngleValue').val(a.toFixed(1));
			$('#measurementLengthValue').select();
			$('#measurementLengthValue').focus();			
		
			if(this.className == 'TLongMeasurement'){
				$('#measurementLengthForm').find('.measurementAngleField').hide();
			}
			else $('#measurementLengthForm').find('.measurementAngleField').show();
		}
	},
	mousemove : function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt, true);
		switch(this.measurement.state){			
			case TMeasurementState.moveCaption:
				if((this.displayCaption != undefined) 
						&& (this.displayCaption != null)){						
					this.displayCaption.mousemove(e, pt, pSDConverter);
					if(this.displayCaption.measurement.state == TMeasurementState.moveShape)
						this.displayCaption.measurement.hasCustomPosition = true;
				}	
				this.measurement.updateCaption(pSDConverter);
			break;
			case TMeasurementState.inCreation:
					this.measurement.pt[0].x = umPt.x;
					this.measurement.pt[0].y = umPt.y;	
					this.measurement.updateCaption(pSDConverter);
			break;
			case TMeasurementState.moveNode:					
					if(e.ctrlKey){
						// get the closest angle	
						var a = getClosestAngle(this.measurement.pt[this.measurement.getNotActiveNode()], pt);
						var r = pt.distanceFrom(this.measurement.pt[this.measurement.getNotActiveNode()]);
						pt.x = this.measurement.pt[this.measurement.getNotActiveNode()].x + Math.cos(a)*r;
						pt.y = this.measurement.pt[this.measurement.getNotActiveNode()].y + Math.sin(a)*r;			
					}					
					this.measurement.pt[this.measurement.activeNode].x = umPt.x;
					this.measurement.pt[this.measurement.activeNode].y = umPt.y;					
					this.measurement.updateCaption(pSDConverter);
			break;
			case TMeasurementState.moveShape:
					this.measurement.moveTo(umPt);
					this.measurement.updateCaption(pSDConverter);
			break;
		}
		if(this.showCaption)
			this.measurement.updateCaption(pSDConverter);
	},
	mousedown : function(e, pt, pSDConverter){
		// get the distance from the first point		
		var umPt = pSDConverter.micronFromPixel(pt, true);
		
		switch(this.measurement.state){
			case TMeasurementState.inCreation:
				this.measurement.pt[0].x = umPt.x;
				this.measurement.pt[0].y = umPt.y;
				this.measurement.pt[1].x = umPt.x;
				this.measurement.pt[1].y = umPt.y;
			break;	
			case TMeasurementState.idle:
				this.registerPoint(pt, pSDConverter);
				if((this.displayCaption != undefined) 
						&& (this.displayCaption != null) 
						&& this.displayCaption.hitTest(pt, pSDConverter)){
					this.displayCaption.mousedown(e, pt, pSDConverter);			
					this.measurement.setState(TMeasurementState.moveCaption);
					return null;
				}		
				var dPt1 = pSDConverter.pixelFromMicron(this.measurement.pt[0], true);
				var dPt2 = pSDConverter.pixelFromMicron(this.measurement.pt[1], true);		
				var d1 = dPt1.distanceTo(pt);
				var d2 = dPt2.distanceTo(pt);
				
				if(this.nodeList[0].hitTest(pt, pSDConverter)){
					this.measurement.setState(TMeasurementState.moveNode);
					this.measurement.activeNode = 0;					
				}
				else if(this.nodeList[1].hitTest(pt, pSDConverter)){
					this.measurement.setState(TMeasurementState.moveNode);
					this.measurement.activeNode = 1;					
				}
				// test the segment
				else{
					aSeg  = new Segment(dPt1, dPt2);
					if(aSeg.distanceFrom(pt) < g_lineHitTestThreshold){
						this.measurement.setState(TMeasurementState.moveShape);
					}				
				}				
			break;
		}		
	},
	getDisplaySize: function(){
		
		return new TDimension(this.displaySize,this.displaySize);
	},
	registerMouseDown : function(pt, pSDConverter){
		if((this.displayCaption != undefined) 
			&& (this.displayCaption != null))				
			this.displayCaption.registerPoint(pt, pSDConverter);
		this._super(pt, pSDConverter);
	}
});