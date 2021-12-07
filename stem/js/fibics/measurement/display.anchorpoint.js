/*

The TAnchorPoint class is used 
	to represent a coordinates
	with a rectangle.
	
	There are two flavors: 
		Node 	- have a reference to a x,y coordinates
					- the x, y coordinates will be transformed from "World" to "Display" before being drawn
		
		Anchor - "own" the x,y coordinate and they are defined in Display Space
	
*/

var TNodeType = {anchor:0, node:1};

// Anchor never uses the refPoint
// Node always uses the refPoint

var TAnchorPoint = Class.extend({
	nodeSize : 6,
	anchorSize: 6,
	iPadNodeSize:20,
	anchorFillColor: "rgba(0, 255, 125, 0.2)",
	anchorStrokeColor : '#00FF88',
	nodeFillColor: "rgba(0,255,0,0.1)",
	nodeStrokeColor: '#00FF00',
	
	init: function(pt){	
		this.displayPt = new TAtlasPoint(pt.x, pt.y);
	},
	draw: function(pSDCNVTR, cnv){
		var ctx = cnv.getContext('2d');
	
		ctx.fillStyle = this.anchorFillColor;
		ctx.strokeStyle = this.anchorStrokeColor;
		var x = this.displayPt.x - this.getSize()/2 + 0.5;
		var y =  this.displayPt.y - this.getSize()/2 + 0.5;
		var w = this.getSize();
		ctx.lineWidth = 1;
		ctx.strokeRect(x, y, w, w);
		ctx.fillRect(x, y, w, w);		
	},
	getSize: function(){
		if(g_isMobile) return this.iPadNodeSize;
		else return this.nodeSize;
	},
	hitTest : function(pt, pSDConverter){		
		if(g_isMobile)
			var htSize = this.iPadNodeSize;
		else
			var htSize = this.anchorSize;		
		if(((this.displayPt.x - htSize/2) <= pt.x) 
			&& ((this.displayPt.x + htSize/2) >= pt.x)
			&& ((this.displayPt.y - htSize/2) <= pt.y)
			&& ((this.displayPt.y + htSize/2) >= pt.y))
				return true;		
		return false;
	},
	toXML: function(n){
		if(n.nodeName.toLowerCase() != 'anchorpoint'){
			var $n = newXMLNode('AnchorPoint');
			$n.appendTo($(n));			
		}
		else
			var $n = $(n);
		$("<Size>" + this.getSize() + "</Size>").appendTo($n);
		this.refPt.toXML($n[0]);		
	},
	loadFromXML: function(n){
		if(n == null) return false;
		if(n.nodeName.toLowerCase() != 'anchorpoint'){			
			$n = $(n).children('anchorpoint');		
			if($n == null) return false;
		}
		else
			$n = $(n);
		this.refPt.loadFromXML($n.find('point')[0]);
		
		var n = $n.children('size');
		if(n != null)
			this.getSize() = parseFloat(n.text());
	}	
});