/**

This class manages the display measurements
	It is responsible for:
	
		- Managing the list of display measurement
		- Drawing the display Measurement
		- Dealing with the mouse interaction
		
		
Typically, each TATLASViewport should have a
	TDisplayMeasurementController

**/

TDisplayMeasurementControllerState = {idle:0, 
								create:1,
								inCreation:2,
								editShape:3};

TDisplayMeasurementController = Class.extend({
	init: function(measController, pAVP){
		this.pList = new Array();
		this.pMeasurementController = measController;
		this.pATLASViewport = pAVP;
		this.mouseIsDown = false;
		this.state = TDisplayMeasurementControllerState.idle;
		this.registerEventToMeasurementController();
	},
	setState: function(aState){
		this.state = aState;	
	},
	// return the correspoding display of the activeMeasurement
	getActiveDisplayMeas: function(pMeas){
		return this.getDisplayOfMeasurement(this.pMeasurementController.activeMeasurement);
	},
	mousedown: function(e, pt, avp, handled){
		// do not do anything if the measurements are not visible.
		if (!this.pMeasurementController.showMeasurements) 
			return false;
		var pActiveMeas = null;
		this.mouseIsDown = true;
		try{
			switch(this.pMeasurementController.state){
					case  TMeasurementControllerState.create:
						this.pMeasurementController.deselectAllMeasurement();
						//Create the measurement of type
						var m = this.pMeasurementController.createMeasurementOfType(this.pMeasurementController.measurementTypeToCreate, pt, avp);
						this.pMeasurementController.addMeasurement(m);
						this.pMeasurementController.activateMeasurement(m);
						m.setState(TMeasurementState.inCreation);
						this.pMeasurementController.selectMeasurement(m);
						this.setState(TDisplayMeasurementControllerState.inCreation);
						handled.handled = true;
						e.preventDefault();
						
						if(m.type == TMeasurementType.textannotation){
							m.setState(TMeasurementState.idle);	
							$('#formTextAnnotationProperty').dialog('open');	
							$('#formTextAnnotationProperty').find('textarea').val('');
							this.pMeasurementController.setState(TMeasurementControllerState.idle);
						}						
						return false;
					break;
					case  TMeasurementControllerState.inCreation:
						pActiveMeas = this.getActiveDisplayMeas ();
						if( pActiveMeas != null) {
							pActiveMeas.mousedown(e, pt, avp);
							handled.handled = true;
						}
						else {
							this.hitTestDisplayMeasurement(pt)	
						}					
						return false;
					break;
					case TMeasurementControllerState.idle:
						pActiveMeas = this.getActiveDisplayMeas();
						if( pActiveMeas != null) {
							if (pActiveMeas.hitTest(pt, this.pATLASViewport.SDConverter)){
								pActiveMeas.mousedown(e, pt, this.pATLASViewport);
								handled.handled = true;
								return false;
							}
							else{
								this.pMeasurementController.activateMeasurement(null);
								this.pMeasurementController.deselectMeasurement(pActiveMeas.measurement);	
							}
						}
						// you clicked outside the active measurement, so it is no longer active					
						var pDMeas = this.hitTestDisplayMeasurement(pt);
						if( pDMeas != null){
							this.pMeasurementController.deselectAllMeasurement();
							this.pMeasurementController.activateMeasurement(pDMeas.measurement);
							this.pMeasurementController.selectMeasurement(pDMeas.measurement);
							pDMeas.mousedown(e, pt, this.pATLASViewport);		
							handled.handled = true;
							return false;
						}
						else {
							this.pMeasurementController.deselectAllMeasurement();
							return true;
						}					
						return true;
					break;
			}
		}
		finally{
			if(pActiveMeas != null){
				switch(pActiveMeas.measurement.state){
					case TMeasurementState.inCreation: 
						
					break;
					case TMeasurementState.moveShape: 
					case TMeasurementState.moveNode: 
					case TMeasurementState.moveCaption: 
					case TMeasurementState.moveAnchor: 
					case TMeasurementState.setFirstSegment: 
					case TMeasurementState.setAngle:
							this.state = TDisplayMeasurementControllerState.editShape;
						break;
					case TMeasurementState.idle:
							this.state = TDisplayMeasurementControllerState.idle;
					break;												
				}
			}	
		}
	},
	mousemove: function(e, pt, pSDConverter, handled){
	 if (pSDConverter == null) return false;
	 
		switch(this.state){
			case TMeasurementControllerState.idle:
				if (!this.mouseIsDown ) return null;
				if(this.getActiveDisplayMeas() != null){
					this.getActiveDisplayMeas().mousemove(e, pt, pSDConverter);
					handled.handled = true;
					return false;
				}					
				break;
				case TMeasurementControllerState.inCreation:
					if(this.getActiveDisplayMeas() != null){
						this.getActiveDisplayMeas().mousemove(e, pt, pSDConverter);
						handled.handled = true;
						return false;
					}					
				break;
		}		
		if(this.getActiveDisplayMeas() != null){
			this.getActiveDisplayMeas().mousemove(e, pt, pSDConverter);
		}	
	},
	mouseup: function(e, pt, pSDConverter, handled){		
		if (pSDConverter == null) return false;
		
		this.mouseIsDown = false;
		var actMeas = this.getActiveDisplayMeas();
		if(actMeas != null){
			actMeas.mouseup(e, pt, pSDConverter);
			handled.handled = true;
			if(actMeas.measurement.state == TMeasurementState.idle){
				this.pMeasurementController.setState(TMeasurementControllerState.idle);
			}
			else{
				this.pMeasurementController.setState(TMeasurementControllerState.inCreation);
			}
			return false;
		}		
	},
	click : function(e, pt, pSDConverter, handled){
	
	},
	dblclick: function(e, pt, pSDConverter, handled){
		if (pSDConverter == null) return false;
		
		switch(this.pMeasurementController.state){
			case  TMeasurementControllerState.inCreation:
				var actMeas = this.getActiveDisplayMeas();
				if(actMeas != null){
					actMeas.dblclick(e, pt, pSDConverter);
					this.pMeasurementController.setState(TMeasurementControllerState.idle);
					handled.handled = true;	
				}
				return true;
			break;
			case  TMeasurementControllerState.idle:
				var i = 0;
				
				if (!this.pMeasurementController.showMeasurements) 
					return false;
				
				while(i <  this.pList.length){
					if(this.pList[i].hitTest(pt, pSDConverter)){
						this.pMeasurementController.selectMeasurement(this.pList[i].measurement);
						this.pList[i].dblclick(e, pt, pSDConverter);
						handled.handled = true;
						break;
					}
					i++;
				}
			break;			
		}		
	},
	draw: function(){
		if(this.pMeasurementController.showMeasurements){
			// Draw the non-selected Measurements
			var i = 0;
			while(i < this.pList.length){
				if(!this.pList[i].measurement.selected){				
					this.pList[i].draw(this.pATLASViewport.SDConverter, this.pATLASViewport.canvas );
				}
				i++;				
			}
			// Draw the selected Measurements
			var i = 0;
			while(i < this.pList.length){
				if(this.pList[i].measurement.selected){				
					this.pList[i].draw(this.pATLASViewport.SDConverter, this.pATLASViewport.canvas );
				}
				i++;				
			}
		}	
	},
	registerEventToMeasurementController : function(){
		var me = this;	
		var dMeas = null;
		
		$(this.pMeasurementController).on('onControllerKeyDown', function(e, ctrl){
																																				
		});  
		
		$(this.pMeasurementController).on('onAddMeasurement',  function(e, newM){
			// must create the display version of the newly created measurement in the measurement controller....
			
			switch(newM.type){
				case TMeasurementType.line:
					dMeas = new TDisplayLine(newM);
				break;
				case TMeasurementType.textannotation:
					dMeas = new TDisplayTextAnnotation(newM);
				break;
				case TMeasurementType.horizontaltool:
					dMeas = new TDisplayLongMeasurement(newM);
				break;	
				case TMeasurementType.verticaltool:
					dMeas = new TDisplayLongMeasurement(newM);
				break;
				case TMeasurementType.pointtopoint:
					dMeas = new TDisplaySimpleMeasurement(newM);	
				break;
				case TMeasurementType.protractor:
					dMeas = new TDisplayProtractor(newM);
				break;
				case TMeasurementType.ruler:
					dMeas = new TDisplayRuler(newM);
				break;
				case TMeasurementType.rectangulararea:
					dMeas = new TDisplayRectangularArea(newM);
				break;
				case TMeasurementType.ellipticalarea:
					dMeas = new TDisplayEllipticalArea(newM);
				break;
				case TMeasurementType.exporttopng:
					dMeas = new TDisplayExportToPNG(newM);
				break;
				case TMeasurementType.rectangleRegion:
					dMeas = new TDisplayRectangularArea(newM);
				break;
				case TMeasurementType.ellipseRegion:
					dMeas = new TDisplayEllipticalArea(newM);
				break;
				case TMeasurementType.polygonRegion:
					dMeas = new TDisplayPolygonalArea(newM);
				break;
				case TMeasurementType.polygonalArea:
					dMeas = new TDisplayPolygonalArea(newM);
				break;
			}
			me.pList.push(dMeas);
		});
		
		$(this.pMeasurementController).on('onSetMeasurementToCreate',  function(e, mType){
			me.state = TATLASViewportState.createMeasurement;
			me.measurementTypeToCreate = mType;		
			me.pMeasurementController.activateMeasurement(null);
		});
		
		$(this.pMeasurementController).on('onDeleteMeasurement',  function(e, m){
			var dm = me.getDisplayOfMeasurement(m);
			me.deleteDisplayMeasurement(dm);
		});		
	},
	getCursor: function(aPt, pSDConverter,  handled){
		if (!this.pMeasurementController.showMeasurements) 
			return false;
		
		var i = 0;
		while (i < this.pList.length){
			if(this.pList[i].hitTest(aPt, pSDConverter)){
				handled.handled = true;
				return this.pList[i].getCursor(aPt, pSDConverter);	
			}
			i++;
		}
	},
	getDisplayOfMeasurement: function(M){
		if (M == null) return null;
		
		var  i = 0;
		while(i < this.pList.length){
			if(this.pList[i].measurement.uid == M.uid){
				return this.pList[i];
			}
			i++;
		}
	},
	deleteDisplayMeasurement: function(dm){
		this.pList.removeItem(dm);
	},
	resetDisplayViewportChange:function(){
		var i = 0;
		while(i < this.pList.length){
			this.pList[i].resetViewportChanged();
			i++;
		}
		i = 0;		
	},
	// return the measurement that had a positive hittest
	hitTestDisplayMeasurement: function(pt){
		if (!this.pMeasurementController.showMeasurements)
			return false;
		
		var pListOfMeasAt = new Array();
		// first get all the display measurement at the requested position.
		var  i = 0;
		while(i < this.pList.length){
			if(this.pList[i].hitTest(pt, this.pATLASViewport.SDConverter)){
				pListOfMeasAt.push(this.pList[i]);
			}
			i++;
		}	
		
		if (pListOfMeasAt.length == 0) 
			return null;
		if(pListOfMeasAt.length == 1) 
			return pListOfMeasAt[0];
			
		
		// then check which on is the smallest one (comparing areas)
		var i = 0;
		var minArea = 1E9;
		smallerInd = 0;
		while(i < pListOfMeasAt.length){
			if(pListOfMeasAt[i].measurement.getArea() < minArea){
				minArea = pListOfMeasAt[i].measurement.getArea();
				smallerInd = i;
			}
			i++;
		}
		return pListOfMeasAt[smallerInd];
	}
});  