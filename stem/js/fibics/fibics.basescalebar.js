// JavaScript Document

TBaseScaleBar = Class.extend({		
	init: function (pVPCTRL ){		
		// defines the accepted 
		this.aAcceptedBase = new Array();
		this.aAcceptedBase.push(1);
		this.aAcceptedBase.push(2);
		this.aAcceptedBase.push(5);
	
		// the value displayed by the scalebar.
		// it is equal to iUnit * 10^iPowerOf10
		// call getValue to get the value
		this.iPowerOf10 = 0; // 10^0 => µm
		this.iUnit = 1;
		
		this.iMaxWidth = 400;
		this.iMinWidth = 100;
		this.pVPCTRL = pVPCTRL;
		
		// display vars
		this.width = 1;  // display width in pixel
		this.text = '';	 // the string holding what to draw
	},
	getValue: function(){
		return Math.pow(10, this.iPowerOf10) * this.iUnit;
	},
	getUnits: function(V){	
		V = V + 1E-8;
		if(V < 1E-6) 
			result = 'fm';
		else if(V < 1E-3) 
			result = 'pm';
		else if(V < 1) 
			result = 'nm';
		else if((V >= 1) && (V < 1E3)) 
			result = 'µm';
		else if((V >= 1E3) && (V < 1E6)) 
			result = 'mm';
		else if((V >= 1E6) && (V < 1E9)) 
			result = 'm';
		return result;
	},
	getValueToDisplay: function(V){
		
		if(V < 1E-6){
			V = V - 1E-8;
			result = V * 1E9
		}
		else if(V < 1E-3)
			result = V * 1E6;
		else if(V < 1)
			result = V * 1E3;
		else if(V < 1E3)
			result = V;
		else if(V < 1E6)
			result = V / 1E3;
		else if(V < 1E9)
			result = V / 1E6;
			
		return result;
	},
	update: function(){
		if (this.pVPCTRL == null) return false
		var dPixelSize = this.pVPCTRL.getFirstVisibleViewport().SDConverter.getPixelSize(true);
		var minV = this.iMinWidth*dPixelSize;
    var maxV =  this.iMaxWidth*dPixelSize;
    var iLPix = 0
		if ((minV + maxV) <= 0.0 )
			tenPWR = -9
    else 
			tenPWR = Math.log((minV + maxV)/2)/Math.log(10);
			
		this.iUnit = -1;
		this.iPowerOf10 = Math.floor(tenPWR);
    oneUnitW = Math.round(Math.pow(10, this.iPowerOf10) / dPixelSize);
		// try to find the base to display.
		for(var i = 0; i < this.aAcceptedBase.length; i++){
			iLPix = oneUnitW * this.aAcceptedBase[i];
			if (( iLPix > this.iMinWidth)
      	&& (iLPix < this.iMaxWidth)){
      		this.iUnit = this.aAcceptedBase[i];
					break;
			}
		}
		if(this.iUnit == -1){
			 this.iPowerOf10++;
			 this.iUnit = 1;
		}
		this.text = this.getValueToDisplay(this.getValue()) + ' ' + this.getUnits(this.getValue());
	}
});

$(document).ready(function(){
	 loadCSS('css/scalebar.css');	
});