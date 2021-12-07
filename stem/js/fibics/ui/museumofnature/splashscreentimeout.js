// JavaScript Document
var G_REDIRECTION_SPLASH_SCREEN_TIMEOUT;
$(document).ready(function(){	 
	if(G_MUSEUM_OF_NATURE){
		$('body').mousedown(function(e){		
			clearTimeout(G_REDIRECTION_SPLASH_SCREEN_TIMEOUT);
			resetRedirectionTimeout();
		});
		resetRedirectionTimeout();
	}
})

function resetRedirectionTimeout(){
	if (G_REDIRECTION_SPLASH_SCREEN_DELAY == -1) return false;
	
	G_REDIRECTION_SPLASH_SCREEN_TIMEOUT = setTimeout(function(){ 
		window.location.href = G_SPLASH_SCREEN_URL;																															 
	}, G_REDIRECTION_SPLASH_SCREEN_DELAY * 1E3); 
}
