// JavaScript Document
MAX_ATLAS_VIEW_COUNT = 100;
TATLASViewController = Class.extend({
	init: function(pAppC){
		this.pAppC = pAppC;
		this.viewList = new Array();
		this.serializer = new TViewSerializer(this);
	},
	addView: function(aV){
		if(this.viewList.length >= MAX_ATLAS_VIEW_COUNT){
			jAlert('Cannot have more than ' + MAX_ATLAS_VIEW_COUNT + ' views.');
			return false;
		}
		this.viewList.push(aV);	
		$(this).trigger('onAddView', aV);
	},	
	deleteAllView: function(){
		while(this.viewList.length != 0){
			this.deleteView(this.viewList[0]);
		}
	},
	deleteView: function(aV){
		$(this).trigger('onDeleteView', [aV]);
		this.viewList.removeItem(aV);
	},
	getViewWithID: function(aID){
		if (aID == undefined){
			debugLog('Cannot find a view with an undefined ID!!!');
			return null;	
		}
		
		var i = 0;
		while(i < this.viewList.length){
			if(this.viewList[i].uid == aID){
				return this.viewList[i];	
			}	
			i++;
		}
		return null;
	},
	goToView: function(aV, bImmediatetly){
		if (aV == undefined) return false;
		this.pAppC.ATLASViewportController.setBoundsUm(aV.getBounds(),  bImmediatetly);
	}	,
	/// refire the onAddMeasurement Event for all the existing measurement.
	fireAddView: function(){
		for(var i = 0 ; i < this.viewList.length; i++){
			$(this).trigger('onDeleteView', [this.viewList[i]]);	
		}
		for(var i = 0 ; i < this.viewList.length; i++){
			$(this).trigger('onAddView', [this.viewList[i]]);		
		}
	},
})