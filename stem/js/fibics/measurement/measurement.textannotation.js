TTextAnnotation = TCaption.extend({
	init: function(aText, pt){
		this._super(aText, pt);
		this.type = TMeasurementType.textannotation;
		this.hasCustomFontFamily = true;
	},
	initVar: function(){
		this._super();
		this.mouseDownPoint = null;
		this.className = 'TTextAnnotation';
		this.activeNode = -1;		
		this.selected = false;	
		this.type = TMeasurementType.textannotation;
		this.fontSize = g_fontSize;		
	}
});