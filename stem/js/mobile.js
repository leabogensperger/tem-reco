// JavaScript Document
var g_isiOS = false;
if( /webOS|iPhone|iPad|iPod|/i.test(navigator.userAgent) ) {
 g_isiOS = true;
}

g_isMobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Touch|Opera Mini/i.test(navigator.userAgent) ) {
 g_isMobile = true;
}

$(document).ready( function(){
	$('body').on(TouchMouseEvent.DOWN, '#Footer', function(e){
		e.preventDefault();	
	});
	
	$('body').on(TouchMouseEvent.DOWN, '#SidebarWidget', function(e){
		e.preventDefault();	
	});
});

if(g_isMobile){
		loadCSS('css/mobile.css');	
}