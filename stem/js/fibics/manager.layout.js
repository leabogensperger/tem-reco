// JavaScript Document

TLayoutManager = Class.extend({		
	init: function ($parentDOME, pAppsCTRL){
		this.elements = new Array(); // should contain jQueried DOM element (wrapped by $());
		this.fillerElement = null;	 // the element that will be stretch to the remainder of the space
		this.$e = $('<div></div>').attr({'id':'LayoutManager'}).appendTo($parentDOME);
		this.$parent = $parentDOME;
		this.$e.width(this.$parent.width());
		this.$e.height(this.$parent.height());
		this.pAppsCTRL = pAppsCTRL;
		this.dockArea = new TDockArea();
		var me = this;
		$(this.dockArea).on('onToggle', function(){
			me.updateSpace();															 
		});
		$(this.dockArea).on('changeSize', function(){
			me.updateSpace();															 
		});
		this.addElement(this.dockArea.$e);
		//this.dockArea.$e.width(300);
		// make the dockArea the same height as the layout manager
		this.dockArea.resize(300, this.$e.height());
		loadCSS('css/layout.css');
	},
	addElement: function($e){
		if(this.elements.findIndex($e) > -1) return null;
		this.elements.push($e);
		this.formatElement($e);
		this.$e.append($e);
		this.updateSpace();	
	},
	resize: function(w,h){
		this.$e.width(w);
		this.$e.height(h);
		this.dockArea.resize(this.dockArea.$e.width(), h);
		// does not need to call update space here since it will be called when the dockarea will be resized.
		this.updateSpace();
		$(this).trigger('changeSize', [this]);
	},
	updateSpace: function(){
		if(this.$fillerElement != null){
			var rW = 0;
			for(var i = 0; i < this.elements.length; i++){
				if (this.elements[i].is(':visible')){
					rW += this.elements[i].outerWidth();
				}
			}
			//this.$fillerElement.outerWidth(this.$e.width() - rW);
			this.pAppsCTRL.ATLASViewportController.setDisplayDim(this.$e.width() - rW, this.$e.height());
		}	
	},
	formatElement: function($e){
		$e.addClass('LayoutElement');
	},
	setFiller: function($filler){
		this.$fillerElement = $filler;
		this.$e.append($filler);
		$filler.addClass('FillerElement');
	}
});