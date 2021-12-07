var TPanDirection = {unknown:0,
					up:1,
					down:2,
					left:3,
					right:4};

TZoomPanControls = TUIElement.extend({		
	init: function (AVController, pSSCTRL){
		this._super();
		this.ATLASViewportController = AVController;
		this.pSSCTRL = pSSCTRL;
		this.buildHTML();
		this.panStep = 0;
		this.panDelay = 100;
		this.zoomDelay = 200;
		this.panStartDelay = 100;
		this.panContinuousInterval = null;
		this.panStartTimer = null;
		this.zoomingInterval = null;
		this.zoomContinuousStarted = false;
		this.zoomRatio = 0.90;
		this.panningDirection = TPanDirection.down;
		this.ATLASViewportController.$e.append(this.$e);		
		loadCSS('css/arrowcontrol.css');	
		this.registerEvents();
	},
	shutDown: function(){
		this.$e.remove();
	},
	registerEvents:function(){
		var me = this;		
		this.$e.find('.arrowControl').on(TouchMouseEvent.DOWN, function(){			
			me.hasContinuousPanned = false;
			me.panningDirection = eval('TPanDirection.' + $(this).attr('direction'));			
			if(!me.hasContinuousPanned){
				me.stopPanning();
				var newCenter = me.ATLASViewportController.getCenter(true);
				var vpDim = me.ATLASViewportController.getBounds();
				var delta = 0;
				
				if(me.panningDirection == TPanDirection.up) {
					delta = vpDim.height/1;
					newCenter.y -= delta;
					me.ATLASViewportController.panTo(newCenter);
				}
				else if(me.panningDirection == TPanDirection.down) {
					delta = vpDim.height/1;
					newCenter.y += delta;					
					me.ATLASViewportController.panTo(newCenter);
				}
				else if(me.panningDirection == TPanDirection.left) {
					delta = vpDim.width/1;
					newCenter.x -= delta;
					newCenter.x = Math.max(0, newCenter.x);
					me.ATLASViewportController.panTo(newCenter);
				}
				else if(me.panningDirection == TPanDirection.right) {
					delta = vpDim.width/1;
					newCenter.x += delta;
					newCenter.x = Math.min(1, newCenter.x);
					me.ATLASViewportController.panTo(newCenter);
				}
				me.panStartTimer = setTimeout(function(){			
				me.startPanning();
			}, me.panStartDelay);	
			}
		});
		
		this.$e.find('.zoomControls').on(TouchMouseEvent.DOWN, function(){
			var b = $(this);
			me.hasContinuousZoomed = false;
			if(!me.hasContinuousZoomed){
				me.stopContinuousZooming();
				me.zoomContinuousTimer = setTimeout(function(){
					if(b.attr('zoom') == 'in')
						me.startContinuousZoomingIn();
					else
						me.startContinuousZoomingOut();
					me.zoomContinuousStarted = true;
				}, me.zoomStartDelay);
			}
		});
		
		this.$e.find('.zoomControls').on(TouchMouseEvent.UP,function(){		
			if(!me.zoomContinuousStarted)
				clearTimeout(me.zoomContinuousTimer);
			else me.stopContinuousZooming();			
		});
		
		this.$e.find('.zoomControls').on('click', function(){  // former click
			if(!isDefined(me.ATLASViewportController)) return false;
			if(me.hasContinouslyZoomed) {
				me.zoomContinuousStarted = false;
				me.hasContinouslyZoomed = false;
				return false;
			}
			if($(this).attr('zoom') == 'in'){		
				if(me.ATLASViewportController.getImageScale(false) < 300){
					me.ATLASViewportController.zoomBy(1.5);
					if(me.ATLASViewportController.getImageScale(false)>300)
						me.ATLASViewportController.setImageScale(300);
				}
			}
			else{			
				bb = me.ATLASViewportController.getBounds();
				if((bb.width < 1.5) || (bb.height < 1.5)){
					me.ATLASViewportController.zoomBy(1/1.5);
					if(me.ATLASViewportController.getImageScale(false)>300)
						me.ATLASViewportController.setImageScale(300);
				}
			}
		});	
		
		this.$e.find('#zoomPanToggleButton').on(TouchMouseEvent.DOWN, function(){
				me.$e.find('#allViewportControlsCTNR').stop();
				if(me.$e.find('#allViewportControlsCTNR').is(":visible")){
					me.$e.find('#zoomPanToggleButton').button( "option", "label", '&gt;' );
					me.$e.find('#allViewportControlsCTNR').animate({'left': '-150px'}, 300, function(){
						$(this).hide();																																								 
					});
				}
				else{
					me.$e.find('#allViewportControlsCTNR').show();
					me.$e.find('#allViewportControlsCTNR').animate({'left': '40px'}, 300);
					me.$e.find('#zoomPanToggleButton').button( "option", "label", '&lt;' );
				}				
		});		

		$(document).mouseup(function(){
			me.stopPanning();
			me.stopContinuousZooming();
		});
		
		this.$e.find('.arrowControl').dblclick(function(){
			return false;
		});
		
		this.$e.find('#viewportControlCTNR').on(TouchMouseEvent.DOWN, function(){
			return false;
		});
		if(this.pSSCTRL != null){
			$(this.pSSCTRL).on('onStartSlideShow', function(){
				me.hideUI();
			});
			
			$(this.pSSCTRL).on('onStopSlideShow', function(){
				me.showUI();
			});
		}		
	},
	buildHTML : function(){
		this.$e = $('<div></div>').attr('id', 'viewportControlCTNR');
		this.$allControls = $('<div></div>').attr('id', 'allViewportControlsCTNR').appendTo(this.$e);
		this.$allControls.append($('<div></div>').addClass('panArrows button arrowControl button-with-shadow panArrowDown').attr({direction:'down', id:'ab-goDown'}));
		this.$allControls.append($('<div></div>').addClass('panArrows button arrowControl button-with-shadow panArrowUp').attr({direction:'up', id:'ab-goUp'}));
		this.$allControls.append($('<div></div>').addClass('panArrows button arrowControl button-with-shadow panArrowRight').attr({direction:'right', id:'ab-goRight'}));
		this.$allControls.append($('<div></div>').addClass('panArrows button arrowControl button-with-shadow panArrowLeft').attr({direction:'left', id:'ab-goLeft'}));
		this.$allControls.append($('<div></div>').attr('id', 'zoomControlCTNR'));
		this.$allControls.find('#zoomControlCTNR').append($('<div></div>').addClass('button zoomControls button-with-shadow').attr({'id':'ab-zoomIn', 'zoom':'in'}).html('+'));
		this.$allControls.find('#zoomControlCTNR').append($('<div></div>').addClass('button zoomControls button-with-shadow').attr({'id':'ab-zoomOut', 'zoom':'out'}).html('-'));
		// add the hide tab
		this.$e.append($('<div></div>').addClass('button').attr({id:'zoomPanToggleButton'}).html('&gt;'));
		
		this.$e.find('.button').button();	
		this.$allControls.hide();		
	},
	startPanning : function(){
		if((this.ATLASViewportController == null) || (this.ATLASViewportController == undefined))
			return false;
		var me = this;		
		// Step by Xth of the FOV Widths
		this.panStep = this.ATLASViewportController.getBoundsUm().width/10000;
		this.panContinuousInterval = setInterval(function(){							
			me.hasContinuousPanned = true;		
			var newCenter = me.ATLASViewportController.getCenter(true);
			if(me.panningDirection == TPanDirection.up){
				newCenter.y -= me.panStep;
				newCenter.y = Math.max(0, newCenter.y);				
			}
			else if(me.panningDirection == TPanDirection.down){
				newCenter.y += me.panStep;
			}
			else if(me.panningDirection == TPanDirection.right){
				newCenter.x += me.panStep;
			}
			else if(me.panningDirection == TPanDirection.left){
				newCenter.x -= me.panStep;
			}
			me.ATLASViewportController.panTo(newCenter, true);
		}, me.panDelay);
	},
	stopPanning: function(){
		clearInterval(this.panContinuousInterval);
		clearTimeout(this.panStartTimer);
		this.panStep = 0;
		//g_panningDirection = TPanDirection.unknown;	
	},
	startContinuousZoomingIn :function(){		
		var me = this;
		this.stopContinuousZooming();
		this.zoomingInterval = setInterval(function(){							
			me.hasContinouslyZoomed = true;		
			if(me.ATLASViewportController.getImageScale(false) < 300){
				me.ATLASViewportController.zoomBy(1/me.zoomRatio, true);	
			}
			else me.stopContinuousZooming();
		}, me.zoomDelay);
	},	
	startContinuousZoomingOut: function (){		
		var me = this;
		this.stopContinuousZooming();
		this.zoomingInterval = setInterval(function(){							
			me.hasContinouslyZoomed = true;
			bb = me.ATLASViewportController.getBounds();
			if((bb.width < 1.5) && (bb.height < 1.5)){
				me.ATLASViewportController.zoomBy(me.zoomRatio, true);	
			}
			else
				me.stopContinuousZooming();
		}, me.zoomDelay);
	},
	stopContinuousZooming: function(){
		clearInterval(this.zoomingInterval);
		this.zoomingInterval = null;
		this.zoomContinuousStarted = false;
	}	
});

