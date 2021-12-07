// JavaScript Document
TPolygonRegion = TPolygon.extend({
	init: function(){
		this._super();		
		this.region = new TRegion();
		this.region.name = _e('polygonalregion');
		this.type = TMeasurementType.polygonRegion;
	},
	initVar: function(){
		this._super();
		this.className = 'TPolygonRegion';
	},
	updateCaption: function(){
		this.caption.clear();
		this.caption.addLine(this.region.name);	
		if(this.region.extLink != ''){
			if(this.locked)
				this.caption.addLine(_e('clicktofollowlink'));
			else
				this.caption.addLine(_e('controlclicktofollowlink'));
		}	
	},
	isRegion: function(){
		return true;
	},	
	packInfo: function(obj){
		try	 {			
			if(obj == undefined)
				var obj = new Object();
			
			this._super(obj);			
			obj.mClass =  'TPolygonRegion';
			obj.pts = new Array();
			for(var i = 0; i < this.pts.length; i++){
				obj.pts.push(this.pts[i].packInfo());	
			}
			obj.region = new Object();			
			this.region.packInfo(obj.region);			
		}
		catch(error){
			displayError(error);
		}		
		return obj;
	},
	fromJSON: function (obj){
		this._super(obj);
		this.region.fromJSON(obj.region);		
	},
	toXML : function($n){		
		this._super($n);
		$l = newXMLNode('Region').appendTo($n);
		this.region.toXML($l);		
	},
	fromXML: function($n){
		this._super($n);
		this.region.fromXML($n.find('Region'));
	},
	setName: function(n){
		this.region.setName(n);
		this.incChangeCount();	
	},
	setDescription: function(n){
		this.region.setDescription(n);
		this.incChangeCount();	
	},
	setExtLink: function(n){
		this.region.setExtLink(n);
		this.incChangeCount();	
	}
});