TDisplayTextAnnotation = TDisplayCaption.extend({
	init: function(aM){
		this._super(aM);
	},
	draw: function(pSDCNVTR, cnv){
		if((this.viewportChanged) 
					|| (this.measChangeCount != this.measurement.changeCount)) {
			if(!this.mouseActive) this.updateBoundingBox(pSDCNVTR, cnv); 
				this.updateAnchorUsingBasePoint(pSDCNVTR, cnv);
			
		}
		this._super(pSDCNVTR, cnv);
		this.measChangeCount = this.measurement.changeCount;
		this.viewportChanged = false;
	},
	dblclick : function(e, pt, pSDConverter){		
		$('#formTextAnnotationProperty').dialog('open');	
		
	}
});
