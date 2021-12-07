TOverviewWidget = Class.extend({
	init: function(pAppCTRL){
		this.pAppCTRL = pAppCTRL;
		this.buildHTML();
		this.pAppCTRL.ATLASViewportController.$e.append(this.$e);		
		loadCSS('css/widget.overview.css');	
		this.browserSourceDim = new Seadragon.Rect(0,0,0,0);
		var me = this;
		$(this.pAppCTRL.ATLASViewportController).on('onChange', function(e, AVP){
			me.updateBrowser();			
		});
		
		this.currentVPBrowserDim = new Seadragon.Point(0,0);
		this.registeredVPCenter = new Seadragon.Point(0,0);
		this.maxDim = 80;
		this.registeredMouseDownPt = new Seadragon.Point(0,0);
		this.previousMousePos = new Seadragon.Point(0,0);
		this.mouseDownOnVPDim = false;
		this.fullImageBrowserDim = new Seadragon.Point(0,0);
		this.currentVPBrowserCenter = new Seadragon.Point(0,0);
		this.addEvents();
	},
	shutDown: function(){
		$(this.pAppCTRL).off('onFinalizeLoad');
		$('body').off('mouseup');
		this.$e.remove();
	},
	buildHTML : function(){
		var me = this;
		this.$e = $('<div></div>').attr('id', 'browser');		
		this.$sourceBox = $('<div></div>').attr('id','sourceBox');
		this.$e.append(this.$sourceBox);
		this.$vpBox = $('<div></div>').attr('id','browserVPDim');
		this.$sourceBox.append(this.$vpBox);
		this.$closeX = $('<div>').html('x').attr({'id':'closeBrowserOverview'}).appendTo(this.$e);
		this.$closeX.click(function(e){
			me.shutDown();														
		});
	},
	updateBrowser: function(){
		if(this.pAppCTRL.ATLASViewportController.ATLASViewportList.length == 0) return false;
		pAVP = this.pAppCTRL.ATLASViewportController.ATLASViewportList[0];
		var sourceRatio = pAVP.$e.width()/pAVP.$e.height();
		
		this.$e.css('right', '0px');
		this.$e.css('width', (this.maxDim + 20) + 'px');
		this.$e.css('height', (this.maxDim + 20) + 'px');
		
		var vpBounds = pAVP.sdViewer.viewport.getBounds(true);
		
  		var vpBHeight = this.maxDim * vpBounds.getSize().y;
			var	vpBWidth = this.maxDim * vpBounds.getSize().x;					
			// Get the viewport center
			var vpCenter = pAVP.sdViewer.viewport.getCenter();					
			var vpXOffset = ((this.$sourceBox.width()) * vpCenter.x) - (this.$vpBox.width()/2);
			var vpYOffset = (this.$sourceBox.height() * (vpCenter.y*pAVP.sdViewer.source.aspectRatio)) - (this.$vpBox.height()/2);		
			
			if((vpBHeight >= (this.maxDim *1.5)) ||(vpBWidth >= (this.maxDim*1.5))){
				if(!this.$vpBox.hasClass('oversizedViewBrowser')){
				
				}
			}
			else{
				//$('#OVBImg').remove();
				this.$vpBox.removeClass('oversizedViewBrowser');
			}			
		//}		
		this.$vpBox.css('width', vpBWidth + 'px');
		this.$vpBox.css('height', vpBHeight + 'px');
		this.$vpBox.css('left', vpXOffset  + 'px');
		this.$vpBox.css('top', vpYOffset + 'px');		
		
	},
	addEvents : function(){
		var me = this;		
		
		$(this.pAppCTRL).on('onFinalizeLoad', function(){			
			var pC = me.pAppCTRL.project.getLargestExtendChannel();
			var pAVP = me.pAppCTRL.ATLASViewportController.ATLASViewportList[0];
			if(pC == null) return false;
			
			var sourceRatio = pC.pSynchInfo.size.width/pC.pSynchInfo.size.height;
			if(sourceRatio >= 1){
				me.browserSourceDim.x = me.maxDim - 10;
				me.browserSourceDim.y = (me.maxDim/sourceRatio) - 10;				
			}
			else if(sourceRatio < 1){
				me.browserSourceDim.y = me.maxDim - 10;
				me.browserSourceDim.x = (me.maxDim*sourceRatio) - 10;				
			}
			var imgUrl = pAVP.sdViewer.source.getTileUrl(9, 0, 0);
			me.$sourceBox.css({'width': Math.round(me.browserSourceDim.x) + 'px',
												'height': Math.round(me.browserSourceDim.y) + 'px',
												'top': (me.maxDim - me.browserSourceDim.y)/2 + 'px',
												'left': (me.maxDim - me.browserSourceDim.x)/2 + 'px',
												'background-image':'url(' + imgUrl + ')'});			
			
		});
		
		
		this.$vpBox.on(TouchMouseEvent.DOWN, function(b){
			if(b.which == 1){ // left Button
				me.mouseDownOnVPDim = true;
				me.currentVPBrowserDim.x = me.$e.find('#browserVPDim').width();
				me.currentVPBrowserDim.y = me.$e.find('#browserVPDim').height();
				me.registeredVPCenter.x = me.$e.find('#browserVPDim').position().left + (me.currentVPBrowserDim.x/2);
				me.registeredVPCenter.y = me.$e.find('#browserVPDim').position().top + (me.currentVPBrowserDim.y/2);			
				me.registeredMouseDownPt.x = b.clientX;
				me.registeredMouseDownPt.y = b.clientY;
			}
		});
		
		this.$vpBox[0].onselectstart = function () { return false; };		
		this.$vpBox.on(TouchMouseEvent.DOWN, function(){  // former click
			me.mouseDownOnVPDim = false;
		});		
		$('body').mouseup(function(){
			me.mouseDownOnVPDim = false;
		});
		
		this.$e.mousemove(function(b){
			if((me.mouseDownOnVPDim)){
				if((me.previousMousePos.x == b.screenX) && (me.previousMousePos.y == b.screenY)) 
					return false;
				
				me.fullImageBrowserDim.x = me.$e.find('#sourceBox').width();
				me.fullImageBrowserDim.y = me.$e.find('#sourceBox').height();
				me.currentVPBrowserDim.x = me.$e.find('#browserVPDim').width();
				me.currentVPBrowserDim.y = me.$e.find('#browserVPDim').height();
				me.currentVPBrowserCenter.x = me.$e.find('#browserVPDim').position().left + (me.currentVPBrowserDim.x/2);
				me.currentVPBrowserCenter.y = me.$e.find('#browserVPDim').position().top + (me.currentVPBrowserDim.y/2);			
				
				me.$e.find('#browserVPDim').css('cursor', 'pointer');			
				var delta = new Seadragon.Point(b.clientX - me.registeredMouseDownPt.x, b.clientY - me.registeredMouseDownPt.y);
				var newBrowserVPTopLeft = new Seadragon.Point( me.registeredVPCenter.x + delta.x - (me.currentVPBrowserDim.x/2), me.registeredVPCenter.y + delta.y  - (me.currentVPBrowserDim.y/2));
  			var minPos = new Seadragon.Point( -(me.currentVPBrowserDim.x/2), - (me.currentVPBrowserDim.y/2));
				var maxPos = new Seadragon.Point( me.fullImageBrowserDim.x - (me.currentVPBrowserDim.x/2), me.fullImageBrowserDim.y - (me.currentVPBrowserDim.y/2));
				
				// Cannot go beyond half outside the full image
				newBrowserVPTopLeft.x = Math.max( minPos.x, newBrowserVPTopLeft.x);
				newBrowserVPTopLeft.y = Math.max( minPos.y, newBrowserVPTopLeft.y);
				newBrowserVPTopLeft.x = Math.min( maxPos.x, newBrowserVPTopLeft.x);
				newBrowserVPTopLeft.y = Math.min( maxPos.y, newBrowserVPTopLeft.y);						
				me.$e.find('#browserVPDim').css('top', newBrowserVPTopLeft.y);
				me.$e.find('#browserVPDim').css('left', newBrowserVPTopLeft.x);
				newCenter = new Seadragon.Point(newBrowserVPTopLeft.x + (me.currentVPBrowserDim.x/2), newBrowserVPTopLeft.y + (me.currentVPBrowserDim.y/2));
				var relPos = new Seadragon.Point(0, 0);
				relPos.x = newCenter.x/me.fullImageBrowserDim.x;
				if(me.ATLASViewport == undefined){
					me.ATLASViewport = me.pAppCTRL.ATLASViewportController.ATLASViewportList[0];
				}
				
				relPos.y = (1/me.ATLASViewport.sdViewer.source.aspectRatio)*newCenter.y/me.fullImageBrowserDim.y;
				me.pAppCTRL.ATLASViewportController.panTo(relPos);
				me.previousMousePos.x = b.screenX;
				me.previousMousePos.y = b.screenY;			
			}
		});
				
		$('#sourceBox').mouseup(function(b){			
			if(!me.mouseDownOnVPDim){
				var newBrowserVPTopLeft = new Seadragon.Point(0,0);
				var relPos = new Seadragon.Point(0,0);
				var x = b.pageX - $(this).offset().left;
				var y = b.pageY - $(this).offset().top;		
				maxX = $('#sourceBox').width();
				maxY = $('#sourceBox').height();
				minX = 0;
				minY = 0;				
				x = Math.min(maxX, Math.max(minX, x));
				y = Math.min(maxY, Math.max(minY, y));				
				newBrowserVPTopLeft.x =  x - (me.$e.find('#browserVPDim').width()/2);
				newBrowserVPTopLeft.y =  y - (me.$e.find('#browserVPDim').height()/2);				
				me.$e.find('#browserVPDim').css('top', newBrowserVPTopLeft.y);
				me.$e.find('#browserVPDim').css('left', newBrowserVPTopLeft.x);
				me.fullImageBrowserDim.x = me.$e.find('#sourceBox').width();
		    me.fullImageBrowserDim.y = me.$e.find('#sourceBox').height();		
				relPos.x = x/me.fullImageBrowserDim.x;
				if(me.ATLASViewport == undefined){
					me.ATLASViewport = me.pAppCTRL.ATLASViewportController.ATLASViewportList[0];
				}
				relPos.y = (1/me.ATLASViewport.sdViewer.source.aspectRatio)*y/me.fullImageBrowserDim.y;
				me.pAppCTRL.ATLASViewportController.panTo(relPos);	
			}
		});		
	}	
});