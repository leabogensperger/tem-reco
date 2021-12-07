var g_ATLASViewCount = 0;
var g_ATLASViewDescriptionLimit = 200;

TATLASView = TChangeCounted.extend({
	init: function(cx, cy, width, height, name, description, zoomLev){
			this.dim = new TDimension(width, height);
			this.center = new Seadragon.Point(cx, cy);
			this.name = name;
			this.uid = guid();
			this.zoomLevel = zoomLev;
			this.setDescription(description);	
	},
	setDescription:function (aDesc){
		if((aDesc == null) || (aDesc == undefined)){
			this.description = aDesc;
		}
		else if(g_ATLASViewDescriptionLimit < aDesc.length){
			this.description = aDesc.substring(0, g_ATLASViewDescriptionLimit);
		}
		else
			this.description = aDesc;
	},
	setName: function(aName){
		this.name = aName;	
	},
	setCenter: function(c){
		this.center.x = c.x;
		this.center.y = c.y;
		this.incChangeCount();
	},
	setDim: function(d){
		this.dim.width = d.width;
		this.dim.height = d.height;
		this.incChangeCount();
	},
	// return top left base rectangle, in microns.
	getBounds: function(){ 
		var r = new Seadragon.Rect(this.center.x - this.dim.width/2,  this.center.y +  (this.dim.height/2), this.dim.width, this.dim.height);
		return r;
	},
	fromJSON: function(aJSON){
		this.center.x = aJSON.x;
		this.center.y = aJSON.y;
		this.name = aJSON.name;
		this.dim.width = aJSON.width;
		this.dim.height = aJSON.height;
		this.description = aJSON.description;
		this.zoomLevel = aJSON.zoomLevel;
		this.uid = aJSON.uid;
	},
	toJSON : function(){
		var aJSON = new Object();
		aJSON.uid = this.uid;
		aJSON.x = this.center.x;
		aJSON.y = this.center.y;
		aJSON.width = this.dim.width;
		aJSON.height = this.dim.height;
		aJSON.name = this.name;
		aJSON.zoomLevel = this.zoomLevel;
		aJSON.description = this.description;	
		return aJSON;
	},
	toXML:function($n){		
		newXMLNode("Uid").html(this.uid).appendTo($n);
		newXMLNode("X").html(this.center.x).appendTo($n);
		newXMLNode("Y").html(this.center.y).appendTo($n);
		newXMLNode("Width").html(this.dim.width).appendTo($n);
		newXMLNode("Height").html(this.dim.height).appendTo($n);
		newXMLNode("ZoomLevel").html(this.zoomLevel).appendTo($n);
		if(this.name != '')
			newXMLNode("Name").html(this.name).appendTo($n);
		if(this.description != '')
			newXMLNode("Description").html(this.description).appendTo($n);
	},
	fromXML: function($n){		
		var uidN = $n.children('Uid');
		if(uidN != null) this.uid = uidN.text();
		var xN = $n.children('X');
		if(xN != null) this.center.x = parseFloat(xN.text());
		var yN = $n.children('Y');
		if(yN != null) this.center.y = parseFloat(yN.text());
		var wN = $n.children('Width');
		if(wN != null) this.dim.width = parseFloat(wN.text());
		var hN = $n.children('Height');
		if(hN != null) this.dim.height = parseFloat(hN.text());
		var zlN = $n.children('ZoomLevel');
		if(zlN != null) this.zoomLevel = parseFloat(zlN.text());
		var nN = $n.children('Name');
		if(nN != null) this.name = nN.text();
		var dN = $n.children('Description');
		if(dN != null) this.description = dN.text();			
	}
});