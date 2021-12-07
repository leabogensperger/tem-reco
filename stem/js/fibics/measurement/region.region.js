// JavaScript Document

TRegion = TChangeCounted.extend({
	init: function(){
		this._super();
		this.uid = guid();
		this.name = '';
		this.extLink = '';
		this.description = '';
	},
	isRegion: function(){
		return true;
	},
	setName: function(n){
		this.name = n;
		this.incChangeCount();
	},
	setDescription: function(d){
		this.description = d;
		this.incChangeCount();
	},
	setExtLink: function(l){
		this.extLink = l;
		this.incChangeCount();
	},
	initVar: function(){
		this._super();
		this.className = 'TRegion';
	},
	goToLink: function(){
		OpenLinkInNewWindow(this.extLink,  'Region' + this.uid);	
	},
	packInfo: function(obj){
		try	 {
			if(obj == undefined)
				var obj = new Object();
			obj.mClass =  'TRegion';
			obj.name = this.name;
			obj.extLink = this.extLink;
			obj.description = this.description;
		}
		catch(error){
			displayError(error);
		}		
		return obj;
	},
	fromJSON: function (obj){
		this.name = obj.name;
		this.extLink = obj.extLink;
		this.description = obj.description;
	},
	toXML : function($n){		
		newXMLNode('Name').html(this.name).appendTo($n);
		newXMLNode('ExtLink').html(this.extLink).appendTo($n);
		newXMLNode('Description').html(this.description).appendTo($n);		
	},
	fromXML: function($n){
		this.name = $n.children('Name').text();		
		this.extLink = $n.children('ExtLink').text();	
		this.description = $n.children('Description').text();
	}
});