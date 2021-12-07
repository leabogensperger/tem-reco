/*
	Loading page Splash Screen
*/

TLoadingSplashScreen = TUIElement.extend({
	init: function(){
		this._super();
		this.buildHTML();
	},
	buildHTML: function(){
		this.$e.attr({'id': 'LoadingSlashScreen'});
		this.$e.html('loading');
		this.$e.appendTo($('body'));
		// position it in the center
		if (window.innerHeight != undefined){
			this.$e.css({'top': ((window.innerHeight - this.$e.height())/2) + 'px',
									'left':((window.innerWidth - this.$e.width())/2) + 'px',});
		}
	}, 
	shutdown:function(){
		this.$e.remove();
	}
})