THTMLScaleBar = TBaseScaleBar.extend({
	init: function(pVPCTRL){
		this._super(pVPCTRL);
		this.buildHTML();
		this.iMinWidth = '50';
		this.iMaxWidth = '300';
		this.fixedValue = null;		
		var me = this;
	},
	getValue: function(){
		if(this.fixedValue != null){
			return this.fixedValue;	
		}
		return this._super();
	},
	shutDown: function(){
		this.$e.remove();
	},
	buildHTML : function(){
		this.$e = $('<div></div>').attr({
			id:'scaleBarCTNR' ,
			title:'Double-Click to Enter a Fixed Scale Bar Value'
		});
		this.$e.append($('<div></div>').attr('id', 'scaleBarDim'));
		this.$e.append($('<div></div>').attr('id', 'scaleBarBar'));
		this.$e.append($('<div></div>').attr('id', 'scaleBar'));
		
		var me = this;
		this.$e.dblclick(function(){
			if(g_pScaleBarFixedWidthForm == null){
				g_pScaleBarFixedWidthForm = new TScaleBarFixedWidthForm(me);
			}
			g_pScaleBarFixedWidthForm.show();
		});		
	},
	draw : function(){
		this.update();
		if ((this.pVPCTRL == null) ||  (this.pVPCTRL == undefined))  
			return false;
		var dPixSize = this.pVPCTRL.getPixelSize(true);
		if(dPixSize == 0) return false;
		
		if(this.fixedValue == null){	
			var wPixel = this.getValue()/dPixSize;
		}
		else{
			var wPixel = this.fixedValue/dPixSize;
		}		
		var ctnrWidth = parseFloat(this.$e.width());
		
		if(wPixel >= this.getMaxWidth()){
			if(!this.$e.find('#scaleBarDim').hasClass('scaleBarOversized')){
				this.$e.find('#scaleBarBar').css('width', wPixel + 'px');
				this.$e.find('#scaleBarBar').addClass('oversized');
				this.$e.find('#scaleBarDim').html(this.text);
				this.$e.find('#scaleBarDim').append('<span class="tooLarge">too large !</span>');
				this.$e.find('#scaleBarDim').addClass('scaleBarOversized');
			}
		}
		else if(this.$e.find('#scaleBarDim').hasClass('scaleBarOversized')){
			this.$e.find('#scaleBarDim').find('.tooLarge').remove();
			this.$e.find('#scaleBarBar').removeClass('oversized');
			this.$e.find('#scaleBarDim').removeClass('scaleBarOversized');
			this.$e.find('#scaleBarBar').css('width', wPixel + 'px');
			this.$e.find('#scaleBarDim').html(this.text);
		}
		else{		
			this.$e.find('#scaleBarBar').css('width', wPixel + 'px');			
			this.$e.find('#scaleBarDim').html(this.text);
		}
		this.$e.width(this.$e.find('#scaleBarBar').width() + 40);
	},
	getMaxWidth: function(){
		if (this.fixedValue == null){
			return this.iMaxWidth;
		}
		else return 3*this.iMaxWidth;
	}
});