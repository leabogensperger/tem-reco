function isLocalStorageAvailable() {
	try {
		if (typeof(localStorage) == 'undefined' ) {
			return false;
		} else {
			return true;
		}
	} catch(e) {
		if (typeof g_UserWarnedLocalStorage === 'undefined' || (!g_UserWarnedLocalStorage) ) {
			alert("It looks like Localstorage is disabled. Please enable it.\n\nERROR Message: "+e.message);
			g_UserWarnedLocalStorage = true; //warn user only once per runtime/webpage load.
		}
		return false;
	}
}
g_UserWarnedLocalStorage = false;
TStorage = Class.extend({
	init: function(pProj){
		this.project = pProj;
	},
	saveToProject: function(key, value){
		key = this.project.uid  + '-' + key;
		this.globalSave(key, value);
	},
	loadFromProject: function(key){
		key = this.project.uid  + '-' + key;
		return this.globalLoad(key);
	},
	globalSave: function(key, value){
		// Use data Storage when available...
		if (!isLocalStorageAvailable() ) {
			// use cookies
			if(value.length > 4000) {
				throw 'String to be saved is too long.';
				return false;
			}
			$.cookie(key, value, { expires: 31});
		}
		else {
			try {
				localStorage.setItem(key, value);
			}
			catch (e) {
				if (e == QUOTA_EXCEEDED_ERR) {
					throw 'Quota exceeded!';
					return false;
				}
			}
		}
		return true;
	},
	globalLoad: function(key){
		if (!isLocalStorageAvailable() ) {
			return $.cookie(key);
		} else {
			var value = localStorage.getItem(key);
			return value;
		}
	},
	safeGlobalLoad: function(key, defaultValue){
		try{
			var x = this.globalLoad(key);
			if ((typeof x === "undefined") || (x === null))
				return defaultValue;
			return x;
		}
		catch(e){
			return defaultValue;
		}
	}
});
