// JavaScript Document
// the purpose of this object is to save and load from the Browser session the waypoints, the annotations and the ATLASView.
//

TSessionSerializer = Class.extend({
	init: function(pAppC){
		this.pAppC = pAppC;
	},
	saveToSession: function(){
		var success = this.saveWaypoint();
		success = success && (this.saveView());
		success = success && (this.saveMeasurement());
		return success;
	},
	loadFromSession: function(){
		var success = true;
		success = this.loadWaypoint();
		success = success && this.loadView();
		success = success && this.loadMeasurement();
		return success;
	},
	saveWaypoint: function(){
		var wayPtJSON = JSON.stringify(this.pAppC.waypointController.waypointList);
		try {
			this.pAppC.ioStorage.saveToProject('wayPoint', wayPtJSON);
		}
		catch(e){
			jAlert('An error occurred when saving the waypoints.<br>' + e, 'Cannot Save Waypoints');
			return false;
		}
		return true;
	},
	loadWaypoint: function(){
		wayPtJSON = this.pAppC.ioStorage.loadFromProject('wayPoint');
		var wpList = JSON.parse(wayPtJSON);
		var i = 0;

		//if successful load, clear current session
		if (typeof wpList != 'undefined') {
			if(wpList == null) return false;
			if (wpList.length > 0) {
				this.pAppC.waypointController.deleteAllWaypoint();
			}
		}

		if(wpList == null) return false;

		while(i < wpList.length){
			try{
				wp = new TWaypoint();
				wp.fromJSON(wpList[i]);
				if(this.pAppC.waypointController.getWaypointWithID(wp.uid) == null)
					this.pAppC.waypointController.addWaypoint(wp);
				i++;
			}
			catch(e){
				jAlert('An error occurred when saving the waypoints.<br>' + e, 'Cannot Save Waypoints');
				return false;
			}
		}
		return true;
	},
	saveMeasurement: function(){
		var mJSON = JSON.stringify(this.pAppC.measurementController.measurementList);
		try {
			this.pAppC.ioStorage.saveToProject('measurement', mJSON);
		}
		catch(e){
			jAlert('An error occurred when saving the measurement.<br>' + e, 'Cannot Save Measurements');
			return false;
		}
		return true;
	},
	loadMeasurement: function(){
		measurementJSON = this.pAppC.ioStorage.loadFromProject('measurement');
		var mList = JSON.parse(measurementJSON);

		//if successful load, clear current session
		if (typeof mList != 'undefined') {
			if (mList.length > 0) {
				this.pAppC.measurementController.deleteAllMeasurement();
			}
		}

		var i = 0;
		while(i < mList.length){
			try{
				m = this.createMeasurement(mList[i].mClass);
				m.fromJSON(mList[i]);
				if(this.pAppC.measurementController.getMeasurementWithID(m.uid) == null)
					this.pAppC.measurementController.addMeasurement(m);
				i++;
			}
			catch(e){
				jAlert('An error occurred when loading the measurements.<br>' + e, 'Cannot Load Measurements');
				return false;
			}
		}
		this.pAppC.measurementController.activeMeasurement = null;
		return true;
	},
	saveView: function(){
		var mJSON = JSON.stringify(this.pAppC.viewController.viewList);
		try {
			this.pAppC.ioStorage.saveToProject('view', mJSON);
		}
		catch(e){
			jAlert('An error occurred when saving the views.<br>' + e, 'Cannot Save Views');
			return false;
		}
		return true;
	},
	loadView: function(){
		var viewJSON = this.pAppC.ioStorage.loadFromProject('view');
		var vList = JSON.parse(viewJSON);

		//if successful load, clear current session
		if (typeof vList != 'undefined') {
			if (vList.length > 0) {
				this.pAppC.viewController.deleteAllView();
			}
		}

		var i = 0;
		var me = this;
		while(i < vList.length){
			try{
				var v = new TATLASView();
				v.fromJSON(vList[i]);
				if(this.pAppC.viewController.getViewWithID(v.uid) == null)
					me.pAppC.viewController.addView(v);
				i++;
			}
			catch(e){
				jAlert('An error occurred when loading the views.<br>' + e, 'Cannot Load Views');
				return false;
			}
		}
		return true;
	},
	createMeasurement: function(className){
		if (className == undefined) return null;
		else if(className == 'TLine') return new TLine( new TAtlasPoint(0,0),  new TAtlasPoint(0,0));
		else if(className == 'TLongMeasurement') return new TLongMeasurement( new TAtlasPoint(0,0),  new TAtlasPoint(0,0));
		else if(className == 'TProtractor') return new TProtractor(0,0);
		else if(className == 'TRuler') return new TRuler( new TAtlasPoint(0,0),  new TAtlasPoint(0,0));
		else if(className == 'TSimpleMeasurement') return new TSimpleMeasurement();
		else if(className == 'TRectangularArea') return new TRectangularArea(0, 0, 0, 0);
		else if(className == 'TEllipticalArea') return new TEllipticalArea(0, 0, 0, 0);
		else if(className == 'TCaption') return new TCaption('', new TAtlasPoint(0,0));
		else if(className == 'TTextAnnotation') return new TTextAnnotation('', new TAtlasPoint(0,0));
		else if(className == 'TExportToPNG') return new TExportToPNG(0, 0, 0, 0);
		else if(className == 'TPolygonRegion') return new TPolygonRegion( new TAtlasPoint(0,0));
		else if(className == 'TPolygonalArea') return new TPolygonalArea( new TAtlasPoint(0,0));
		else if(className == 'TRectangleRegion') return new TRectangleRegion(0,0,0,0);
		else if(className == 'TEllipseRegion') return new TEllipseRegion(0,0,0,0);
	},
	shutDown: function(){

	}
});
