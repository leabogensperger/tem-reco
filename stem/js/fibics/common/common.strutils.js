// JavaScript Document

function formatPixelCount(pc){	
	if (pc <	1E3){
		return 	pc + ' pixels';
	}
	else if (pc <	1E6){
		return 	(pc/1e3).toFixed(1) + ' kpixels';
	}
	else if (pc <	1E9){
		return 	(pc/1e6).toFixed(1) + ' megapixels';
	}
	else if (pc <	1E12){
		return 	(pc/1E9).toFixed(1) + ' gigapixels';
	}
}

function formatArea(dArea, formatToHTML){
	var theNum = '';
	var theUnits = '';
	var iPrecision = 1;
	if (formatToHTML == undefined)
		formatToHTML = true;		
	
	if (Math.abs(dArea) <	1E-6){
		theNum = dArea / 1E-12;
		theUnits = ' fm';
	}
	else if (Math.abs(dArea) <	1){
		theNum = dArea / 1E-6;
		theUnits = ' nm';
	}
	else if (Math.abs(dArea) <	1E6){
		theNum = dArea;
		theUnits = ' µm';
	}
	else if (Math.abs(dArea) <	1E12){
		theNum = dArea/1E6;
		theUnits = ' mm';
	}
	else if (Math.abs(dArea) <	1E14){
		theNum = dArea/1E7;
		theUnits = ' cm';
	}
	
	if (theNum > 1E3) iPrecision = 1;
	else if (theNum > 1E2) iPrecision = 1;
	else if (theNum > 1E1) iPrecision = 2;
	else if (theNum > 1) iPrecision = 3;	
	
	if(formatToHTML)
		return theNum.toFixed(iPrecision) + "<span class='infoUnits'>" +  theUnits +  "<sup>2</sup></span>";
	else
		return theNum.toFixed(iPrecision) + theUnits + '²';
}

function formatDim(dDim, formatToHTML){
	var theNum = '';
	var theUnits = '';
	if (formatToHTML == undefined)
		formatToHTML = true;		
	
	if (Math.abs(dDim) <	1E-3){
		theNum = dDim / 1E-6;
		theUnits = ' fm';
	}
	else if (Math.abs(dDim) <	1){
		theNum = (dDim/1e-3).toFixed(1);
		theUnits = ' nm';
	}
	else if (Math.abs(dDim) <	1E1){
		theNum = (dDim/1).toFixed(3);
		theUnits = ' µm';
	}
	else if (Math.abs(dDim) <	1E2){
		theNum = (dDim/1).toFixed(2);
		theUnits = ' µm';
	}
	else if (Math.abs(dDim) <	1E3){
		theNum = (dDim/1).toFixed(1);
		theUnits = ' µm';
	}
	else if (Math.abs(dDim) <	1E4){
		theNum = (dDim/1E3).toFixed(3);
		theUnits = ' mm';
	}
	else if (Math.abs(dDim) <	1E5){
		theNum = (dDim/1E3).toFixed(2);
		theUnits = ' mm';
	}
	else if (Math.abs(dDim) <	1E6){
		theNum = (dDim/1E3).toFixed(1);
		theUnits = ' mm';	
	}
	if(formatToHTML)
		return theNum + "<span class='infoUnits'>" +  theUnits +  "</span>";
	else
		return theNum + theUnits;		
}

function formatStrToXML(str){
	if (typeof str == 'undefined')
		return ""
	str = str.replace(/'/g, "!#39!");
	str = str.split("\n").join("#10#13");
	
	return str;
}

function formatStrFromXML(str){
	str = str.replace(/!#39!/g, "'")	;
	str = str.split("#10#13").join("\n");
	
	return str;
}

function wrapText(text, maxWidth){
	var pLines = text.split('\n');
	var wrappedText = new Array();
	for(var i = 0; i < pLines.length; i++){				
		var wrappedLines = wrapLine(pLines[i], G_WORDWRAPPED_THRESHOLD);
		for ( var j = 0 ; j < wrappedLines.length; j++){
			wrappedText.push(wrappedLines[j]);
		}
	}
	return wrappedText;
}

function wrapLine(text, maxWidth) {
	var words = text.split(' ');
	var lines = new Array();
	var line = '';

	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';		
		if (testLine.length > maxWidth && n > 0) {
			lines.push(line);
			line = words[n] + ' ';
		}
		else {
			line = testLine;
		}		
	}	
	lines.push(line);
	return lines;
}

