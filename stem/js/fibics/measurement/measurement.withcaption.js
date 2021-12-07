// JavaScript Document
TMeasurementWithCaption = TMeasurement.extend({
	init: function(pt1, pt2, pt3, pt4){
		this._super();
		this.caption = new TCaption(new point(0,0), '');
	},
	toXML : function($n){		
		this._super($n);
		// save caption
		$c = newXMLNode('Caption').appendTo($n);
		this.caption.toXML($c);
	},
	fromXML: function($n){
		this._super($n);
		this.caption.fromXML($n.children('Caption'));
	},
	select: function(){
		this.caption.select();
		this._super();
	},
	deselect: function(){
		this.caption.deselect();
		this._super();
	}
	});
