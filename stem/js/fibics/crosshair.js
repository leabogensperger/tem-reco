var g_crosshairColor = '#00ff00';
var g_crosshairThickness = 1;

TCrosshair = Class.extend({		
	init: function (avp){
		this.pt = new Seadragon.Point(0,0);	
		this.isVisible = true;
		this.forceHidden = false;
		this.vp = avp;
		this.active = false;
		//this.footer = footer;
		CH = this;
		//this.addControls();
		this.pt = new TAtlasPoint(100, 100);
		
		$(this.vp.canvas).on(TouchMouseEvent.MOVE, function(e){
			offset = $(this).offset();
			x = e.pageX - offset.left;
			y = e.pageY - offset.top;
			CH.pt.x = x;
			CH.pt.y = y;
		});			
		
		/*$(avp).on('changeSize', function(e, avp){
			nW = avp.$e.width()*2;
			nH = avp.$e.height()*2;
			avp.$e.find('.horizontalLineXH').css('width', nW + 'px');
			avp.$e.find('.horizontalLineXH').css('left', (-nW/2) + 'px');
			avp.$e.find('.verticalLineXH').css('height' , nH + 'px');
			avp.$e.find('.verticalLineXH').css('top', (-nH/2) + 'px');	
			
		});	*/
	},
	getHTML: function(){		
		return "<div class='CrossHair nonMouseEvent'><div class='verticalLineXH'></div><div class='horizontalLineXH'></div></div>";
	},
	hide : function(){
		this.isVisible =  false;
		$('.CrossHair').fadeOut(200);
	},
	show: function(){
		this.isVisible =  true;
		$('.CrossHair').fadeIn(200);
	},
	draw: function(avp){
		if (G_MUSEUM_OF_NATURE) return null;
		if((!this.isVisible) || (g_isMobile)) return null;
		if(this.active) return null;
		var pt = avp.pixelFromMicron(this.pt);
		var dim = this.vp.getDisplayDim();
		avp.ctx.save();
		avp.ctx.translate(0.5, 0.5);
		
		this.vp.ctx.strokeStyle = g_crosshairColor;
		this.vp.ctx.lineWidth = g_crosshairThickness;
		this.vp.ctx.beginPath();
		this.vp.ctx.moveTo(0, this.pt.y); 
		this.vp.ctx.lineTo(dim.width, this.pt.y);
		this.vp.ctx.closePath();
		this.vp.ctx.stroke();		
		this.vp.ctx.beginPath();
		this.vp.ctx.moveTo(this.pt.x, 0); 
		this.vp.ctx.lineTo(this.pt.x, dim.height);
		this.vp.ctx.closePath();		
		this.vp.ctx.stroke();
		avp.ctx.restore();		
	},
	addControls: function(){		
		// Add the buttons to the footer...
		this.footer.$e.append($('<div>Hide CrossHair</div>').addClass('button').attr('id', 'ToggleCrossHair'));
		var data = {CH: this};
		$('#ToggleCrossHair').button();
		$('#ToggleCrossHair').on(TouchMouseEvent.DOWN, data, function(){  //former click
			if(!data.CH.forceHidden){
				//data.CH.hide();
				data.CH.forceHidden = true;
				$('#ToggleCrossHair').button('option', 'label', 'Show CrossHair');
			}
			else{
				data.CH.forceHidden = false;
				//data.CH.show();
				$('#ToggleCrossHair').button('option', 'label', 'Hide CrossHair');
			}
		});
	}	
});