// JavaScript Document

function rect(top, left, width, height){
	this.x = top;
	this.y = left;
	this.width = width;
	this.height = height;
	this.getArea = function(){
		return this.width * this.height;
	};
	this.hasOverlap = function(R){
		var xCond = false;
		var yCond = false;
		
		xCond = xCond || ((this.x >= R.x)	&& (this.x <= (R.x + R.width)));
		xCond = xCond || (((this.x + this.width) >= R.x)	&& ((this.x + this.width) <= (R.x + R.width)));		
		xCond = xCond || ((R.x >= this.x)	&& (R.x <= (this.x + this.width)));
		xCond = xCond || (((R.x + R.width) >= this.x)	&& ((R.x + R.width) <= (this.x + this.width)));
		
		yCond = yCond || ((this.y >= R.y)	&& (this.y <= (R.y + R.height)));
		yCond = yCond || (((this.y + this.height) >= R.y)	&& ((this.y + this.height) <= (R.y + R.height)));
		yCond = yCond || ((R.y >= this.y)	&& (R.y <= (this.y + this.height)));
		yCond = yCond || (((R.y + R.height) >= this.y)	&& ((R.y + R.height) <= (this.y + this.height)));
		
		return xCond && yCond;
		
	};
	this.hitTest = function(pt){
		if((pt.x >= this.x)
				&& (pt.x <= (this.x + this.width))
				&& (pt.y >= this.y)
				&& (pt.y <= (this.y + this.height)))
						return true;
		else
			return false;
	};
	this.toJSON = function(){
		var obj = new Object();
		obj.x = this.x;
		obj.y = this.y;
		obj.width = this.width;
		obj.height = this.height;
		return obj;
	};
	this.packInfo = function(obj){
		if(obj == undefined) 
			obj = new Object();
		obj.x = this.x;
		obj.y = this.y;
		obj.width = this.width;
		obj.height = this.height;
		return obj;
	};	
	this.fromJSON = function(obj){
		if(obj == undefined) 
			throw 'Cannot load an undefined JSON node.';
		this.x = obj.x;
		this.y = obj.y;
		this.width = obj.width;
		this.height = obj.height;
	};
	this.toXML = function($n){
		$("<x>" + this.x.toFixed(4) + "</x>").appendTo($n);
		$("<y>" + this.y.toFixed(4) + "</y>").appendTo($n);	
		$n.append($("<width>" + this.width.toFixed(4) + "</width>"));
		$n.append($("<height>" + this.height.toFixed(4) + "</height>"));		
	};	
	this.fromXML = function($n){	
		var xN = $n.children('x');
		if(xN != null) this.x = parseFloat(xN.text());
		var yN = $n.children('y');
		if(yN != null) this.y = parseFloat(yN.text());		
		var wN = $n.children('width');
		if(wN != null) this.width = parseFloat(wN.text());
		var hN = $n.children('height');
		if(hN != null) this.height = parseFloat(hN.text());
	};	
}

TAtlasPoint = Class.extend({
	init : function(x,y){
		this.x = x;
		this.y = y;
	},
	distanceFrom : function(pt){
		return Math.sqrt(Math.pow(pt.x - this.x, 2) + Math.pow(pt.y - this.y, 2));	
	},
	echo: function(){
		return this.x + ', ' + this.y;	
	},
	clone : function(){
		var aPt = new TAtlasPoint(this.x, this.y);
		return aPt;
	},
	toXML : function($n){			
		$("<x>" + this.x.toFixed(4) + "</x>").appendTo($n);
		$("<y>" + this.y.toFixed(4) + "</y>").appendTo($n);
		
		//$n.children(0).append($());		
	},
	fromXML : function($n){	
		var xN = $n.children('x');
		if(xN != null) this.x = parseFloat(xN.text());
		var yN = $n.children('y');
		if(yN != null) this.y = parseFloat(yN.text());		
	},
	packInfo: function(){
		var obj = new Object();
		obj.x = this.x;
		obj.y = this.y;
		return obj;
	},
	fromJSON: function(obj){
		this.x = obj.x;
		this.y = obj.y;
	}
});

