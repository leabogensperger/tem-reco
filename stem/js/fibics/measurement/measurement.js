/*



*/

var TMeasurementState = {idle:0,
													inCreation:1,
													moveShape:2,
													moveNode:3,
													moveCaption:4 ,
													moveAnchor:5,
													setFirstSegment:50,
													setAngle:51};


var TAnchorPosition = {topLeft:0, topRight:1, bottomRight:2, bottomLeft:3};

var TMeasurementType = {none:-1,
						textannotation:1,
						horizontaltool:2,
						verticaltool:3,
						pointtopoint:4,
						protractor:5,
						ruler:6,
						rectangulararea:7,
						ellipticalarea:8,
						exporttopng:9,
						line:10,
						rectangleRegion:11,
						ellipseRegion:12,
						polygonRegion:13,
						polygonalArea:14};

var TMeasurement = TChangeCounted.extend({
	init: function(){
		this._super();
		this.state = TMeasurementState.idle;
		this.type = TMeasurementType.none;
		this.mouseDownRegistered = false;
		this.initVar();
		this.activeAnchor = -1;
		this.activeNode = -1;
	},
	initVar: function(){
		this.id = g_measurementCount++;
		this.uid = guid();
		this.selected = false;
		this.isVisible = true;
		this.lineColor = g_lineColor;
		this.outlineColor = g_outlineColor;
		this.lineThickness = g_lineThickness;
		this.mouseDownPointUm = new Seadragon.Point(0, 0);
		this.fillOpacity = g_fillOpacity;
		this.locked = false;
	},
	setLocked: function(bL){
		this.locked = bL;
		this.incChangeCount();
	},
	getLineColor: function(){
		return g_lineColor;
	},
	getOutlineColor: function(){
		return g_outlineColor;
	},
	getLineThickness: function(){
		return g_lineThickness;
	},
	getFillOpacity: function(){
		return g_fillOpacity;
	},
	select: function(){
		this.selected = true;
		this.incChangeCount();
	},
	deselect : function(){
		this.selected = false;
	},
	setState: function(s){
		this.state = s;
		if (this.state == TMeasurementState.idle){
			this.activeAnchor = -1;
			this.activeNode = -1;
		}
	},
	getFillColor: function(){
		//return new argbcolor();
	},
	getArea: function(){
		return 0;
	},
	toXML: function($n){
		newXMLNode('State').appendTo($n).html(this.state);
		newXMLNode('Type').appendTo($n).html(this.type);
		newXMLNode('UID').appendTo($n).html(this.uid);
		newXMLNode('Id').appendTo($n).html(this.id);
		newXMLNode('Selected').appendTo($n).html(this.selected);
		newXMLNode('LineColor').appendTo($n).html(this.lineColor);
		newXMLNode('OutlineColor').appendTo($n).html(this.outlineColor);
		newXMLNode('LineThickness').appendTo($n).html(this.lineThickness);
		newXMLNode('FillOpacity').appendTo($n).html(this.fillOpacity);
		newXMLNode('Visible').appendTo($n).html(this.isVisible);
		newXMLNode('Locked').appendTo($n).html(this.locked);
	},
	fromXML: function($n){
		var mtype = this.className; var cnode = "FAIL";
		if (mtype == "TCaption") {
			cnode = _safeDefault($n.context.getElementsByTagName('caption')[0],"FAIL");
		}
		/* //testcode for XML tags conversion
		if (cnode == 'FAIL') {
			G_APPLICATION_CTRL.fails = _safeDefault(G_APPLICATION_CTRL.fails,[]);
			G_APPLICATION_CTRL.fails.push($n.context.getElementsByTagName('caption')[0]);
			G_APPLICATION_CTRL.failsp = _safeDefault(G_APPLICATION_CTRL.failsp,[]);
			G_APPLICATION_CTRL.failsp.push($n);
		} else {
			G_APPLICATION_CTRL.passes = _safeDefault(G_APPLICATION_CTRL.passes,[]);
			G_APPLICATION_CTRL.passes.push($n);
		}
		*/
		if (cnode != 'FAIL') {
			this.state  = cnode.getElementsByTagName("State")[0].innerHTML;
			this.type  = parseInt(cnode.getElementsByTagName('Type')[0].innerHTML,10);
			this.uid = cnode.getElementsByTagName("UID")[0].innerHTML;
			this.id = cnode.getElementsByTagName("Id")[0].innerHTML;
			this.selected = cnode.getElementsByTagName("Selected")[0].innerHTML.toLowerCase() == 'true';
			this.lineColor = cnode.getElementsByTagName("LineColor")[0].innerHTML;
			this.outlineColor = cnode.getElementsByTagName("OutlineColor")[0].innerHTML;
			this.lineThickness = cnode.getElementsByTagName("LineThickness")[0].innerHTML;
			this.fillOpacity = cnode.getElementsByTagName("FillOpacity")[0].innerHTML;
			this.isVisible = _safeDefault(cnode.getElementsByTagName("Visible")[0].innerHTML.toLowerCase(),'true') == 'true';
			this.locked = cnode.getElementsByTagName("Locked")[0].innerHTML.toLowerCase() == 'true';
		} else {
			this.state  = _safeNumParse($n.children('State').text(),0);
			this.type  = parseInt($n.children('Type').text(),10);
			this.uid = _safeNumParse($n.children('UID').text(),guid());
			this.id = _safeNumParse($n.children('Id').text(),guid());
			this.selected = $n.children('Selected').text() == 'true';
			this.lineColor = _safeDefault($n.children('LineColor').text(),g_lineColor);
			this.outlineColor = _safeDefault($n.children('OutlineColor').text(),g_outlineColor);
			this.lineThickness = _safeNumParse($n.children('LineThickness').text(),g_lineThickness);
			this.fillOpacity = _safeFloatParse($n.children('FillOpacity').text(),g_fillOpacity);
			this.isVisible = _safeDefault($n.children('Visible').text(),'true') == 'true';
			this.locked = $n.children('Locked').text() == 'true';
		}
	},
	isRegion: function(){
		return false;
	},
	packInfo: function(obj){
		if(obj == undefined)
			var obj = new Object();
		obj.state = this.state;
		//obj.id = this.id;
		obj.uid = this.uid;
		obj.type = this.type;
		obj.selected = this.selected;
		obj.lineColor = this.lineColor;
		obj.outlineColor = this.outlineColor;
		obj.lineThickness = this.lineThickness;
		obj.fillOpacity  = this.fillOpacity;
		obj.isVisible = this.isVisible;
		obj.mClass = this.className;
		obj.locked = this.locked;
		return obj;
	},
	fromJSON: function(obj){
		if(obj == undefined){
			throw 'Invalid object passed to fromJSON function.';
			return false;
		}

		this.uid = obj.uid;
		this.type = obj.type;
		this.locked = obj.locked;
		this.selected = obj.selected;
		this.lineColor = obj.lineColor;
		this.outlineColor = obj.outlineColor;
		this.lineThickness = obj.lineThickness;
		this.fillOpacity = obj.fillOpacity;
		this.isVisible = obj.isVisible;
	},
	toJSON: function(){
		obj = new Object();
		return this.packInfo(obj);
	}
});

//Global Display Variable
var g_measurementCount = 0;
var g_fontSize = 12;
var g_fontFamily = 'Arial';
var g_drawTextSolidBackground = true;
var g_textOutlineColor = '#000000';
var g_textColor = '#000000';
var g_textAnnotationLimit = 200;
var g_lineThickness = 1;
var g_lineColor = '#00FF00';
var g_outlineColor = '#000000';
var g_showCallOutTail = false;
var g_showAngle = true;
var g_defaultEndBarLength = 10;
var g_fillOpacity = 0.10;									// 0 to 1
var g_exportToPNGColor = '#0000FF';
var g_maxExportImageSize = 2000;
var g_nodeStrokeColor = '#990000';
var g_nodeFillColor = '#ff0000';


/// Load all the related scripts

$(document).ready(function(){
	var measPath =  'js/fibics/measurement/';
	//$.getScript(measPath + "region.rectangle.js");

});
