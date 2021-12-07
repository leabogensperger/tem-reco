// JavaScript Document
function XMLToString(oXML) {   
	// uncommented these lines so that it works in IE8...
	if ((window.ActiveXObject) && (oXML.xml != undefined)){     
			result = oXML.xml;   
	} else {     
			result = (new XMLSerializer()).serializeToString(oXML);   
	} 
	if(result == undefined) return ''; 
	result = result.split(/\r\n|\r|\n/);
	result = result.join('');
	return result;
}

function newXMLNode(NodeName){
	return $($.parseXML('<' + NodeName + ' />').documentElement);	
}

function compareNodeName(N1, N2){
	return N1.toLowerCase() == N2.toLowerCase();	
}
