TRuler = TSimpleMeasurement.extend({
	init: function(pt1, pt2){
		this._super(pt1, pt2);
		this.type = TMeasurementType.ruler;
	},
	initVar: function(){
		this._super();
		this.className = 'TRuler';
	}
});