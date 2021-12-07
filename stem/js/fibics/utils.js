function loadCSS(cssURL){
	$("head").append("<link>");
    css = $("head").children(":last");
    css.attr({
      rel:  "stylesheet",
      type: "text/css",
      href: cssURL
    });
}

function loadScript(scriptURL){
	$("head").append("<script></script>");
    s = $("head").children(":last");
    s.attr({
      type: "text/javascript",
      src: scriptURL
    });
}

function loadJsCssFile(filename, filetype){
    if (filetype == "js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype == "css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}


function checkFloat(aFloat){
	if(isNaN(aFloat) || aFloat === '')
		return false;
	else
		return true;
}

function hasAgreed(aVal){
	if(typeof(aVal) == 'string')
		return aVal == 'true';
	else
		return aVal == true;
}

function checkForEmptyVal(aVal){
	if((aVal == '')
		|| (aVal == 0)
		|| (aVal == '0')){
		jAlert(_e('theenteredvalueisnotvalid'),
				"Incorrect Input Value" );
		return false;
	}
	else
		return true;
}

Array.prototype.findIndex = function(value){
	var ctr = -1;
	for (var i=0; i < this.length; i++) {
		// use === to check for Matches. ie., identical (===), ;
		if (this[i] == value) {
			return i;
		}
	}
	return ctr;
};

Array.prototype.removeItem = function(anItem){
	index = this.findIndex(anItem);
	this.splice(index, 1);
};

function displayError(error){
	var msg = error;
	//if($.browser.mozilla || $.browser.msie){
		msg += " on line " + error.lineNumber;
	/*}
	else{
		msg += " on line " + error.line;
	}	*/
	alert(msg)	;
}

function numberWithSpace(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function nodeExists(n){
	return (n != undefined) &&( n.size() > 0)	;
}

function rad2Deg(rad){
	var aAn = (360*rad/(2*Math.PI));
	if(aAn < 0) aAn += 180;
	else aAn -=180;
	return -aAn;
}

function deg2Rad(deg){
	deg = deg;
	if(deg < 0) deg += 180;
	else deg -=180;

	var aAn = deg*(2*Math.PI)/360;
	return aAn;
}

function GetURLParameter(sParam){
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
			}
	}
	return null;
}

function SetURLParameter(sParam,sValue,url=null){
	if (url == null)
		var url = document.URL;
	var p = jQuery.parseParams( url.split('?')[1] || '');
	p[sParam] = sValue;
	var newURL = url.split('?')[0] + '?' + $.param(p);
	// $.param converts / to %2F which is not suitable here...
	newURL = newURL.replace(/%2F/g, '/');
	return newURL;
}

function OpenLinkInNewWindow(url, winID){
		var win = window.open(url, winID);
		if ((win != null)
				&& (win != undefined))
			win.focus();
		else{
			var text = _safeDefault(_e('openlinkerror'),'<h2>Oops!</h2><p>Looks like your browser prevents the pop-up window from opening.</p><p>Manually enter this URL in your browser:');
			jAlert(text+' <br><i>' + url + '</i></p>');
		}
	}
/*

String.prototype.UCFirstLetter = function() {
    var fc = this.charAt(0);
		if (fc != undefined)
			return this.charAt(0).toUpperCase() + this.slice(1);
}*/

function _safeNumParse(inval,defaultValue) {
	if (!_isDefined(inval))
		return defaultValue;
    var n = parseInt(inval,10);
    if (isNaN(n)) {
        return defaultValue;
    } else {
        return n;
    }
}

function _safeFloatParse(inval,defaultValue) {
	if (!_isDefined(inval))
		return defaultValue;
    var n = parseFloat(inval);
    if (isNaN(n)) {
        return defaultValue;
    } else {
        return n;
    }
}

function _safeDefault(t,defaultValue) {
	if (!_isDefined(t))
		return defaultValue;
	if (t.length == 0)
		return defaultValue;
	return t;
}

function _isDefined(v) {
	return !(typeof v == 'undefined');
}

function _ObjHasObjwithVal(o,v) {
	for (k in o) {
	    for (j in o[k]) {
			if (o[k][j] == v)
		        return true;
		}
	}
	return false;
}

function _UrlExists(url) {  // modified from https://stackoverflow.com/a/31936894/883015
	try {
		var http = new XMLHttpRequest();
		http.open('HEAD', url, false); // check w/o downloading msg-body
		http.send();
		return http.status!=404;
	} catch(error) {
		return false;
	}
	return false;
}
