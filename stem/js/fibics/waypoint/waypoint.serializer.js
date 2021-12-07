// JavaScript Document
var TWaypointSerializer = Class.extend({
	init: function(pWCTRL){
		this.pWCTRL = pWCTRL;
	},
	saveToXML: function($parentNode){
		this.mNode = $('<waypoints />');
		$parentNode.append($(this.mNode));
		var i = 0;
		while(i < this.pWCTRL.waypointList.length){
			this.addWaypointToXML(this.pWCTRL.waypointList[i],this.mNode)	;
			i++;
		}
	},
	addWaypointToXML: function(aW, parentNode){
		n = $('<waypoint></waypoint>');
		aW.toXML(n);
		n.appendTo(parentNode);
	},
	loadFromXML: function($xml){
		$ml = $xml.find('waypoints');
		var mSer = this;
		$ml.children().each(function(){
			var wp = new TWaypoint();
			wp.fromXML($(this));
			// first check if there is already a waypoint with that uid
			if(mSer.pWCTRL.getWaypointWithID(wp.uid) == null)
				mSer.pWCTRL.addWaypoint(wp);
			else
				wp = null;
		});
	}
});
