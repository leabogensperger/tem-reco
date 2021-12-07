// JavaScript Document

TRegion = TChangeCounted.extend({
	init: function(){
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
	packInfo: function(obj){
		try	 {
			if(obj == undefined)
				var obj = new Object();
			obj.mClass =  'TRegion';
			obj.name = this.name;
			obj.extLink = this.extLink;
			obj.description = this.description;
			this._super(obj);
		}
		catch(error){
			displayError(error);
		}		
		return obj;
	},
	fromJSON: function (obj){
		this._super(obj);
		this.name = obj.name;
		this.extLink = obj.extLink;
		this.description = obj.description;
	},
	toXML : function($n){		
		this._super($n);
		newXMLNode('Name').html(this.name).appendTo($n);
		newXMLNode('Extlink').html(this.extLink).appendTo($n);
		newXMLNode('Description').html(this.description).appendTo($n);		
	},
	fromXML: function($n){
		this._super($n);
		this.name = parseFloat($n.children('Name').text());		
		this.extLink = parseFloat($n.children('Extlink').text());		
		this.description = parseFloat($n.children('Description').text());		
	}
});