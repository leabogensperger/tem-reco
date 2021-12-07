// JavaScript Document
TLanguageSwitcher = TUIElement.extend({
	init: function(){
		this._super();
		this.initialized = false;
		this.buildHTML();
	},
	buildHTML: function(){
		this._super();
		this.$e.html('Français');
		this.$e.on(TouchMouseEvent.DOWN, function(){
			var newURL = ''; 
			if(G_LANG_CTRL.getCurrentLanguageCode() == 'en')
				newURL = G_MUSEUM_OF_NATURE_FR_URL;//G_LANG_CTRL.getURLForLanguage('fr');
			else
				newURL = G_MUSEUM_OF_NATURE_EN_URL;//G_LANG_CTRL.getURLForLanguage('en');
			window.location.href = newURL;
		});		
	},
	initHTML: function(){
		this.$e.attr({'id': 'languageSwitcher'});
		this.$e.addClass('button southWestHint');
		if(G_LANG_CTRL.getCurrentLanguageCode() == 'en')
			this.$e.html('Français');
		else
			this.$e.html('English');		
		if (this.initialized)
			this.$e.button('destroy');
		this.$e.button();
		this.initialized = true;		
	}
});