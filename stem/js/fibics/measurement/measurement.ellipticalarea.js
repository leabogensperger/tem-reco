TEllipticalArea = TRectangularArea.extend({
	init: function(x,y,w,h){
		this._super(x,y,w,h);
	},
	initVar: function(){
		this._super();
		this.className = 'TEllipticalArea';
		this.name = _e('ellipse');
		this.type = TMeasurementType.ellipticalarea;
	},
	getArea: function(){
		return Math.PI * (this.bounds.width/2)* (this.bounds.height/2);
		//or equivalent Math.PI * this.bounds.width * this.bounds.height * .25;
	}

});
