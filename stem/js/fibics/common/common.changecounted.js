// JavaScript Document

TChangeCounted = Class.extend({
init: function(){
	this.changeCount = 0;
},
incChangeCount: function(){
	this.changeCount++;
	incDisplayChangeCount();
}});

TChangedCountTracker = Class.extend({
	init: function(pChangeCounted){
		this.changeCountedObj = pChangeCounted;
		this.lastChangeCount = -1;		
	},
	hasChanged : function(){
		return this.lastChangeCount != this.changeCountedObj.changeCount;
	},
	update: function(){
		this.lastChangeCount = this.changeCountedObj.changeCount;
	}	
});

 
 