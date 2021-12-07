// JavaScript Document
TDisplayPolygonalArea = TDisplayRectangularArea.extend({
	init: function(M){
		this._super(M);
		this.nodeList = new Array();

		//comment out, since adding polygonalArea surface measurement
		//if (!(M instanceof TPolygonRegion))
		//	throw 'Can only create a display polygonalarea based on the TPolygon';

		this.updateNodes();
		this.lastMouseMovePt = new TAtlasPoint(0,0);
		this.activeNode = -1;
		this.displayBoundChangeCount = -1;
		this.displayBound = new rect(0,0,0,0);
	},
	hitTest: function(pt, pSDConverter){
		if(!this.measurement.isVisible)
			return false;

		var r  = true;
		// test the area first
		r = r && this.hitTestArea(pt, pSDConverter);
		if(r) return r;

		// test the node
		// this is necessary since some portion of the nodes can be
		// drawn outside the area of the polygon
		for (var i = 0; i < this.nodeList.length; i++){
			if(this.nodeList[i].hitTest(pt, pSDConverter)){
				return true;
			}
		}
		// now test if the caption hittest
		return this.displayCaption.hitTest(pt, pSDConverter);
	},
	hitTestArea: function(pt, avp){
		var umPt = avp.micronFromPixel(pt);
		// line from x, y, to +inf, y
		// count edge crossings.
		cross = 0;

		for (var i = 0; i < this.nodeList.length; i++){
			e1 = this.nodeList[i].refPt.clone();
			// close from last vertex back to first
			if (i == this.nodeList.length - 1)
				e2 = this.nodeList[0].refPt.clone();
			else e2 = this.nodeList[i+1].refPt.clone();


			// bb test - edge must cross y, and at least one x must be larger than x
			if ((e1.x < umPt.x) && (e2.x < umPt.x)){} // intersection impossible
			else if ((e2.y > umPt.y) && (e1.y > umPt.y)){}  // intersection impossible
			else if ((e2.y < umPt.y) && (e1.y < umPt.y)){} // intersection impossible
			else if (e2.x == e1.x){ // vertical segment
					cross++;
			}
			else{
				// parameric form of line
				m = (e2.y - e1.y) / (e2.x - e1.x);
				b = e1.y - (m * e1.x);
				if (m == 0.0) { // horizontal line, no crossing
					}
				else{
					xint = (umPt.y - b) / m;
					if (xint >= umPt.x)
						cross++;
				}
			}
		}
		return (cross % 2) == 1;
	},
	updateNodes: function(){
		// do not update nodes if the change count is the same
		if( this.measChangeCount == this.measurement.changeCount) return null;

		// make sure that you have the right amount of nodes
		this.nodeList.length = this.measurement.pts.length;
		for(var i = 0; i < this.measurement.pts.length ; i++){
			if (this.nodeList[i] == undefined)
				this.nodeList[i] = new TNodePoint(this.measurement.pts[i]);
			else
				this.nodeList[i].refPt = this.measurement.pts[i];
		}

		this.measChangeCount = this.measurement.changeCount;
	},
	draw: function(pSDCNVTR, cnv){

		var ctx = cnv.getContext('2d');

		ctx.beginPath();
		this.updateNodes();
		var i = 0;

		// loop through all the node
		//	and add them to the path
		while( i < this.nodeList.length){
			pt = pSDCNVTR.pixelFromMicron(this.nodeList[i].refPt, true);
			ctx.lineTo(pt.x, pt.y);
			i++;
		}
		ctx.closePath();

		var lineColorRGB = new RGBColor(this.measurement.getLineColor());
		if(g_drawFill){
			ctx.fillStyle =  "rgba(" + lineColorRGB.r + ", " + lineColorRGB.g + ", " + lineColorRGB.b + ", " + this.measurement.getFillOpacity() + ")";
			ctx.fill();
		}

		ctx.strokeStyle = this.measurement.getLineColor();
		ctx.lineWidth = this.measurement.getLineThickness();
		ctx.stroke();

		// if selected, draw the nodes
		if( this.measurement.selected) {
			var i = 0;
			while(i < this.nodeList.length){
				this.nodeList[i].draw(pSDCNVTR, cnv);
				i++;
			}
		}
		if((!this.measurement.caption.hasCustomPosition)
				|| (this.viewportChanged))
			this.updateCaptionPosition(pSDCNVTR);
		this.measurement.updateCaption(pSDCNVTR);
		this.displayCaption.draw(pSDCNVTR, cnv);
		this.viewportChanged = false;
	},
	mousedown : function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt);
		this.registerPoint(pt, pSDConverter);
		this.lastMouseMovePt.x = umPt.x;
		this.lastMouseMovePt.y = umPt.y;

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
		this.activeNode = -1;

		switch(this.measurement.state){
			case TMeasurementState.inCreation:
				// add a point
				this.measurement.addPoint(umPt);
			break;
			case TMeasurementState.idle:
				// check if needs to follow the link
				if(this.measurement.isRegion()
						&& (this.measurement.region.extLink != '')
						&& e.ctrlKey){
					this.measurement.region.goToLink();
					return null;
				}

				if(this.hitTestArea(pt, pSDConverter)){
					this.registerPoint(pt, pSDConverter);
					this.measurement.state = TMeasurementState.moveShape;
				}

				while(i < this.nodeList.length){
					if(this.nodeList[i].hitTest(pt, pSDConverter)){
						this.activeNode = i;
						this.measurement.state = TMeasurementState.moveNode;
						break;
					}
					i++;
				}

				if(this.displayCaption.hitTest(pt, pSDConverter)){
					this.measurement.state = TMeasurementState.moveCaption;
					this.displayCaption.mousedown(e, pt, pSDConverter);
					this.measurement.caption.select();
				}
			break;
		}
	},
	mousemove : function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt);

		var i = 0;
		switch(this.measurement.state){
			case TMeasurementState.inCreation:
				// if in creation, just move the last point to where the mouse is
				this.measurement.pts[this.measurement.pts.length - 1].x = umPt.x;
				this.measurement.pts[this.measurement.pts.length - 1].y = umPt.y;
			break;
			case TMeasurementState.idle:
				if(this.activeNode != -1){
					this.measurement.movePointTo(this.activeNode, umPt);
				}
			break;
			case TMeasurementState.moveShape:
				this.measurement.moveBy(new TAtlasPoint(umPt.x - this.lastMouseMovePt.x, umPt.y - this.lastMouseMovePt.y));
			break;
			case TMeasurementState.moveCaption:
				this.measurement.caption.hasCustomPosition = true;
				this.displayCaption.mousemove(e, pt, pSDConverter);
			break;
			case TMeasurementState.moveNode:
				if(this.activeNode != -1){
					this.measurement.movePointTo(this.activeNode, umPt);
				}
			break;
		}
		this.lastMouseMovePt.x = umPt.x;
		this.lastMouseMovePt.y = umPt.y;
	},
	mouseup: function(e, pt, pSDConverter){
		switch(this.measurement.state){
			case TMeasurementState.inCreation:
			break;
			case TMeasurementState.idle:
			break;
			case TMeasurementState.moveShape:
				this.measurement.setState(TMeasurementState.idle);
			break;
			case TMeasurementState.moveNode:
				this.measurement.setState(TMeasurementState.idle);
			break;
			case TMeasurementState.moveCaption:
				this.displayCaption.mouseup(e, pt, pSDConverter);
				this.measurement.setState(TMeasurementState.idle);
			break;
		}
		this.measurement.mouseDownRegistered = false;
		this.activeNode = -1;
	},
	dblclick : function(e, pt, pSDConverter){
		switch(this.measurement.state){
			case TMeasurementState.inCreation:
				// remove the last point since it is a duplicate
				this.nodeList.length = this.nodeList.length - 2;
				this.measurement.pts.length =  this.measurement.pts.length - 2;
				this.measurement.setState(TMeasurementState.idle)
			break;
			case TMeasurementState.idle:
					if(this.displayCaption.hitTest(pt, pSDConverter)){
						this.displayCaption.dblclick(e, pt, pSDConverter);
					}
			break;
		}
	},
	getDisplayBounds: function(pSDConverter, current){
		if((this.displayBoundChangeCount != this.measurement.changeCount)
					|| (this.viewportChanged)){
			// update the displayBounds
			var minX = 1E9;
			var minY = 1E9;
			var maxX = -1E9;
			var maxY = -1E9;

			for(var i = 0; i < this.measurement.pts.length; i++){
				 dPt = pSDConverter.pixelFromMicron(this.measurement.pts[i], current);
				 minX = Math.min(minX, dPt.x);
				 minY = Math.min(minY, dPt.y);
				 maxX = Math.max(maxX, dPt.x);
				 maxY = Math.max(maxY, dPt.y);
			}

			this.displayBound.x = minX;
			this.displayBound.y = minY;
			this.displayBound.width = maxX - minX;
			this.displayBound.height = maxY - minY;

			this.displayBoundChangeCount = this.measurement.changeCount;
		}
		return this.displayBound;
	},
	updateCaptionPosition: function(pSDCNVTR){
		var pt =  this.getRightMostPoint(pSDCNVTR);
		pt.x += 20;
		this.displayCaption.measurement.basePt = pSDCNVTR.micronFromPixel(pt, true);
	},
	getRightMostPoint: function(avp){
		var minX = 1E9;
		var maxX = -1E9;
		for(var i = 0; i < this.nodeList.length; i++){
			if(this.nodeList[i].displayPt.x > maxX){
				si = i;
				maxX = this.nodeList[i].displayPt.x;
			}
		}
		return avp.pixelFromMicron(this.nodeList[si].refPt, true);
	},
	getCursor: function(pt, avp){
		if(!this.measurement.isVisible) return false;

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
	}
});
