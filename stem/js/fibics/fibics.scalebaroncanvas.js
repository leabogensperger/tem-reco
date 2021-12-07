// JavaScript Document

TScaleBarOnCanvas = TBaseScaleBar.extend({		
	init: function (pVPCTRL, pCnv){		
		this._super(pVPCTRL);		

this.pCtx2D = pCnv.getContext('2d');
		// internal Canvas to draw the scalebar
		//  the scalebar is first draw on this and then burn in into an image.
		this.pCanvas = $('<canvas/>').css({'z-index':1000, 'position':'absolute', 'top':0 })[0];
		this.pCanvas.width = 600;
		this.pCanvas.height = 50;
		
		this.iMaxWidth = 300;
		this.iMinWidth = 100;
	},
	draw: function(){
		this.update();
		dPS = this.pVPCTRL.getPixelSize();
		var ctx = this.pCanvas.getContext('2d');
		var l = this.getValue();
		l = l/dPS;
		ctx.fillStyle = 'rgba(0,0,0,0.5)';
		ctx.fillRect(0,0, this.iMaxWidth, this.pCanvas.height);
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#fff';
		ctx.rect(5,10, l, 5);
		ctx.fill();
		ctx.stroke();	
		ctx.textBaseline = 'top';
		ctx.font = '14px Arial';
		ctx.strokeText(this.text, 10, 25); 
		ctx.fillText(this.text, 10, 25); 		
		this.pCtx2D.drawImage(this.pCanvas, 0, this.pCtx2D.canvas.height - this.pCanvas.height);	

	}
});