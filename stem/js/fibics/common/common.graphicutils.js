// JavaScript Document

function measureText(pCtx, sText, sFont, dFontsize, textBaseline){
		var pLines = new Array();
		if((sText == '') || (sText == null))
			return new rect(0, 0, 0, 0);
		if(sText != ''){
			pLines = wrapText(sText, G_WORDWRAPPED_THRESHOLD);
			
		}
		var maxL = 0;
		var maxI = 0;
		// find out which one is the longuest line
		for(var i=0; i < pLines.length; i++){
			maxL = Math.max(pLines[i].length, maxL);
			if( maxL == pLines[i].length)
				maxI = i;
		}
		
		pCtx.textAlign = 'left';
		pCtx.textBaseline = textBaseline;
		pCtx.font = 'bold ' + dFontsize +"px " + sFont;
		var cHeight = 0;	
		var w = pCtx.measureText(pLines[maxI]).width;
		return new rect(0, 0, w, dFontsize * pLines.length);
}