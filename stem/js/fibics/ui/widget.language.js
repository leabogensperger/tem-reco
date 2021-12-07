TLanguagePanel = TBaseWidget.extend({
	init: function(pAppC){
		this._super(pAppC);
		this.icone = 'language_widget_icon.png';
		this.title = _e('language');
		this.hint = _e('language');
		this.id = 'LanguageWidget';
		this.buildHTML();
	},
	buildHTML : function(){
		this._super();
	},
	buildPanel: function(){
		this._super();
		$('<label/>').html(_e('language')).appendTo(this.$panelC);
		$langSelector = $('<select />').attr({'id':'languageSelector'}).appendTo(this.$panelC);
		$optEng = $('<option />').attr({'value':'en'}).html(_e('english'));
		$langSelector.append($optEng);
		if(G_LANG_CTRL.getCurrentLanguageCode() == 'en')
			$optEng.prop('selected', true);

		$optFra = $('<option />').attr({'value':'fr'}).html(_e('french'));
		$langSelector.append($optFra);
		if(G_LANG_CTRL.getCurrentLanguageCode() == 'fr')
			$optFra.prop('selected', true);

		$optGer = $('<option />').attr({'value':'de'}).html(_e('german'));
		$langSelector.append($optGer);
		if(G_LANG_CTRL.getCurrentLanguageCode() == 'de')
			$optGer.prop('selected', true);

		$langSelector.change(function(e){
			if(!G_APPLICATION_CTRL.sessionSerializer.saveToSession()){
				//session save failed, warn user to continue? not really necessary
			}
			var langURL = G_LANG_CTRL.getURLForLanguage($(this).val());
			window.location.href = SetURLParameter('preload',1,langURL);
		});
	}
});
