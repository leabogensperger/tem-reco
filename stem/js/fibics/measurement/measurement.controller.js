TLongMeasurementType = {
	horizontal:0,
	vertical:1
}

TMeasurementControllerState = {idle:0,
								create:1,
								inCreation:2};

var G_MAX_MEASUREMENTS_COUNT = 80;

TMeasurementController =  TBaseController.extend({
	init: function(VPController){
		this._super();
		this.measurementList = new Array();
		this.ATLASViewportController = VPController;
		this.activeMeasurement = null;
		this.measurementTypeToCreate = null;
		this.serializer = new TMeasurementSerializer(this);
		this.showMeasurements = true;
		this.registeredType = new Array();
		this.selectedMeasurementList = new Array();
		var me = this;
		this.state = TMeasurementControllerState.idle;
		loadCSS('css/measurement.css');
	},
	shutDown: function(){
		this._super();
		//this.$textAnnotationForm.shutDown();
	},
	setShowMeasurements: function (f){
		this.showMeasurements = f;
		incDisplayChangeCount();
		$(this).trigger('onSetShowMeasurements', [this]);
	},
	addMeasurement: function(aM){
		if(this.measurementList.length == G_MAX_MEASUREMENTS_COUNT){
			console.log('Cannot add measurement since the maximum number of measurement was reached.');
			return false;
		}
		this.measurementList.push(aM);
		$(this).trigger('onAddMeasurement', [aM]);
		incDisplayChangeCount();
	},
	/// refire the onAddMeasurement Event for all the existing measurement.
	fireAddMeasurement: function(){
		for(var i = 0 ; i < this.measurementList.length; i++){
			$(this).trigger('onDeleteMeasurement', [this.measurementList[i], this]);
		}
		for(var i = 0 ; i < this.measurementList.length; i++){
			$(this).trigger('onAddMeasurement', [this.measurementList[i]]);
		}
	},
	deleteMeasurement: function(aM){
		$(this).trigger('onDeleteMeasurement', [aM, this]);
		this.selectedMeasurementList.removeItem(aM);
		this.measurementList.removeItem(aM);
		this.activeMeasurement = null;
		incDisplayChangeCount();
	},
	deleteAllMeasurement: function(){
		while(this.measurementList.length != 0){
			this.deleteMeasurement(this.measurementList[0]);
		}
	},
	setState : function(s){
		this.state = s;
		switch(this.state){
			case TMeasurementControllerState.create:
				if(this.measurementList.length == G_MAX_MEASUREMENTS_COUNT){
					var msg = _e('cannotaddmeasurementsincemaximumhasbeenreached');
					if (msg != null){
						msg = msg.replace('%MAX_ANNOTATIONS%', G_MAX_MEASUREMENTS_COUNT);
					}
					jAlert(msg);
					this.state = TMeasurementState.idle;
				}
				this.setShowMeasurements(true);
			break;
		}
		var i = 0;
		if( this.state == TMeasurementControllerState.idle){
			while( i < this.measurementList.length){
				this.measurementList[i].state = TMeasurementState.idle;
				i++;
			}
		}
		$(this).trigger('onChangeState', [this]);
	},
	selectMeasurement : function(m){
		m.select();
		if(this.selectedMeasurementList.findIndex(m) == -1){
			this.selectedMeasurementList.push(m);
		}
		$(this).trigger('onMeasurementSelect', [m]);
	},
	deselectMeasurement: function(m){
		m.deselect();
		$(this).trigger('onMeasurementDeselect', [m]);
		this.selectedMeasurementList.removeItem(m);
	},
	deselectAllMeasurement: function(){
		while(this.selectedMeasurementList.length > 0){
			this.deselectMeasurement(this.selectedMeasurementList[0]);
		}
	},
	// DEBUG
	createFakeMeasurement : function(){
		var p1 = new TAtlasPoint(100, 5);
		var p2 = new TAtlasPoint(50, -1);
		var l1 = new TLine(p1, p2);
		this.addMeasurement(l1);
	},
	setMeasurementToCreate: function(mt){
		this.measurementTypeToCreate = mt;
		this.setState(TMeasurementControllerState.create);
		$(this).trigger('onSetMeasurementToCreate', this.measurementTypeToCreate, [this]);
	},
	createMeasurementOfType: function(aType, ptpx, avp){
		var ptW = avp.micronFromPixel(ptpx);

		switch(aType){
			case TMeasurementType.line:
				return new TLine(ptW, ptW);
			break;
			case TMeasurementType.textannotation:
				return new TTextAnnotation('', ptW);
			break;
			case TMeasurementType.pointtopoint:
				return new TSimpleMeasurement(ptW, ptW);
			break;
			case TMeasurementType.horizontaltool:
				return new TLongMeasurement(ptW, ptW,TLongMeasurementType.horizontal);
			break;
			case TMeasurementType.verticaltool:
				return new TLongMeasurement(ptW, ptW,TLongMeasurementType.vertical);
			break;
			case TMeasurementType.ruler:
				return new TRuler(ptW, ptW);
			break;
			case TMeasurementType.protractor:
				return new TProtractor(ptW.x, ptW.y);
			break;
			case TMeasurementType.rectangulararea:
				return new TRectangularArea(ptW.x, ptW.y, 0, 0);
			break;
			case TMeasurementType.exporttopng:
				return new TExportToPNG(ptW.x, ptW.y, 0, 0);
			break;
			case TMeasurementType.ellipticalarea:
				return new TEllipticalArea(ptW.x, ptW.y, 0, 0);
			break;
			case TMeasurementType.rectangleRegion:
				var m = new TRectangleRegion(ptW.x, ptW.y, 0, 0);
				return m;
			break;
			case TMeasurementType.polygonRegion:
				var m = new TPolygonRegion();
				// add twice the same point
				m.addPoint(ptW);
				m.addPoint(ptW);
				return m;
			break;
			case TMeasurementType.polygonalArea:
				var m = new TPolygonalArea();
				// add twice the same point
				m.addPoint(ptW);
				m.addPoint(ptW);
				return m;
			break;
			case TMeasurementType.ellipseRegion:
				var	m = new TEllipseRegion(ptW.x, ptW.y, 0, 0);
				return m;
			break;
		}
		throw 'The measurement type provided in not valid or unknown (' + aType + ')';
	},
	registerMeasurementType : function(){
		this.registeredType.push(TLine);
		this.registeredType.push(TCaption);
	},
	getMeasurementLenghtForm: function(APController){

	},
	initUI: function(pAppsCTRL){
			this.$textAnnotationForm = new TEditTextAnnotationForm(pAppsCTRL);
	},
	activateMeasurement : function(m){
		this.activeMeasurement = m;
	},
	getMeasurementWithID: function(aID){
		var i = 0;
		while(i < this.measurementList.length){
			if(this.measurementList[i].uid == aID){
				return this.measurementList[i];
			}
			i++;
		}
		return null;
	},

	keydown: function(e){
		switch(e.which){
			case 27:
				if(this.state != TMeasurementControllerState.idle){
					this.state = TMeasurementControllerState.idle;
					return true;
				}
			break;
			case 37:
			case 38:
			case 39:
			case 40:
				if(this.activeMeasurement == undefined) return false;
				var delta = new TAtlasPoint(0, 0);
				if(e.keyCode == 37) delta.x = -1;
				if(e.keyCode == 38) delta.y = 1;
				if(e.keyCode == 39) delta.x = 1;
				if(e.keyCode == 40) delta.y = -1;
				var pixelSize = this.ATLASViewportController.getPixelSize();
				delta.x *= pixelSize;
				delta.y *= pixelSize;
				if(g_shiftdown) {
					delta.x *= 10;
					delta.y *= 10;
				}
				var i = 0;
				// Do the same thing with the waypoints
				while(i < this.selectedMeasurementList.length){
					this.selectedMeasurementList[i].moveBy(delta);
					i++;
				}
				if(this.selectedMeasurementList.length > 0) e.preventDefault();
			break;
			case 46: // Delete Key
				if(this.activeMeasurement == undefined) return false;
				e.preventDefault();
				this.deleteMeasurement(this.activeMeasurement);
			break;
		}
		$(this).trigger('onControllerKeyDown', [this]);
		return false;
	}
});
