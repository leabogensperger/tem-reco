TWaypointControllerState = {
	idle:0,
	createWaypoint:1,
	creatingWaypoint:2
};

var G_MAX_WAYPOINT_COUNT = 200;

TWaypointController = TBaseController.extend({
	init: function(pVPCTRL){
		this._super();
		this.waypointList = new Array();
		this.serializer = new TWaypointSerializer(this);
		this.state = TWaypointControllerState.idle;
		this.selectedWaypointList = new Array();
		this.displayAllWaypoint = true;
		this.creationWaypoint = new TWaypoint(0,0, '',-1, '', '');
		this.viewportController = pVPCTRL;
	},
	fireAddWaypoint: function(){
		for(var i = 0 ; i < this.waypointList.length; i++){
			$(this).trigger('onDeleteWaypoint', this.waypointList[i]);
		}
		for(var i = 0 ; i < this.waypointList.length; i++){
			$(this).trigger('onAddWaypoint', this.waypointList[i]);
		}
	},
	addWaypoint: function(aWP){
		// make sure you are not at the maximum allowed.
		if(this.waypointList.length == G_MAX_WAYPOINT_COUNT){
			console.log('Cannot add the waypoint since the maximum has been reached.');
			return false;
		}

		this.waypointList.push(aWP);
		aWP.visible = this.displayAllWaypoint;
		$(this).trigger('onAddWaypoint', aWP);
		incDisplayChangeCount();
	},
	createWaypoint : function(x,y){
		id = this.getNextWaypointID();
		wp = new TWaypoint(x,y, id, '', '');
		this.addWaypoint(wp);
		return wp;
	},
	deleteWaypoint: function(wp){
		$(this).trigger('onDeleteWaypoint', [wp]);
		this.selectedWaypointList.removeItem(wp);
		this.waypointList.removeItem(wp);
		incDisplayChangeCount();
	},
	deleteAllWaypoint: function(){
		while(this.waypointList.length != 0){
			this.deleteWaypoint(this.waypointList[0]);
		}
	},
	deleteWaypoints: function(aList){
		while(aList.length != 0){
			this.deleteWaypoint(aList[0]);
			aList.removeItem(aList[0]);
		}
	},
	getWaypointWithID: function(aID){
		var i = 0;
		while(i < this.waypointList.length){
			if(this.waypointList[i].uid == aID){
				return this.waypointList[i];
			}
			i++;
		}
		return null;
	},
	selectWaypoint : function(wp){
		wp.select();
		$(this).trigger('onSelectWaypoint', [wp]);
		if(this.selectedWaypointList.findIndex(wp) == -1){
			this.selectedWaypointList.push(wp);
		}
	},
	deselectWaypoint: function(wp){
		wp.deselect();
		this.selectedWaypointList.removeItem(wp);
		$(this).trigger('onDeselectWaypoint', [wp]);
	},
	deselectAllWaypoint: function(){
		while(this.selectedWaypointList.length > 0){
			this.selectedWaypointList[0].deselect();
			this.deselectWaypoint(this.selectedWaypointList[0]);
		}
	},
	setState: function(s){
		this.state = s;
	},
	activateWaypoint : function(m){
		this.activeWaypoint = m;
	},
	getNextWaypointID : function (){
		var available = false;
		var nextI = 0;
		var preC = 0;
		var c = 0;
		var ii = 1;

		if(this.waypointList.length == 0) {
			return "1";
		}

		while(!available){
			ii = 1;
			nextI++;
			nextLabel = nextI;
			var me = this;
			$.each(this.waypointList, function(I, pt){
				c = pt.label;
				if(c == nextLabel){
					available = false;
					return false;
				}
				if(ii >=  me.waypointList.length){
					available = true;
					return false;
				}
				ii++;
			});
		}
		return nextLabel.toString();
	},
	showAllWaypoint: function(){
		this.displayAllWaypoint = true;
		var i =0;
		while(i < this.waypointList.length){
			this.waypointList[i].visible = true;
			window.$wpL.find('li[wpID=' + this.waypointList[i].uid + ']').find('.toggleWaypoint').attr('src', 'images/waypoints/lightbulb.png');
			i++;
		}
	},
	hideAllWaypoint: function(){
		this.displayAllWaypoint = false;
		var i = 0;
		while(i < this.waypointList.length){
			this.waypointList[i].visible = false;
			window.$wpL.find('li[wpID=' + this.waypointList[i].uid + ']').find('.toggleWaypoint').attr('src', 'images/waypoints/lightbulb_not.png');
			i++;
		}
	},
	keydown: function(e){
		if(this.selectedWaypointList.length == 0) return false;

		switch(e.which){
			case 27: // ESC
				this.state = TWaypointControllerState.idle;
				return true;
			break;
			case 37:
			case 38:
			case 39:
			case 40:
				var delta = new TAtlasPoint(0, 0);
				if(e.keyCode == 37) delta.x = -1;
				if(e.keyCode == 38) delta.y = 1;
				if(e.keyCode == 39) delta.x = 1;
				if(e.keyCode == 40) delta.y = -1;
				var pixelSize = this.viewportController.getPixelSize();
				delta.x *= pixelSize;
				delta.y *= pixelSize;
				if(g_shiftdown) {
					delta.x *= 10;
					delta.y *= 10;
				}
				var i = 0;
				// Do the same thing with the waypoints
				while(i < this.selectedWaypointList.length){
					this.selectedWaypointList[i].moveBy(delta);
					i++;
				}
				if(this.selectedWaypointList.length > 0)
					e.preventDefault();
			break;
			case 46: // Delete Key
				this.deleteWaypoints(this.selectedWaypointList);
				return true;
			break;
		}

		$(this).trigger('onControllerKeyDown', [this, e]);

		return false;
	}
});
