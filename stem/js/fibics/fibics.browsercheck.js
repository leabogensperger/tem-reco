// JavaScript Document
TBrowserCheck  = Class.extend({		
	init: function(){	
		
		// create a canvas, you know, it can be handy.
		this.$canvas = $('<canvas></canvas>').attr('id', 'testCanvas');
		
		// All the different things that needs to be checked.
		// some of them are done asynchronously.
		// so there is a timer that check that all of them 
		// has been "checked" and will fire the callbacks		
		this.bCanvasDrawDone = false;
		this.bCanDrawToCanvasFlag = null;
		this.bCanvasSupported = true;
		
		var me = this;
		// the inverval that check if all of the variables have been checked.
		this.pIntervalId = setInterval(function(){			
			if (me.bCanvasDrawDone){
				// kill the interval since everything is complete.
				clearInterval(me.pIntervalId);
				$(me).trigger('CheckComplete', [me]);	
			}
		}, 300);		
		// do all the checks		
		this.canDrawToCanvas();	
		this.isCanvasSupported();		
	},
	canDrawToCanvas: function(){
		if(this.bCanDrawToCanvasFlag == null){
			this.bCanDrawToCanvasFlag = false;
			var me = this;
			
			var cnv = this.$canvas.get(0);			
			// if there is no canvas, you obviously cannot draw to it.
			if (cnv == undefined) {
				this.bCanvasDrawDone = true;
				return false;			
			}
			
			if ((cnv.width == 0) || (cnv.height == 0)){
					cnv.width = 100;
					cnv.height = 100;
			}
			
			// we create a new image
			// and we try to draw onto the canvas.
			// if it fails, then it cannot draw to canvas.
			// we need to do it assynchronuously since 
			// we can only draw the image once it is loaded.
			var anImg = new Image();		
			
			anImg.onload = function () {				
				me.bCanvasDrawDone = true;
				try{
					cnv.getContext('2d').drawImage(this, 0, 0, 20, 20);
					var url = cnv.toDataURL("image/png", null);
					me.bCanDrawToCanvasFlag = true;
				}
				catch(e){
					me.bCanDrawToCanvasFlag = false;
					return false;
				}
			};
			anImg.src = 'images/canvas_test_image.jpg';						
			return this.bCanDrawToCanvasFlag;			
		}		
	},
	isCanvasSupported: function(){
		try{
			var ctx = $('<canvas />').get(0).getContext('2d');
			ctx.translate(0.5, 0.5); 
			this.bCanvasSupported = true;
		}
		catch(err) { 
			this.bCanvasSupported = false;		
		}
		
	}
});