TDisplayExportToPNG = TDisplayRectangularArea.extend({
	init: function(m){
		this._super(m);
		this.exportPNGChangeCount = -1;
	},
	draw: function(pSDCNVTR, cnv){

		var ctx = cnv.getContext('2d');

		this.updateAnchor(pSDCNVTR);
		ctx.beginPath();
		var db = this.getDisplayBounds(pSDCNVTR, true);
		ctx.rect(db.x, db.y, db.width, db.height);

		var _LINECOLOR = _safeDefault(this.measurement.lineColor,this.measurement.getLineColor());
		var _OPACITY = _safeDefault(this.measurement.fillOpacity,this.measurement.getFillOpacity());

		var lineColorRGB = new RGBColor(_LINECOLOR);
		ctx.fillStyle =  "rgba(" + lineColorRGB.r + ", " + lineColorRGB.g + ", " + lineColorRGB.b + ", " + _OPACITY + ")";
		ctx.fill();
		ctx.strokeStyle = _LINECOLOR;
		ctx.lineWidth = this.measurement.getLineThickness();
		ctx.stroke();

		if(this.measurement.selected){
			var i = 0;
			while(i < this.anchorList.length){
				this.anchorList[i].draw(pSDCNVTR, cnv);
				i++;
			}
		}

		//Not finished...
		if((this.exportPNGChangeCount != this.measurement.changeCount)
				|| this.viewportChanged){
			this.measurement.updateCaption(pSDCNVTR);
			this.exportPNGChangeCount = this.measurement.changeCount;
		}

		if(this.canDisplayCaption()){
			if(!this.measurement.caption.hasCustomPosition)
				this.updateCaptionPosition(pSDCNVTR);
			this.displayCaption.draw(pSDCNVTR, cnv);
		}

		this.viewportChanged = false;
	},
	dblclick: function(e, pt, pSDConverter){

		if(this.displayCaption.hitTest(pt, pSDConverter)){
			this.displayCaption.dblclick(e, pt, pSDConverter);
			this.updateCaptionPosition(pSDConverter);
			this.displayCaption.measurement.incChangeCount();
			this.displayCaption.measurement.hasCustomPosition = false;
			return true;
		}

		var wh = new Seadragon.Point(this.measurement.bounds.width, this.measurement.bounds.height);
		wh = pSDConverter.deltaPixelsFromMicrons(wh);

		// Test if the display WH are too big.
		if((wh.x > g_maxExportImageSize) || (wh.y > g_maxExportImageSize)){
			jAlert('<p>The size of the image to be exported is too big.</p><p>The maximum size is '+ g_maxExportImageSize + ' pixels.</p>', 'Cannot Export to PNG');
			return false;
		}

		$('#savedImageForm').attr({
			'fovx': this.measurement.bounds.x,
			'fovy': this.measurement.bounds.height + this.measurement.bounds.y,
			'fovwidth': this.measurement.bounds.width,
			'fovheight': this.measurement.bounds.height,
			'pixelwidth': wh.x,
			'pixelheight': wh.y
		});
		$('#savedImageForm').dialog('open');
	}

});
