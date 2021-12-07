g_subDivisionTextRatio = 0.9;

TDisplayRuler = TDisplaySimpleMeasurement.extend({
	init: function(M){
		this._super(M);
		this.subDivisionSet = new Array(1, 2, 5);
		this.subDivisionDecade = 0;
		this.subDivision = 1;
	},
	getSubDivisionSize : function(){
		if(this.measurement.getLineThickness() < 3)
			return this.measurement.getLineThickness()*4;
		else 
			return this.measurement.getLineThickness()*3;
	},
	incSubDivision : function(){
		if(this.subDivision == 1){
			this.subDivision = 2;
		}
		else if (this.subDivision == 2){
			this.subDivision = 5;
		}
		else{
			this.subDivision = 1;
			this.subDivisionDecade += 1;
		}
	},
	decSubDivision : function(){
		if(this.subDivision == 1){
			this.subDivision = 5;
			this.subDivisionDecade -= 1;
		}
		else if (this.subDivision == 2){
			this.subDivision = 1;
		}
		else{
			this.subDivision = 2;			
		}
	},	
	getEndPointSize : function(){
		return this.measurement.getLineThickness()*7;
	},
	getSubDivisionVal : function(){
		return this.subDivision * Math.pow(10, this.subDivisionDecade);	
	},
	updateSubDivision : function(pSDCnvtr){
		var subDivSpanPixel = this.getSubDivisionVal()/pSDCnvtr.getPixelSize(true);
		if((subDivSpanPixel > 120)){			
			while(subDivSpanPixel > 120){
				this.decSubDivision();
				subDivSpanPixel = this.getSubDivisionVal()/pSDCnvtr.getPixelSize(true);
			}
		}
		
		if((subDivSpanPixel < 50) ){			
			while(subDivSpanPixel < 50){
				this.incSubDivision();
				subDivSpanPixel = this.getSubDivisionVal()/pSDCnvtr.getPixelSize(true);
			}
		}	
	},
drawLabel: function (pSDCNVTR, cnv){
		var ctx = cnv.getContext('2d');
		
		var lengthUm = this.measurement.length();
		var a = this.measurement.angle();
		var lPixel = this.measurement.length()/pSDCNVTR.getPixelSize(true);		
		var subDivCount =  Math.floor(lengthUm/this.getSubDivisionVal());
		var subDivSpanPixel = this.getSubDivisionVal()/pSDCNVTR.getPixelSize(true);
		var i = 0;		
		var dPt1 = pSDCNVTR.pixelFromMicron(this.measurement.pt[0], true);
		var dPt2 = pSDCNVTR.pixelFromMicron(this.measurement.pt[1], true);		
		var deltaX = dPt2.x;
		var deltaY = dPt2.y;			
		var dx = subDivSpanPixel * Math.cos(a);
		var dy = subDivSpanPixel * Math.sin(a);
		var divPres = 0;	
		var subDivText ;
		var textOffset = 15;
				
		ctx.font = "normal " +  this.measurement.caption.getFontSize()*g_subDivisionTextRatio +"px " + this.measurement.caption.getFontFamily();	
		ctx.textBaseline = 'middle';		
		ctx.strokeStyle = this.measurement.getTextOutlineColor();
		ctx.textAlign = "center";		
	
		var displaySubDivInt =  this.getSubDivisionVal();
		if(this.measurement.length()*pSDCNVTR.getPixelSize(true) < 1){
			displaySubDivInt *= 1;	
		}
		else if(displaySubDivInt < 1){
			divPres = 1;
		}
		
		var sDL = this.getSubDivisionSize();		
		ctx.beginPath();		
		
		ctx.fillStyle = this.measurement.getTextOutlineColor();
		ctx.strokeStyle =  this.measurement.caption.getTextOutlineColor();
		ctx.lineWidth = 3;
		while( i < subDivCount){			
			deltaX = dPt2.x - dx*(i+1) - ((sDL + textOffset)*Math.sin(a));
			deltaY = dPt2.y - dy*(i+1) + ((sDL + textOffset)*Math.cos(a));		
			subDivText = displaySubDivInt*(i+1);
			ctx.beginPath();
			/*if(g_drawTextSolidBackground){				
				var subLabelWidth = avp.ctx.measureText(subDivText.toFixed(divPres)).width;
				var r = new Seadragon.Rect(deltaX, deltaY, subLabelWidth,  this.measurement.caption.fontSize*0.66);
				avp.ctx.beginPath();
				inflateRect(r, 2);
				avp.ctx.rect(r.x, r.y - r.height/2, r.width, r.height);				
				avp.ctx.fill();
			}
			else {
				*/
				ctx.strokeText(subDivText.toFixed(divPres), deltaX, deltaY);
			//}
			i++;
		}		
		
		ctx.strokeStyle = this.measurement.caption.textColor;
		ctx.stroke();		
		i = 0;
		ctx.fillStyle = this.measurement.caption.textColor;
		while( i < subDivCount){			
			deltaX = dPt2.x - dx*(i+1) - ((sDL + textOffset)*Math.sin(a));
			deltaY = dPt2.y - dy*(i+1) + ((sDL + textOffset)*Math.cos(a));		
			subDivText = displaySubDivInt*(i+1);
			ctx.fillText(subDivText.toFixed(divPres), deltaX, deltaY);					
			i++;
		}		
		ctx.closePath();		
	},
	drawSubDivision : function(pSDCNVTR, cnv){
		var ctx = cnv.getContext('2d');			
		var lengthUm = this.measurement.length();
		var a = this.measurement.angle();
		var subDivCount =  Math.floor(lengthUm/this.getSubDivisionVal());
		var subDivSpanPixel = this.getSubDivisionVal()/pSDCNVTR.getPixelSize(true);
		var i = 0;
		var sDL = this.getSubDivisionSize();
		
		var dx = subDivSpanPixel * Math.cos(a);
		var dy = subDivSpanPixel * Math.sin(a);		
		var dPt1 = pSDCNVTR.pixelFromMicron(this.measurement.pt[0], true);
		var dPt2 = pSDCNVTR.pixelFromMicron(this.measurement.pt[1], true);	
		var deltaX = dPt2.x;
		var deltaY = dPt2.y;
				
		while(i < subDivCount){ 	
			deltaX = dPt2.x - dx*(i+1) - (sDL*Math.sin(a));
			deltaY = dPt2.y - dy*(i+1) + (sDL*Math.cos(a));			
			ctx.moveTo(deltaX, deltaY);			
			deltaX = deltaX + 2*sDL*Math.sin(a);
			deltaY = deltaY - 2*sDL*Math.cos(a);			
		 	ctx.lineTo(deltaX, deltaY);
			i++;
		}
		
		var ePS = this.getEndPointSize();		
		// Draw End Points
		ctx.moveTo(dPt1.x - (ePS*Math.sin(a)), dPt1.y + (ePS*Math.cos(a)));
		ctx.lineTo(dPt1.x + (ePS*Math.sin(a)), dPt1.y - (ePS*Math.cos(a)));		
		ctx.moveTo(dPt2.x - (ePS*Math.sin(a)), dPt2.y + (ePS*Math.cos(a)));
		ctx.lineTo(dPt2.x + (ePS*Math.sin(a)), dPt2.y - (ePS*Math.cos(a)));		
	
	},
	draw: function(pSDCNVTR, cnv){	
		var ctx = cnv.getContext('2d');
		
		this.updateSubDivision(pSDCNVTR);
		var lengthUm = this.measurement.length() * pSDCNVTR.getPixelSize(true);
		var a = this.measurement.angle();
		var subDivCount =  Math.floor(lengthUm/this.getSubDivisionVal());
		var subDivSpanPixel = this.getSubDivisionVal()/pSDCNVTR.getPixelSize(true);
			
		this.drawLabel(pSDCNVTR, cnv);	
		this.measurement.updateCaption(pSDCNVTR);
		this.displayCaption.draw(pSDCNVTR, cnv);
		if(g_showCallOutTail && this.showCallout){
			if((this.callout != undefined) && (this.callout != null)){
				this.callout.draw(pSDCNVTR, cnv);
			}
		}
		
		ctx.beginPath();
		this.drawSubDivision(pSDCNVTR, cnv);
		
		ctx.strokeStyle = this.measurement.getOutlineColor(); 
		ctx.fillStyle = this.measurement.getOutlineColor();
		ctx.lineWidth = parseFloat(this.measurement.getLineThickness()) + Math.max(3, this.measurement.getLineThickness()*0.6);
		ctx.lineCap = 'square';
		ctx.stroke();
		
		ctx.strokeStyle = this.measurement.getLineColor(); 
		ctx.fillStyle = this.measurement.getLineColor();
		ctx.lineWidth = this.measurement.getLineThickness();	
		ctx.lineCap = 'square';
		ctx.stroke();		
		this._super(pSDCNVTR, cnv, false);		
	}

});