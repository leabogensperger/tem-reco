// Language controller for MultiLanguage support.
// Should be singleton and global to the application.
// The application controller should load it before ANYTHING else.


TLanguage = {
	English:0,
	French:1,
	German:2,
	Spanish:3,
	fromCode: function(aCode){
		if(aCode == 'fr') return TLanguage.French;
		else if(aCode == 'en') return TLanguage.English;
		else if(aCode == 'de') return TLanguage.German;
		else if(aCode == 'es') return TLanguage.Spanish;
		return null;
	},
	toCode: function(pLang){
		var i = parseInt(pLang);
		if(isNaN(i)) return null;
		if (i == TLanguage.English) return 'en';
		else if (i == TLanguage.French) return 'fr';
		else if (i == TLanguage.German) return 'de';
		else if (i == TLanguage.Spanish) return 'es';
	}
};

TLanguageController = Class.extend({
	init: function(){
		this.defaultLanguage = TLanguage.fromCode(G_DEFAULT_LANGUAGE);
		this.pIOCTRL = null;
	},
	initialize: function(){
		// Fetch language change in URL
		sURLLang = GetURLParameter('lang');
		lang = this.defaultLanguage;
		// Fetch it from the session
		if (this.pIOCTRL != null)
			sSessionLang = this.pIOCTRL.globalLoad('DefaultLanguage');

		if(sURLLang){ // URL Lang has priority
			lang = TLanguage.fromCode(sURLLang);
		}
		else if(sSessionLang != null){ // then it is the session language.
			lang = TLanguage.fromCode(sSessionLang);
		}
		this.setLanguage(lang);
	},
	getExpression: function(sexp){
		var tExp = '';
		switch(this.currentLanguage){
			case TLanguage.English:
				tExp = TEnglishDict[sexp];
				break;
			case TLanguage.French:
				tExp = TFrenchDict[sexp];
				break;
			case TLanguage.German:
				tExp = TGermanDict[sexp];
				break;
		}
		if((tExp == '') || (tExp == null)){
			console.log('Impossible to find the expression ' + sexp + '.')
		}
		return tExp;
	},
	setLanguage: function(sL){
		if ((sL != null) && (sL != undefined) && (typeof sL == 'string'))
			sL = sL.toLowerCase();
		if((sL == 'fr') || (sL == 'french') || (sL == TLanguage.French))
			this.currentLanguage = TLanguage.French;
		else if((sL == 'en') || (sL == 'english') || (sL == TLanguage.English))
			this.currentLanguage = TLanguage.English;
		else if((sL == 'de') || (sL == 'german') || (sL == TLanguage.German))
			this.currentLanguage = TLanguage.German;
		else{
			alert('The specified language is unknown, defaulting to English.');
			this.currentLanguage = TLanguage.English;
		}
		if(this.pIOCTRL != null){
			this.pIOCTRL.globalSave('DefaultLanguage', TLanguage.toCode(this.currentLanguage));
		}
	},
	getCurrentLanguageCode: function(){
		switch(this.currentLanguage){
			case TLanguage.English:
				return 'en';
				break;
			case TLanguage.French:
				return 'fr';
				break;
			case TLanguage.German:
				return 'de';
				break;
		}
	},
	getURLForLanguage: function(sL){
			return SetURLParameter('lang',sL);
	},
	setIOCTRL: function(pIOCTRL){
		this.pIOCTRL = pIOCTRL;
		var cL = parseInt(this.pIOCTRL.globalLoad('DefaultLanguage'));
		// here the language specified in the URL is
		sURLLang = GetURLParameter('lang');
		if(sURLLang != null){
			this.currentLanguage = TLanguage.fromCode(sURLLang);
			//this.setLanguage(TLanguage.fromCode(sURLLang));
		}
		else if((cL != null) && (!isNaN(cL))){
			this.currentLanguage = cL;
		}
	}
});

G_LANG_CTRL = null;
$(document).ready(function(){
	G_LANG_CTRL = new TLanguageController();
});

function _e(sexp){
	if ((G_LANG_CTRL != null)
			 && (G_LANG_CTRL != undefined)){
		return G_LANG_CTRL.getExpression(sexp);
	}
	return undefined;
}

function _et(term){ //attemps to look for translation
	if (typeof lang != 'undefined') {
		if (lang == 0){ //do nothing if already english
			return term;
		}
	}
	var attempt = _e(term.toLowerCase());
	if (typeof attempt != 'undefined') {
		if (attempt.length > 0) {
			return attempt;
		}
	}
	return term; //no translation available, use original
}
