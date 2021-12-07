// JavaScript Document

TRegionEditor = Class.extend({
	init: function(measCTRL){
		this.measurementCTRL = measCTRL;
	},
	setName: function(n){
		for(var i = 0; i < this.measurementCTRL.selectedMeasurementList.length; i++){
			if(this.measurementCTRL.selectedMeasurementList[i].isRegion()){
				this.measurementCTRL.selectedMeasurementList[i].setName(n);	
			}
		}	
	},
	setDescription: function(n){
		for(var i = 0; i < this.measurementCTRL.selectedMeasurementList.length; i++){
			if(this.measurementCTRL.selectedMeasurementList[i].isRegion()){
				this.measurementCTRL.selectedMeasurementList[i].setDescription(n);	
			}
		}	
	},
	setExtLink: function(n){
		for(var i = 0; i < this.measurementCTRL.selectedMeasurementList.length; i++){
			if(this.measurementCTRL.selectedMeasurementList[i].isRegion()){
				this.measurementCTRL.selectedMeasurementList[i].setExtLink(n);	
			}
		}	
	},
	setLocked: function(n){
		for(var i = 0; i < this.measurementCTRL.selectedMeasurementList.length; i++){
			this.measurementCTRL.selectedMeasurementList[i].setLocked(n);			
		}
	}
});