function point(x, y){
	this.x = x;
	this.y = y;			
	this.distanceFrom = function (pt){
		return Math.sqrt(Math.pow(pt.x - this.x, 2) + Math.pow(pt.y - this.y, 2));	
	};
	this.echo = function(){
		return this.x + ', ' + this.y;	
	};
	this.clone = function(){
		var aPt = new TAtlasPoint(this.x, this.y);
		return aPt;
	};
	this.toJSON = function(){
		var obj = new Object();
		obj.x = this.x;
		obj.y = this.y;
		return obj;
	};
	this.toXML = function($n){		
		$("<x>" + this.x.toFixed(4) + "</x>").appendTo($n);
		$("<y>" + this.y.toFixed(4) + "</y>").appendTo($n);
		
		//$n.children(0).append($());		
	};
	this.fromXML = function(aNode){
		if(aNode.nodeName.toLowerCase() != 'point'){			
			aNode = $(aNode).children('point');		
			if(aNode == null) return false;
		}
		var xN = $(aNode).children('x');
		if(xN != null)
			this.x = parseFloat(xN.text());
		var yN = $(aNode).children('y');
		if(yN != null)
			this.y = parseFloat(yN.text());		
	};
}

var Segment = Class.extend({		
	init: function (a, b){
			this.pt = new Array();
			this.a = a;
			this.b = b;
			this.ab = new TAtlasPoint(b.x - a.x, b.y - a.y); 
	},
	packInfo : function(obj){ 
		if(obj == undefined) 
			obj = new Object();
		this._super(obj);
		try{
			obj.ax = this.a.x;
			obj.ay = this.a.y;
			obj.bx = this.b.x;
			obj.by = this.b.y;
		}
		catch(error){
			displayError(error);
		}
		return obj;
	},
	toXML : function($n){
		$a = $('<a />').appendTo($n);
		$b = $('<b />').appendTo($n);
		this.a.toXML($a);
		this.b.toXML($b);			
	},
	fromXML : function (aNode){		
		if(aNode.nodeName.toLowerCase() != 'segment'){			
			aNode = $(aNode).children('segment');		
			if(aNode == null) return false;
		}
		var aX = $(aNode).children('a').children('x');
		if(aX != null)
			this.a.x = parseFloat(aX.text());
		var aY = $(aNode).children('a').children('y');
		if(aY != null)
			this.a.y = parseFloat(aY.text());		
		var bX = $(aNode).children('b').children('x');
		if(bX != null)
			this.b.x = parseFloat(bX.text());	
		var bY = $(aNode).children('b').children('y');
		if(bY != null)
			this.b.y = parseFloat(bY.text());
	},
	length : function(){ return distance(this.a, this.b);},
	angle : function(){ return Math.atan2(this.b.y - this.a.y, this.b.x - this.a.x);},
	cross : function (c){
		return this.ab.x * (c.y-this.a.y) - this.ab.y * (c.x-this.a.x);
	},	
	setAngle : function(aA){
		l = this.length();
		this.b.x = this.a.x + (l*Math.cos(aA));
		this.b.y = this.a.y + (l*Math.sin(aA));	
	},
	center : function(){
		var c = new TAtlasPoint((this.a.x + this.b.x)/2, (this.a.y + this.b.y)/2);  
		return c;
	},
	moveBy : function(delta){
		this.a.x  += delta.x;
		this.b.x  += delta.x;
		this.a.y  += delta.y;
		this.b.y  += delta.y;
	},
	distanceFrom : function(c) {	
		var xDelta = this.b.x - this.a.x;
		var yDelta = this.b.y - this.a.y;
		if ((xDelta < 0.01) || (yDelta < 0.01)) {
			// if vertical
			if(xDelta < 0.01){
				if((Math.abs(c.x - this.b.x) < 10 )
							&& ((c.y < Math.max(this.b.y, this.a.y)) 
											&& (c.y > Math.min(this.b.y, this.a.y)))){
						return 	Math.abs(c.x - this.b.x);
				}
			}
			// Horizontal Line
			else if(yDelta < 0.01){
				if((Math.abs(c.y - this.b.y) < 10 )
							&& ((c.x < Math.max(this.b.x, this.a.x)) 
											&& (c.x > Math.min(this.b.x, this.a.x)))){
						return 	Math.abs(c.y - this.b.y);
				}
			}
	}
	var u = ((c.x - this.a.x) * xDelta + (c.y - this.a.y) * yDelta) / (xDelta * xDelta + yDelta * yDelta);
		
	if (u <0) {
		closestPoint = new TAtlasPoint(this.a.x, this.a.y);
	} 
	else if (u> 1) {
		 closestPoint = new TAtlasPoint(this.b.x, this.b.y);
	} 
	else {
		closestPoint = new TAtlasPoint(this.a.x + u * xDelta, this.a.y + u * yDelta);
	}
	return closestPoint.distanceFrom(new TAtlasPoint(c.x, c.y));
	}
});