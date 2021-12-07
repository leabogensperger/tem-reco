// JavaScript Document


TDisplayWaypointController =  TBaseController.extend({
	init: function(wpController, pAVP){
		this._super();
		this.pList = new Array();
		this.pWaypointController = wpController;
		this.pATLASViewport = pAVP;		
		this.activeWaypoint = null;
		this.registerEventToWaypointController();
		// the waypoint used when in creation mode (managed by the WP Controller)
		this.creationWaypointD = new TDisplayWaypoint(this.pWaypointController.creationWaypoint);
		this.creationWaypointD.isCreation = true;
	},
	registerEventToWaypointController:function(){
		var me = this;
		$(this.pWaypointController).on('onAddWaypoint', function(e, newWP){
			// must create the new displayWaypoint
			incDisplayChangeCount();
			var newDisplayWP = new TDisplayWaypoint(newWP);
			me.activateWaypoint(newDisplayWP);			
			me.pList.push(newDisplayWP);
		});
		$(this.pWaypointController).on('onDeleteWaypoint', function(e, WP){
			dWP = me.getDisplayOfWaypoint(WP);
			incDisplayChangeCount();
			me.pList.removeItem(dWP);		
		});
	},
	activateWaypoint: function(dWP){
		this.activeWaypoint = dWP;
		if(dWP == null)
			this.pWaypointController.activateWaypoint(null);
		else
			this.pWaypointController.activateWaypoint(dWP.waypoint);
	}, 
	// return the correspoding display of the activeMeasurement
	getActiveDisplayWaypoint: function(pMeas){
		return this.getDisplayOfWaypoint(this.pWaypointController.activeWaypoint);
	},
	getDisplayOfWaypoint: function(WP){
		if (WP == null) return null;		
		var  i = 0;
		while(i < this.pList.length){
			if(this.pList[i].waypoint.uid == WP.uid){
				return this.pList[i];
			}
			i++;
		}
	},
	deleteDisplayWaypoint: function(wp){
		this.pList.removeItem(wp);
	},
	// return the measurement that had a positive hittest
	hitTestDisplayWaypoint: function(pt){
		var  i = 0;
		while(i < this.pList.length){
			if(this.pList[i].hitTest(pt, this.pATLASViewport.SDConverter)){
				return this.pList[i];
			}
			i++;
		}	
		return null;
	},
	getCursor: function(aPt, pSDConverter, handled){
		var i = 0;
		while (i < this.pList.length){
			if(this.pList[i].hitTest(aPt, pSDConverter)){
				handled.handled = true;
				return this.pList[i].getCursor(aPt, pSDConverter);	
			}
			i++;
		}
	},
	mousedown: function(e, pt, pSDConverter, handled){
		var pActiveMeas = null;
		this._super(e, pt, pSDConverter, handled);
		umPt = pSDConverter.micronFromPixel(pt);
		switch(this.pWaypointController.state){
			case TWaypointControllerState.createWaypoint:
				this.pWaypointController.deselectAllWaypoint();
				var wp = this.pWaypointController.createWaypoint(umPt.x, umPt.y);
				this.pWaypointController.selectWaypoint(wp);
				this.creationWaypoint = wp;
				this.pWaypointController.setState(TWaypointControllerState.creatingWaypoint);
				handled.handled = true;
				return false;
			break;
			case TWaypointControllerState.idle:
				var i = 0;
				while(i <  this.pList.length){
					if(this.pList[i].hitTest(pt, pSDConverter)){
						this.activateWaypoint(this.pList[i]);
						this.pList[i].mousedown(e, pt, pSDConverter);
						if(!this.activeWaypoint.waypoint.selected){
							this.pWaypointController.deselectAllWaypoint();
							this.pWaypointController.selectWaypoint(this.activeWaypoint.waypoint);
						}
						handled.handled = true;
						this.pWaypointController.setState(TWaypointControllerState.moveWaypoint);
					}
					i++;
				}
			break;
		}
	},
	mousemove: function(e, pt, pSDConverter, handled){
		if (pSDConverter == null) return false;
		
	  this._super(e, pt, pSDConverter, handled);
		
		var umPt = pSDConverter.micronFromPixel(pt);
		if (umPt == undefined) return false;
		
		var prevUmPt = pSDConverter.micronFromPixel(this.prevMouseXY);
		var delta = new TAtlasPoint(umPt.x - prevUmPt.x , umPt.y - prevUmPt.y);
		
		switch(this.pWaypointController.state){
			case TWaypointControllerState.createWaypoint:
				this.pWaypointController.creationWaypoint.setXY(umPt.x, umPt.y);
				handled.handled = true;
			break;
			case TWaypointControllerState.creatingWaypoint:
				this.pWaypointController.creationWaypoint.setXY(umPt.x, umPt.y);
				if(this.activeWaypoint != null){
					this.activeWaypoint.waypoint.setXY(umPt.x, umPt.y);
				}
				handled.handled = true;
			break;
			case TWaypointControllerState.idle:
				if (!this.mouseIsDown ) {
					this.prevMouseXY.x = pt.x;
					this.prevMouseXY.y = pt.y;	
					return null;
				}
			break;
			case TWaypointControllerState.moveWaypoint:
				if( this.activeWaypoint != null){
					this.activeWaypoint.waypoint.moveBy(delta);
					handled.handled = true;
				}
			break;
		}
		this.prevMouseXY.x = pt.x;
		this.prevMouseXY.y = pt.y;		
		
	},
	mouseup: function(e, pt, pSDConverter, handled){		
		this.mouseIsDown = false;
		
		if( this.activeWaypoint != null){
			this.activeWaypoint.mouseup(e, pt, pSDConverter);
			handled.handled = true;
		}
		
		this.pWaypointController.setState(TWaypointControllerState.idle);
		this.pWaypointController.state = TWaypointControllerState.idle;
	},
	draw: function(){	
			// Draw the non-selected Measurements
			var i = 0;
			while(i < this.pList.length){
				if(!this.pList[i].waypoint.selected){				
					this.pList[i].draw(this.pATLASViewport.SDConverter, this.pATLASViewport.canvas);
				}
				i++;				
			}
			// Draw the selected Measurements
			var i = 0;
			while(i < this.pList.length){
				if(this.pList[i].waypoint.selected){				
					this.pList[i].draw(this.pATLASViewport.SDConverter, this.pATLASViewport.canvas);
				}
				i++;				
			}			
	},
	resetViewportUpdate: function(){
		for(var i = 0; i < this.pList.length; i++){
			this.pList[i].viewportUpdated = true;	
		}	
	}
});