var g_shiftdown = false;
var g_ctrldown = false;
var g_altdown = false;

$(document).ready(function(){
	$(document).keydown(function(e){
		g_shiftdown = false;
		g_ctrldown = false;
		g_altdown = false;
		if (e.altKey)
			g_altdown = true;
		else if (e.ctrlKey)
			g_ctrldown = true;
		else if (e.shiftKey)
			g_shiftdown = true;
	});
	
	$(document).keyup(function(e){
		g_shiftdown = false;
		g_ctrldown = false;
		g_altdown = false;
	});
});