TDisplayProtractor = TDisplayMeasurement.extend({
	init: function(M){
		this._super(M);
		this.displayLine = new Array();
		this.displayLine.push(new TDisplayLine(M.line[0]));
		this.displayLine.push(new TDisplayLine(M.line[1]));
		this.displayCaption = new TDisplayCaption(this.measurement.caption);
	},
	hitTestInsideArc : function(pt, pSDConverter){
		// test for distance first
		var dPt1 = pSDConverter.pixelFromMicron(this.displayLine[0].measurement.pt[0]);
		var d = Math.sqrt(Math.pow(pt.x - dPt1.x, 2) + Math.pow(pt.y - dPt1.y, 2));
		if(d > this.arcRadius){
			return false;
		}

		var a1 = this.measurement.line[0].angle();
		var a2 = this.measurement.line[1].angle();
		var ang = Math.atan2(pt.y - dPt1.y ,pt.x - dPt1.x);
		var angleCaption =  (a2 - a1);
		if(angleCaption < 0){
			angleCaption += 2*Math.PI;
		}

		var htAng = ang - a1;
		if(htAng < 0){
			htAng += 2*Math.PI;
		}
		return htAng < angleCaption;
	},
	hitTest : function(pt, pSDConverter){
		onArc = this.hitTestInsideArc(pt, pSDConverter);
		return onArc || this.displayCaption.hitTest(pt, pSDConverter) || this.displayLine[0].hitTest(pt, pSDConverter) || this.displayLine[1].hitTest(pt, pSDConverter);
	},
	mousedown : function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt, true);
		this.registerPoint(pt, pSDConverter);
		switch(this.measurement.state){
			case TMeasurementState.inCreation:
				this.registerPoint(pt, pSDConverter);
				this.measurement.line[0].pt[0].x = umPt.x;
				this.measurement.line[0].pt[0].y = umPt.y;
				this.measurement.line[0].pt[1].x = umPt.x;
				this.measurement.line[0].pt[1].y = umPt.y;
				this.measurement.line[1].pt[0].x = umPt.x;
				this.measurement.line[1].pt[0].y = umPt.y;
				this.measurement.line[1].pt[1].x = umPt.x;
				this.measurement.line[1].pt[1].y = umPt.y;
				this.measurement.setState(TMeasurementState.setFirstSegment);
				return false;
			break;
			case TMeasurementState.setFirstSegment:
				this.measurement.setState(TMeasurementState.setAngle);
			break;
			case TMeasurementState.setAngle:
				this.measurement.setState(TMeasurementState.idle);
			break;
			case TMeasurementState.idle:
				if(this.displayCaption.hitTest(pt, pSDConverter)){
					this.displayCaption.mousedown(e, pt, pSDConverter);
					this.displayCaption.measurement.hasCustomPosition = true;
					this.measurement.setState(TMeasurementState.moveCaption);
					return null;
				}
				this.registerPoint(pt, pSDConverter);
				this.displayLine[0].mousedown(e, pt, pSDConverter);
				this.displayLine[1].mousedown(e, pt, pSDConverter);

				if(this.displayLine[0].measurement.state != TMeasurementState.idle){
					switch(this.displayLine[0].measurement.state){
						case TMeasurementState.moveShape:
							this.measurement.setState(TMeasurementState.moveShape);
						break;
						case TMeasurementState.moveNode:
							this.measurement.setState(TMeasurementState.moveNode);
						break;
					}
				}
				else if(this.displayLine[1].measurement.state != TMeasurementState.idle){
					switch(this.displayLine[1].measurement.state){
						case TMeasurementState.moveShape:
							this.measurement.setState(TMeasurementState.moveShape);
						break;
						case TMeasurementState.moveNode:
							this.measurement.setState(TMeasurementState.moveNode);
						break;
					}
				}
				else if(this.hitTestInsideArc(pt, pSDConverter)){
					this.measurement.setState(TMeasurementState.moveShape);
					return null;
				}
			break;
		}
	},
	dblclick : function(e, pt, pSDConverter){
		if(this.displayCaption.hitTest(pt, pSDConverter)){
			this.displayCaption.dblclick(e, pt, pSDConverter);
			this.displayCaption.measurement.hasCustomPosition = false;
			this.measurement.updateCaption(pSDConverter);
		}
		else{
			$('#measurementAngleForm').dialog('open');
			$('#measurementAngleForm').find('input[type=text]').val(this.measurement.getAngle().toFixed(2)).select();
		}
	},
	mousemove: function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt, true);
		this.measurement.incChangeCount();
		switch(this.measurement.state){
			case TMeasurementState.moveCaption:
				this.displayCaption.mousemove(e, pt, pSDConverter);
				this.measurement.caption.hasCustomPosition = true;
			break;
			case TMeasurementState.inCreation:
			case TMeasurementState.setFirstSegment:
				if(	this.measurement.state == TMeasurementState.inCreation ){
					this.pointRegistered.x = pt.x;
					this.pointRegistered.y = pt.y;
				}
				this.measurement.setState(TMeasurementState.setFirstSegment);
				this.measurement.line[1].pt[1].x = umPt.x;
				this.measurement.line[1].pt[1].y = umPt.y;
			break;
			case TMeasurementState.setAngle:
				this.measurement.line[0].pt[1].x = umPt.x;
				this.measurement.line[0].pt[1].y = umPt.y;
			break;
			case TMeasurementState.moveNode:
				//This to allow the 'reattachment' of nodes if within a distance of 20, AKA 'snapping distance'.
				if(this.displayLine[0].measurement.state == TMeasurementState.moveNode){
					// Check if it is the first node, if so check the distance
					if(this.displayLine[0].activeNode == 0){
						var dL2Pt1 = pSDConverter.pixelFromMicron(this.measurement.line[1].pt[0]);
						d = pt.distanceFrom(dL2Pt1);
						if(d < 20){
							this.measurement.line[0].pt[0].x = 	this.measurement.line[1].pt[0].x;
							this.measurement.line[0].pt[0].y = 	this.measurement.line[1].pt[0].y;
							return false;
						}
					}
					this.displayLine[0].mousemove(e, pt, pSDConverter);
				}
				else if(this.displayLine[1].measurement.state == TMeasurementState.moveNode){
					if(this.displayLine[1].activeNode == 0){
						var dL1Pt1 = pSDConverter.pixelFromMicron(this.measurement.line[0].pt[0]);
						var d = pt.distanceFrom(dL1Pt1);
						if(d < 20){
							this.measurement.line[1].pt[0].x = 	this.measurement.line[0].pt[0].x;
							this.measurement.line[1].pt[0].y = 	this.measurement.line[0].pt[0].y;
							return false;
						}
					}
					this.displayLine[1].mousemove(e, pt, pSDConverter);
				}
			break;
			case TMeasurementState.moveShape:
				this.measurement.moveTo(umPt);
			break;
			default:
				this.displayLine[0].mousemove(e, pt, pSDConverter);
				this.displayLine[1].mousemove(e, pt, pSDConverter);
			break;
		}
	},
	mouseup: function(e, pt, pSDConverter){
		this.displayCaption.mouseup(e, pt, pSDConverter);
		switch(this.measurement.state){
			case TMeasurementState.inCreation:
			case TMeasurementState.setFirstSegment:
				// Test if the mouse has moved enough...
				var ptDown = pSDConverter.pixelFromMicron(this.measurement.line[0].pt[0]);
				var d = pt.distanceFrom(ptDown);
				if(d < 10) return false;
				else this.measurement.setState(TMeasurementState.setAngle);
			break;
			case TMeasurementState.setAngle:
				var d = pt.distanceFrom(this.pointRegistered);
				if(d < 5) return false;
				this.measurement.setState(TMeasurementState.idle);
			break;
		default:
			this.measurement.setState(TMeasurementState.idle);
			this.displayLine[0].mouseup(e, pt, pSDConverter);
			this.displayLine[1].mouseup(e, pt, pSDConverter);
		break;
		}
	},
	updateCaptionPosition : function(pSDConverter){
		var pt1 = this.displayLine[0].measurement.pt[0];
		var dPt1 = pSDConverter.pixelFromMicron(pt1, true);
		var dPt2 = pSDConverter.pixelFromMicron(this.displayLine[0].measurement.pt[1], true);

		/*var sg = new Segment(dPt1, dPt2);
		var a = sg.angle();*/
		var textOffset = 20;

		if(!this.displayCaption.measurement.hasCustomPosition){
			/*if((a < Math.PI/2) &&  (a > -Math.PI/2)){
				this.displayCaption.measurement.textAlign = "right";
			}
			else*/
				this.displayCaption.measurement.textAlign = "left";
			var toPt = new point(dPt1.x - (textOffset*Math.cos(this.measurement.line[0].angle())),
								dPt1.y - (textOffset*Math.sin(this.measurement.line[0].angle())));

			var toPt = pSDConverter.micronFromPixel(toPt,true);
			this.measurement.caption.basePt.x = toPt.x;
			this.measurement.caption.basePt.y = toPt.y;
		}
		sg = null;
		a = null;
	},
	registerPoint : function(pt, pSDConverter){
		this._super(pt, pSDConverter);
		this.displayLine[0].registerPoint(pt, pSDConverter);
		this.displayLine[1].registerPoint(pt, pSDConverter);
		this.displayCaption.registerPoint(pt, pSDConverter);
	},
	draw: function(pSDCNVTR, cnv){

		var ctx = cnv.getContext('2d');

		//check if both points are touching, if not, draw a dotted line
		var dL1Pt1 = pSDCNVTR.pixelFromMicron(this.measurement.line[0].pt[0], true);
		var dL2Pt1 = pSDCNVTR.pixelFromMicron(this.measurement.line[1].pt[0], true);

		if(dL1Pt1.distanceTo(dL2Pt1)> 10){
			var secondPoint = new Seadragon.Point(0,0);
			secondPoint.x =  dL1Pt1.x + 50*Math.cos(this.measurement.line[1].angle());
			secondPoint.y =  dL1Pt1.y + 50*Math.sin(this.measurement.line[1].angle());
			ctx.beginPath();
			ctx.strokeStyle = '#CCCCCC';
			ctx.lineWidth = 2;
			ctx.moveTo(dL1Pt1.x, dL1Pt1.y);
			ctx.lineTo(secondPoint.x, secondPoint.y);
			ctx.closePath();
			ctx.stroke();
		}

		// draw the arc
		ctx.beginPath();
		this.arcRadius = 50;
		var dL1 = this.displayLine[0].getDisplayLength(pSDCNVTR);
		var dL2 = this.displayLine[1].getDisplayLength(pSDCNVTR);
		if(Math.min(dL1, dL2) < 60)
			this.arcRadius = Math.min(dL1, dL2)-10;

		var xxx = (this.arcRadius * Math.cos(this.measurement.line[0].angle()));
		var yyy = (this.arcRadius * Math.sin(this.measurement.line[0].angle()));
		var startPoint = new point(dL1Pt1.x + xxx, dL1Pt1.y + yyy);
		ctx.moveTo(startPoint.x, startPoint.y);

		var aX = dL1Pt1.x;
		var aY = dL1Pt1.y;
		var startAngle = this.measurement.line[0].angle();
		var endAngle = this.measurement.line[1].angle();

		// for some reason, it does not work under Chrome when the protractor is not fully drawn...
		try{
			ctx.arc(aX, aY, this.arcRadius, startAngle, endAngle,	false);
		}
		catch(error){

		}

		ctx.strokeStyle = this.measurement.getLineColor();
		ctx.lineWidth = this.measurement.getLineThickness();
		ctx.stroke();
		ctx.lineTo(dL1Pt1.x, dL1Pt1.y);
		var lineColorRGB = new RGBColor(this.measurement.getLineColor());
		ctx.fillStyle =  "rgba(" + lineColorRGB.r + ", " + lineColorRGB.g +", " + lineColorRGB.b +", 0.25)";
		ctx.fill();
		ctx.beginPath();

		this.displayLine[0].draw(pSDCNVTR, cnv);
		this.displayLine[1].draw(pSDCNVTR, cnv);
		if(!this.measurement.caption.hasCustomPosition){
			this.updateCaptionPosition(pSDCNVTR);
		}
		this.measurement.updateCaption(pSDCNVTR, this.viewportChanged);
		if(this.measurement.state != TMeasurementState.setFirstSegment)
			this.displayCaption.draw(pSDCNVTR, cnv);

		this.viewportChanged = false;
	}
});
