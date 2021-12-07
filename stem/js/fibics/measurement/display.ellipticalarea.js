TDisplayEllipticalArea = TDisplayRectangularArea.extend({
	init: function(M){
		this._super(M);
	},
	draw: function(pSDCNVTR, cnv){
		var ctx = cnv.getContext('2d');

		if(this.viewportChanged){
			this.updateAnchor(pSDCNVTR);
		}

		if(this.measChangeCount != this.measurement.changeCount){
			this.updateAnchor(pSDCNVTR);

			if(this.canDisplayCaption()){
				if (!this.measurement.caption.hasCustomPosition)
					this.updateCaptionPosition(pSDCNVTR);
				this.measurement.updateCaption(pSDCNVTR);
			}
			this.measChangeCount = this.measurement.changeCount;
		}

		ctx.beginPath();

		// object key "this.displayBounds" needs to explicitly be defined verbatim here
		this.displayBounds = this.getDisplayBounds(pSDCNVTR, true);
		var db = this.displayBounds;

		var c = new TAtlasPoint(db.x + (db.width/2), db.y + (db.height/2));
		ctx.save();

		ctx.translate(db.x + (db.width/2), db.y + (db.height/2) );
		if(db.height == 0)
			ctx.scale(1, 0);
		else
			ctx.scale(1, db.height/db.width);

		ctx.arc(0,0, db.width/2, 0, Math.PI*2, true);
		var lineColorRGB = new RGBColor(this.measurement.getLineColor());
		if(g_drawFill){
			ctx.fillStyle =  "rgba(" + lineColorRGB.r + ", " + lineColorRGB.g + ", " + lineColorRGB.b + ", " + this.measurement.getFillOpacity() + ")";
			ctx.fill();
		}

		ctx.restore();
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

		if(this.canDisplayCaption())
			this.displayCaption.draw(pSDCNVTR, cnv);
		this.viewportChanged = false;
	}
});
