g_iDisplayChangeCount = 0;

function incDisplayChangeCount(){
	g_iDisplayChangeCount++;
}

// JavaScript Document

function getHistogramFromImg(Img){	
	
}

/*

Return an array with 256 element with the count for each intensity normalized.

*/

function getGrayscaleHistogramFromCanvas(cnv){
	if((cnv == undefined) || (cnv == null)) return null;
	
	var canvasWidth  = cnv.width;
	var canvasHeight = cnv.height;
	var ctx = cnv.getContext('2d');
	var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	var gsCount = new Array(256);
	
	var data = imageData.data;
	var i = 0;
	while(i < 256){
		gsCount[i] = 0;	
		i++;
	}
	
	for (var y = 0; y < canvasHeight; ++y) {
		for (var x = 0; x < canvasWidth; ++x) {
				var iRed = (y * canvasWidth + x) * 4;
				var iGreen = iRed + 1;
				var iBlue = iGreen + 1;
				
				// only look at the red channel since we are only interested in a grayscale histo.
				ps = (data[iRed] + data[iGreen] + data[iBlue])/3;
				
				gsCount[ps]++;
		}
	}	
	
	// check which one is the max value
	var maxGSCount = 0;
	for (var i = 0; i < gsCount.length; i++){
		maxGSCount = Math.max(maxGSCount, gsCount[i]);	
	}
	// normalize everything based on the maximum value found
	for (var i = 0; i < gsCount.length; i++){
		gsCount[i] = gsCount[i]/maxGSCount;	
	}	
	return gsCount;
}

function getRGBHistogramFromCanvas(cnv){
	if((cnv == undefined) || (cnv == null)) return null;
	
	var canvasWidth  = cnv.width;
	var canvasHeight = cnv.height;
	var ctx = cnv.getContext('2d');
	var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	var rgbCount = new Array(3);
	for(var idx= 0; idx< 3; idx++){
		rgbCount[idx] = new Array(256);
		for(var jdx = 0 ; jdx < 256; jdx++){
			rgbCount[idx][jdx] = 0;
		} 
	}
	
	var data = imageData.data;
	
	for (var y = 0; y < canvasHeight; ++y) {
		for (var x = 0; x < canvasWidth; ++x) {
				var iRed = (y * canvasWidth + x) * 4;
				var iGreen = iRed + 1;
				var iBlue = iGreen + 1;
				
				// only look at the red channel since we are only interested in a grayscale histo.
				rgbCount[0][data[iRed]]++;
				rgbCount[1][data[iGreen]]++;
				rgbCount[2][data[iBlue]]++;
		}
	}	
	
	// check which one is the max value
	var maxRCount = 0;
	var maxGCount = 0;
	var maxBCount = 0;
	
	for (var idx = 0; idx < rgbCount[0].length; idx++){
		maxRCount = Math.max(maxRCount, rgbCount[0][idx]);
		maxGCount = Math.max(maxGCount, rgbCount[1][idx]);
		maxBCount = Math.max(maxBCount, rgbCount[2][idx]);
	}
	for (var idx = 0; idx < rgbCount[0].length; idx++){
		rgbCount[0][idx] = rgbCount[0][idx]/maxRCount;
		rgbCount[1][idx] = rgbCount[1][idx]/maxGCount;
		rgbCount[2][idx] = rgbCount[2][idx]/maxBCount;
	}	
	return rgbCount;
}
