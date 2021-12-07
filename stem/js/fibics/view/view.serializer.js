// JavaScript Document
var TViewSerializer = Class.extend({
	init: function(pVCTRL){
		this.pViewCTRL = pVCTRL;
	},
	saveToXML: function($parentNode){	
		this.mNode = newXMLNode('Views');
		$parentNode.append($(this.mNode));
		var i = 0;
		while(i < this.pViewCTRL.viewList.length){
			this.addViewToXML(this.pViewCTRL.viewList[i],this.mNode)	;
			i++;
		}
	},
	addViewToXML: function(aW, parentNode){
		n = newXMLNode('View');	
		aW.toXML(n);
		n.appendTo(parentNode);
	},
	loadFromXML: function($xml){
		$ml = $xml.find('Views');	
		var mSer = this;
		$ml.children().each(function(){
			var wp = new TATLASView();													 
			wp.fromXML($(this));
			// first check if there is already a waypoint with that uid
			if(mSer.pViewCTRL.getViewWithID(wp.uid) == null)
				mSer.pViewCTRL.addView(wp);
			else
				wp = null;
		});
	}														
});