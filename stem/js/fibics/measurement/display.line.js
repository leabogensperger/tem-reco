
var TDisplayLine = TDisplayMeasurement.extend({
	init: function(oM){
		this._super(oM);
		this.nodeList = new Array();
		this.nodeList.push(new TNodePoint(this.measurement.pt[0]));
		this.nodeList.push(new TNodePoint(this.measurement.pt[1]));
		$(oM).on('onChange', function(e){
			//dM.updateNodes();
		});
	},
	getDisplayLength: function(pSDCNVTR){
		var dPt1 = pSDCNVTR.pixelFromMicron(this.measurement.pt[0]);
		var dPt2 = pSDCNVTR.pixelFromMicron(this.measurement.pt[1]);
		return dPt1.distanceTo(dPt2);
	},
	testPolymorphism: function(){
		console.log('Display Line!');
	},
	draw: function(pSDCNVTR, cnv, beginAndClose){
		var ctx = cnv.getContext('2d');
		if(beginAndClose == undefined){
			beginAndClose = true;
		}

		var drawPt1 = new Seadragon.Point(this.measurement.pt[0].x, this.measurement.pt[0].y);
		var drawPt2 = new Seadragon.Point(this.measurement.pt[1].x, this.measurement.pt[1].y);
		// transform the point into pixel space
		drawPt1 = pSDCNVTR.pixelFromMicron(drawPt1, true);
		drawPt2 = pSDCNVTR.pixelFromMicron(drawPt2, true);
		/*var drawPt1 = new TAtlasPoint(this.pt[0].x +0.5, this.pt[0].y +0.5);
		var drawPt2 = new TAtlasPoint(this.pt[1].x +0.5, this.pt[1].y +0.5);*/
		if(beginAndClose == undefined)	beginAndClose =  false;
		if(beginAndClose) ctx.beginPath();
		ctx.strokeStyle = this.measurement.getOutlineColor();
		ctx.fillStyle = this.measurement.getOutlineColor();
		ctx.lineWidth = parseFloat(this.measurement.getLineThickness()) + Math.max(3, this.measurement.getLineThickness()*0.6);
		ctx.lineCap = 'square';
		this.drawLine(ctx, drawPt1, drawPt2);
		ctx.strokeStyle = this.measurement.getLineColor();
		ctx.fillStyle = this.measurement.getLineColor();
		ctx.lineWidth = this.measurement.getLineThickness();
		ctx.lineCap = 'square';
		this.drawLine(ctx, drawPt1, drawPt2);

		if(this.measurement.selected)
			this.drawNodes(pSDCNVTR, cnv);

		if(beginAndClose)
			ctx.closePath();

		this.viewportChanged = false;
	},
	hitTestOnLine : function (pt, avp){
		var dPt1 = new Seadragon.Point(this.measurement.pt[0].x, this.measurement.pt[0].y);
		var dPt2 = new Seadragon.Point(this.measurement.pt[1].x, this.measurement.pt[1].y);
		// transform the point into pixel space
		dPt1 = avp.pixelFromMicron(dPt1, true);
		dPt2 = avp.pixelFromMicron(dPt2, true);
		var d = distanceFromLine(dPt1, dPt2, pt);
		if(d < g_lineHitTestThreshold) return true;
	},
	hitTest: function(pt, pSDConverter){
		if(!this.measurement.isVisible)
			return false;

		if(this.hitTestOnLine(pt, pSDConverter)) return true;
		if(this.hitTestNode(pt, pSDConverter)) return true;
		return false;
	},
	mousedown: function(e, pt, avp){
		this.registerPoint(pt);
		var umPt = avp.micronFromPixel(pt, true);
		if(this.hitTestNode(pt, avp)){
			this.measurement.setState(TMeasurementState.moveNode);
			return true;
		}
		else if(this.hitTestOnLine(pt, avp)){
			this.measurement.setState(TMeasurementState.moveShape);
		}
		if(this.measurement.state == TMeasurementState.inCreation){
			this.measurement.pt[0].x = umPt.x;
			this.measurement.pt[0].y = umPt.y;
			this.measurement.pt[1].x = umPt.x;
			this.measurement.pt[1].y = umPt.y;
		}
	},
	mousemove: function(e, pt, pSDConverter){
		var dPt1 = new Seadragon.Point(this.measurement.pt[0].x, this.measurement.pt[0].y);
		var dPt2 = new Seadragon.Point(this.measurement.pt[1].x, this.measurement.pt[1].y);
		// transform the point into pixel space
		dPt1 = pSDConverter.pixelFromMicron(dPt1, true);
		dPt2 = pSDConverter.pixelFromMicron(dPt2, true);
		var umPt = pSDConverter.micronFromPixel(pt);

		switch(this.measurement.state){
			case TMeasurementState.inCreation:
					this.measurement.pt[0].x = umPt.x;
					this.measurement.pt[0].y = umPt.y;
				break;
			case TMeasurementState.moveNode:
					this.measurement.pt[this.activeNode].x = umPt.x;
					this.measurement.pt[this.activeNode].y = umPt.y;
				break;
			case TMeasurementState.moveShape:
				var umRPt = pSDConverter.micronFromPixel(this.pointRegistered, true);
				var delta = new TAtlasPoint(umPt.x - umRPt.x, umPt.y - umRPt.y );
				this.measurement.moveBy(delta);
				this.pointRegistered.x = pt.x;
				this.pointRegistered.y = pt.y;
			break;
		}
	},
	dblclick: function(e, pt, pSDConverter){
		if((this.displayCaption != undefined)
				&& (this.caption != null)){
			this.displayCaption.dblclick(e, pt, pSDConverter);
			this.updateCaption(pSDConverter);
		}
		else{
			$('#measurementLengthValue').val(this.measurement.length().toFixed(3));
			$('#measurementLengthValue').select();
			var aAn = -this.measurement.angle()*360/(2*Math.PI);
			if(aAn < 0) aAn += 180;
			else aAn -= 180;
			$('#measurementAngleValue').val(aAn.toFixed(1));
			$('#measurementLengthForm').dialog('open');
		}
	}
});
