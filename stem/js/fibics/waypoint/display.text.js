// JavaScript Document

TTextDisplay = Class.extend({
	init: function(pt, sText, dFontSize, sFont, textAlign="left"){
		this.text = sText;
		this.padding = 5;
		this.fontSize = dFontSize;
		this.font = sFont;
		this.displayBounds = new rect(0,0,0,0);
		this.displayPt = new Seadragon.Point(pt.x,pt.y);
		this.fontStyle = '';
		this.textColor = '#000';
		this.backgroundColor = '#0F0';
		this.baseline = 'top'
		this.textAlign = textAlign;
		this.type = "normal";
	},
	hitTest: function(pt){
		var isIn = true;
		isIn = isIn && (this.displayBounds.x ) <= pt.x;
		isIn = isIn && ((this.displayBounds.x + (this.displayBounds.width)) >= pt.x ) ;
		isIn = isIn && (this.displayBounds.y <= pt.y);
		isIn = isIn && ((this.displayBounds.y + this.displayBounds.height) >= pt.y);
		return isIn;
	},
	draw: function(pSDConverter, cnv){
		var ctx = cnv.getContext('2d');
		if (this.type == "iLabel") {
			//no bg needed, since draw directly over an bg-image
		} else { //normal
			ctx.fillStyle = this.backgroundColor;
			ctx.fillRect(this.displayBounds.x, this.displayBounds.y, this.displayBounds.width, this.displayBounds.height);
		}
		this.drawText(ctx);

	},
	drawText: function(pCTX){
		if((this.text != '') && (this.text != undefined)){
			var pLines = wrapText(this.text, G_WORDWRAPPED_THRESHOLD);
			pCTX.font = this.fontStyle + " " + this.fontSize + "px " + this.font;
			pCTX.textAlign = _safeDefault(this.textAlign,"left");
			pCTX.textBaseline = this.baseline;

			pCTX.fillStyle = this.textColor;
			var k = 0;
			for(var i = 0; i < pLines.length; i++){
				pCTX.fillText(pLines[i], this.displayPt.x + this.padding, this.displayPt.y +  (i * this.fontSize));
			}
		}
	},
	update: function(pt, pSDConverter, pCNV){
			// update the size of the bb of the text
			this.displayBounds = measureText(pCNV.getContext('2d'), this.text, this.font, this.fontSize, this.baseline);
			captionH = this.displayBounds.height;
			this.displayBounds.x = pt.x;
			this.displayPt.x = pt.x;
			this.displayPt.y = pt.y;
			if(this.baseline == 'top'){
				this.displayBounds.y = pt.y;
			}
			if(this.baseline == 'bottom'){
				this.displayBounds.y = pt.y - this.displayBounds.height;
			}

			this.displayBounds.width = this.displayBounds.width;

			// add padding if not height != 0
			if( this.displayBounds.height != 0) {
				this.displayBounds.width += (2 * this.padding);
				this.displayBounds.height += (2 * this.padding);
				this.displayBounds.y -= (this.padding);
			}
	}});
