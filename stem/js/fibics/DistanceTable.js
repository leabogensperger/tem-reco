// Code for the distance Table

function DistanceTable(ID, WPController){
	this.id = ID;
	var me = this;
	this.controller = WPController;
	
	this.onAddWaypoint = function(e, aWP){		
		me.$e.append($('<div>A new waypoint is created : (' + aWP.pt.x + ', ' + aWP.pt.y + ' )</div>'));
		$(aWP).on('onChange', me.onWaypointChange);
	};
	
	this.onWaypointChange = function(e, aWP){
		me.$e.append($('<div>The new value of the waypoint (' + aWP.pt.x +', ' + aWP.pt.y + ') </div>'));
	};
	
	$(this.controller).on('onAddWaypoint', this.onAddWaypoint);
	this.$e = $('#'+this.id);
	// Add the necessary HTML to the DOM Element
	this.$e.append("<div class='Title'>Distance Table</div>");	
};