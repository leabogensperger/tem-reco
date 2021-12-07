

var TDisplayMState = {
	idle :0,
	move:1,
	moving:2,
	movingNode:3,
	movingEdge:4,
	movingAnchor:5,
	movingCaption:6,
	inCreation:7
};

var g_lineHitTestThreshold = 5;
var G_MEASUREMENT_MIN_DISPLAY_SIZE_FOR_CAPTION = 20;


TDisplayMeasurement = Class.extend({
	init:function(oM){
		// oM is the original Measurement
		this.measurement = oM;
		this.measurement.selected = false;
		this.nodeList = new Array();
		this.mouseDownRegistered = false;
		this.pointRegistered = new Seadragon.Point(0,0);
		this.umPointRegistered = new Seadragon.Point(0,0);
		this.anchorList = new Array();
		this.measChangeCount = -1;
		this.id = g_displayMeasurementCount++;
		// this flag must be set to false after each draw.
		this.viewportChanged = false;
	},
	resetViewportChanged: function(){
		this.viewportChanged = true;
	},
	drawNodes : function(pSDConverter, cnv){
		var i = 0;
		while(i < this.nodeList.length){
			this.nodeList[i].draw(pSDConverter, cnv);
			i++;
		}
	},
	drawLines : function(ctx, pt1, pt2){		
		ctx.moveTo(pt1.x, pt1.y); 
		ctx.lineTo(pt2.x, pt2.y);
	},
	drawAnchors : function (pSDConverter, cnv){
		var i = 0;
		while(i < this.anchorList.length){
			this.anchorList[i].draw(pSDConverter, cnv);
			i++;
		}
	},
	hitTestNode: function(pt, SDConverter){
		var i = 0;
		while(i < this.nodeList.length){
			if(this.nodeList[i].hitTest(pt, SDConverter)){
				this.activeNode = i;
				return true;
			}
			i++;
		}
	},
	canDisplayCaption: function(){
		var dSize =  this.getDisplaySize();	
		return this.measurement.showCaption && ((dSize.width > G_MEASUREMENT_MIN_DISPLAY_SIZE_FOR_CAPTION) && (dSize.height > G_MEASUREMENT_MIN_DISPLAY_SIZE_FOR_CAPTION));
	},
	getDisplaySize: function(){
		return new TDimension(0,0);
	},
	drawLine : function(ctx, pt1, pt2){		
		ctx.moveTo(pt1.x, pt1.y); 
		ctx.lineTo(pt2.x, pt2.y);
		ctx.stroke();
	},
	registerPoint: function(pt, pSDConverter){
		if(pSDConverter != undefined){
			var umpt = pSDConverter.micronFromPixel(pt);
			this.measurement.mouseDownPointUm.x = umpt.x;
			this.measurement.mouseDownPointUm.y = umpt.y;			
		}
		this.pointRegistered.x = pt.x;
		this.pointRegistered.y = pt.y;
		this.measurement.mouseDownRegistered = true;
	},
	mouseup: function(e, pt, pSDConverter){
		this.measurement.setState(TMeasurementState.idle);
		this.measurement.mouseDownRegistered = false;
	},
	testPolymorphism: function(){
		console.log('Display Measurement');
	},
	select : function(){
		this.measurement.selected = true;
	
	},
	unselect : function(){
		this.measurement.selected = false;
	},
	selected: function(){
		return this.measurement.selected;
	},
	getCursor: function(pt, avp){
		return g_cursorOverShape	
	}
});

var g_displayMeasurementCount = 0;




