// JavaScript Document
TDockArea = TUIElement.extend({
	init: function(){
		this._super();
		var me = this;
		this.mouseDownPos = new point(0,0);
		this.resizing = false;
		loadCSS('css/dockarea.css');
		this.$e.attr({'id':'DockArea'}).addClass('cannotSelect ui-widget-content');	
		this.$vertBar = $('<div></div>').addClass('dockVerticalBar').appendTo(this.$e);
		this.$contentCTNR =  $('<div></div>').addClass('DockAreaCTNR').appendTo(this.$e);
		this.$draggingVertBar = $('<div></div>').addClass('dockDraggingVerticalBar').appendTo(this.$e);
		this.$vertBar.mousedown(function(e){
				me.mouseDownPos.x = e.pageX;
				me.mouseDownPos.y = e.pageY;			
				me.resizing = true;
				me.$draggingVertBar.show();				
				me.$draggingVertBar.css('left', e.pageX);
		});
		$('body').mousemove(function(e){
			if(me.resizing){
				me.$draggingVertBar.css('left', e.pageX);	
			}										
		});
		$('body').mouseup(function(e){
			if(me.resizing){												 
				me.resizing = false;
				me.$draggingVertBar.hide();
				me.resize(me.$e.width() + (e.pageX - me.mouseDownPos.x), me.$e.height());
			}
		});
		this.elementList = new Array();
	},
	resize: function(w, h){
		this._super(w, h);
		this.$contentCTNR.width(w);
		this.$contentCTNR.height(h);
		
		this.$vertBar.height(this.$e.outerHeight());
		this.$draggingVertBar.height(h);
		for(var i = 0; i < this.elementList.length; i++){
			// here just change the width, left the height the same
			this.elementList[i].resize(w, this.elementList[i].$e.height()); 	
		}
		
	},
	addElement: function(UIE){
		this.elementList.push(UIE);
		this.$contentCTNR.append(UIE.$e);
		this.elementList[this.elementList.length - 1].resize(this.$e.width(), UIE.$e.height());
	}
});