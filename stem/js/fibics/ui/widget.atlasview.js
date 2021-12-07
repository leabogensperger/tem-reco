TViewWidgetInfo = function(aView, $aViewCTNR){
	this.aView = aView;
	this.CTNR = $aViewCTNR;
}

C_ATLAS_VIEW_PREVIEW_WIDTH = 120;

TATLASViewWidget = Class.extend({
	init: function(pAppsCTRL, parentDiv){
		this.$holder = $("<div></div>").attr('id','viewWidgetHolder');
		this.AppsCTRL = pAppsCTRL;
		this.parentDiv = parentDiv;
		this.buildHTML();
		this.shifting = false;
		this.imgGenerator = new TSeadragonImageGenerator(pAppsCTRL, null);

		this.ScrollBarDraggable = false;

		this.list = new Array();
		$(this.parentDiv).append(this.$e);
		loadCSS('css/atlasview.css');
		var me = this;

		// create the edit view form
		this.editViewForm = new TEditViewForm(this.AppsCTRL);
		this.registerEvents();
	},
	onWindowResize: function(){
		var h = $(this.parentDiv).height();
		this.$e.css('height', h);
		var offset = 15;
		$('#AtlasViewWidgetAllImageCTNR').width( (this.AppsCTRL.viewController.viewList.length * 140) - offset);
		this.$e.find('.AtlasViewBrowserButton').height(h);
		$('#AtlasViewWidgetCTNR').css('right',($('#FooterLogo').outerWidth() + offset) + "px");
		this.updateScrollbar();
	},
	onAddAtlasViewport: function(e, pAVP){
		this.imgGenerator.pSDSource = pAVP.sdViewer.source;
		this.imgGenerator.ATLASViewport = pAVP;
	},
	onAddView: function(e, aView){
		this.addViewToWidget(aView);
		this.updateScrollbar();
	},
	onDeleteView: function(e, aView){
		this.removeViewFromWidget(aView);
		this.updateScrollbar();
	},
	setWidth: function(w) {
		this.$e.css('width', w + 'px');
		this.$holder.css('width', w +'px');
	},
	registerEvents: function(){
		var me = this;

		$(this.AppsCTRL.ATLASViewportController).on('onAddATLASViewport', function(e, pAVP) {
			me.onAddAtlasViewport(e, pAVP);
		});
		$(this.AppsCTRL.viewController).on('onAddView', function(e, aView){
			me.onAddView(e, aView);
		});
		$(this.AppsCTRL.viewController).on('onDeleteView', function(e, aView){
			me.onDeleteView(e, aView);
		});
		$(window).on('resize', function(){
		 me.onWindowResize();
		});

		this.$e.on(TouchMouseEvent.DOWN, '.AtlasViewItem', function(e){
			var aView = me.AppsCTRL.viewController.getViewWithID($(this).attr('viewid'));
			if (aView != undefined)
				me.AppsCTRL.viewController.goToView(aView);
		});

		this.$e.on(TouchMouseEvent.DOWN, '.deleteViewButton', function(e){
				var aView = me.AppsCTRL.viewController.getViewWithID($(this).closest('.AtlasViewItem').attr('viewid'));
				me.AppsCTRL.viewController.deleteView(aView);
				e.preventDefault();
		});

		this.$e.on('mouseenter', '.AtlasViewItem', function(){
			var vID = parseFloat($(this).attr('viewid'));
			var v = me.AppsCTRL.viewController.getViewWithID(vID);
			if(v != null) $(this).find('.aViewName').html(v.name);
			$(this).find('.aViewName').stop().slideDown();
			$(this).find('.deleteViewButton').stop(true).show('fade', 200);
		});

		this.$e.on('mouseleave', '.AtlasViewItem', function(){
			$(this).find('.aViewName').stop().slideUp();
			$(this).find('.deleteViewButton').stop(true).hide('fade', 200);
		});

		this.$e.on('dblclick', '.AtlasViewItem', function(){
			var vID = parseFloat($(this).attr('viewid'));
			var v = me.AppsCTRL.viewController.getViewWithID(vID);
			me.editViewForm.show();
			me.editViewForm.view = v;
			me.editViewForm.populateFields(v);
		});

	},
	setSize: function(w,h){
		this.$e.css('width', w + 'px');
		this.$holder.css({'width': w +'px',
					'height': h + 'px'});
	},
	buildHTML : function(){
		this.$e = $('<div></div>').attr({'id': 'AtlasViewWidgetCTNR'});
		this.$allImgCTNR = $('<div></div>').attr({'id': 'AtlasViewWidgetAllImageCTNR'}).appendTo(this.$e);

		// add the buttons to browse
		this.$leftButton = $('<div></div>').attr({id:'leftAtlasViewBrowserButton'}).addClass('AtlasViewBrowserButton');
		this.$rightButton = $('<div></div>').attr({id:'rightAtlasViewBrowserButton'}).addClass('AtlasViewBrowserButton');
		this.$e.append(this.$leftButton);
		this.$e.append(this.$rightButton);

		var me = this;
		this.$leftButton.on(TouchMouseEvent.DOWN, function(){
			me.shiftImageRight();
		});
		this.$rightButton.on(TouchMouseEvent.DOWN, function(){
			me.shiftImageLeft();
		});

		// add the scroll bar
		this.$scrollBar = $('<div></div>').attr({'id':'ViewScrollBar'});
		this.$scroller = $('<div></div>').attr({'id':'ScrollBarScroller'});
		this.$scrollBar.append(this.$scroller);
		this.$e.append(this.$scrollBar);

		this.$e.mouseenter(function(){
			me.$leftButton.stop();
			me.$rightButton.stop();
			me.$scrollBar.stop();
			me.$leftButton.show('slideright');
			me.$rightButton.show('slideleft');
			me.$scrollBar.show({
				effect:'fade',
				complete:function(){me.$scrollBar.css('opacity', '1');}
			});
		});

		this.$e.mouseleave(function(){
			me.$leftButton.stop();
			me.$rightButton.stop();
			me.$scrollBar.stop();
			me.$leftButton.hide('slideleft');
			me.$rightButton.hide('slideright');
			me.$scrollBar.hide('fade');
		});
	},
	updateScrollbar: function(){
		//old
		//var r = this.$e.width()/this.$allImgCTNR.width(); r = Math.min(1, r);
		var r = this.$allImgCTNR.width()/this.$e.width(); r = Math.min(0.3, r);
		var newwidth = Math.round(this.$scrollBar.width() * r);

		this.$scroller.width(newwidth);
		//$( "#ScrollBarScroller" ).draggable({ axis: "x", containment: "parent" });
		if ( ! this.ScrollBarDraggable ) {
			var me = this;
			this.$scroller.draggable({ axis: "x", containment: "parent",
									   drag:function(event,ui){return me.draggingScrollbar(event,ui);},
									   stop:function(event,ui){return me.dragEndScrollbar(event,ui);}
								     });
			this.ScrollBarDraggable = true;
		}
		if (G_DEBUG) {
			//this.$e.css('background-color','blue');
			//this.$scrollBar.css('background-color','red');
		}
		this.updateScrollbarPos();
	},
	draggingScrollbar: function(event,ui){
		var x = ui.position.left; if (x<0){x=0;}

		if(this.shifting) return; this.shifting = true;
		var outter = this.$e.width(); var inner = this.$allImgCTNR.width(); var delta_max = Math.abs(outter-inner);
		var bw = this.$scrollBar.width(); var sw = this.$scroller.outerWidth(); var delta_scroll = Math.abs(bw-sw);
		var p = (x/delta_scroll);
		var pos = p * delta_max;

		/*var me = this; this.$allImgCTNR.stop(); this.$allImgCTNR.animate({'left': -pos}, {
			complete: function(){ me.shifting = false; }
		});*/
		this.$allImgCTNR.stop(); this.$allImgCTNR.css('left',-pos+'px');
		this.shifting = false;
	},
	dragEndScrollbar: function(event,ui){
		var x = ui.position.left;
		if (G_DEBUG) {console.log('pos-scroller: '+x);}
		if (x<0){
			this.$scroller.css('left','0px');
		}
	},
	updateScrollbarPos: function(){
		var outter = this.$e.width();
		var inner = this.$allImgCTNR.width();
		var delta_max = Math.abs(outter-inner);
		var delta_current = Math.abs( _safeNumParse(this.$allImgCTNR.css('left')) );
		var bw = this.$scrollBar.width();
		var sw = this.$scroller.outerWidth();
		var delta_scroll = Math.abs(bw-sw);

		var p = (delta_current/delta_max);
		var pos = ( p * delta_scroll );

		//if really close to max, set to max.
		if ( p > .98 ) {
			p=1;pos=delta_scroll;
		}

		this.$scroller.css('left',pos+"px");
		if (G_DEBUG) {
			console.log('scrollBar @ '+(p*100)+' % = '+pos+' px');
		}
	},
	removeViewFromWidget: function(aView){
		var info = this.findInfoOfView(aView);
		info.CTNR.remove();
		this.list.removeItem(info);
		// resize the view container
		var vW = $('.AtlasViewItem:first').outerWidth() + parseFloat($('.AtlasViewItem:first').css('margin-right')) ;
		this.$allImgCTNR.innerWidth(20 + ((this.AppsCTRL.viewController.viewList.length - 1) * ( vW + 2)));
		if(this.isAllNotVisible()){
			var l = this.$allImgCTNR.width() - this.$e.width();
			l = Math.max(0, l);
			this.$allImgCTNR.animate({'left': -l + 'px'});
		}
	},
	addViewToWidget: function(aView){
		var newViewCTNR = $("<div></div>").addClass('AtlasViewItem').attr({'viewid':aView.uid});
		var h = $(this.parentDiv).height();
		//newViewCTNR.css({'width':h+'px','height':h+'px' });
		$newImg = $("<img />");
		newViewCTNR.append($newImg);
		this.$allImgCTNR.append(newViewCTNR);
		var w = newViewCTNR.outerWidth();
		w = Math.max(w, C_ATLAS_VIEW_PREVIEW_WIDTH);
		this.$allImgCTNR.width(0 + ((this.AppsCTRL.viewController.viewList.length)* (w + 12)));

		//	tilesInfo = this.imgGenerator.getTilesBoundInfo(aView.r, this.imgGenerator.displayDim, aView.zoomLevel - 1);
		var deleteButton = $('<div></div>').html('x').addClass('deleteViewButton').appendTo(newViewCTNR);
		var titleDiv = $('<div />').html(aView.name).addClass('aViewName').appendTo(newViewCTNR);
		this.list.push(new TViewWidgetInfo(aView, newViewCTNR));

		this.setViewPreview(aView);

		// make sure that the new view is visible in the widget.
		//if(!this.isImageVisible(newViewCTNR)){
		//	this.makeImageVisible(newViewCTNR);
		//}
		var me = this;

		//$(aView).on('RefreshPreviewNeeded', function(e, aView){
			me.setViewPreview(aView);
		//});
	},
	setViewPreview: function(aView){
		this.imgGenerator.displayDim.width = 120;
		this.imgGenerator.displayDim.height = 120;
		var vp = this.AppsCTRL.ATLASViewportController.ATLASViewportList[0];
		if (( vp == null) || ( vp == undefined )) return false;
		this.imgGenerator.umBounds =  aView.getBounds();
		// get the normalized bounds
		var normBs = this.AppsCTRL.ATLASViewportController.ATLASViewportList[0].SDConverter.pointsToMicronsBounds(aView.getBounds());
		this.imgGenerator.normBounds = normBs;
		this.imgGenerator.ATLASViewport = this.AppsCTRL.ATLASViewportController.ATLASViewportList[0];
		var me = this;
		if(this.imgGenerator.busy){
			var aInterval = setInterval(function(){
				if(!me.imgGenerator.busy){
					var vp = me.AppsCTRL.ATLASViewportController.ATLASViewportList[0];
					me.imgGenerator.umBounds =  aView.getBounds();
					// get the normalized bounds
					var normBs = me.AppsCTRL.ATLASViewportController.ATLASViewportList[0].SDConverter.pointsToMicronsBounds(aView.getBounds());
					me.imgGenerator.normBounds = normBs;
					me.imgGenerator.ATLASViewport = me.AppsCTRL.ATLASViewportController.ATLASViewportList[0];
					me.imgGenerator.saveViewToImg(me.findInfoOfView(aView).CTNR.find('img').get(0));
					clearInterval(aInterval);
				}
				else{
				}
			}, 100);
		}
		else
			this.imgGenerator.saveViewToImg(this.findInfoOfView(aView).CTNR.find('img').get(0));
	},
	isAllNotVisible: function(){
		var l = Math.abs(parseFloat(this.$allImgCTNR.css('left')));
		var w = parseFloat(this.$allImgCTNR.width());
		return  l > (w - 50) ;
	},
	getImagePos: function($img){
		var os = $img.position();
		var cpos = this.$allImgCTNR.position();
		debugLog('position left:' + (os.left + cpos.left));
		return os.left + cpos.left;
	},
	makeImageVisible: function($img){
		var x = $img.position().left + Math.max($img.outerWidth(), C_ATLAS_VIEW_PREVIEW_WIDTH);
		x -= this.$e.width();
		x = Math.max(0,x);
		this.$allImgCTNR.animate({'left': -x});
	},
	isImageVisible: function($img){
		var cW = this.$e.width();
		var imgLeft = this.getImagePos($img);
		debugLog('image is visible:' + ((imgLeft + $img.width()) < cW));
		return (imgLeft + $img.width()) < cW;
	},
	getMaxOffset: function(){
		var o = this.$allImgCTNR.width() - this.$e.width();
		if (o < 0) return 0;
		return o;
	},
	shiftImageLeft: function(){
		if(this.shifting) return;
		this.shifting = true;
		ax = parseFloat(this.$allImgCTNR.css('left'));
		if(isNaN(ax)) ax = 0;
		ax = Math.abs(ax);
		// get the outwidth of a single image
		var imgW = $('.AtlasViewItem:first').outerWidth();
		ax += imgW;
		ax = Math.min(this.getMaxOffset(), Math.abs(ax));
		this.$allImgCTNR.stop();
		var me = this;
		this.$allImgCTNR.animate({'left': -ax}, {
			complete: function(){ me.shifting = false; },
			step: function(){ me.updateScrollbarPos(); }
		});
	},
	shiftImageRight: function(){
		if(this.shifting) return;
		this.shifting = true;
		ax = parseFloat(this.$allImgCTNR.css('left'));
		if(isNaN(ax)) ax = 0;
		ax = Math.abs(ax);
		ax -= 130;
		ax = Math.max(0, ax);
		this.$allImgCTNR.stop();
		var me = this;
		this.$allImgCTNR.animate({'left': -ax}, {
			complete: function(){ me.shifting = false; },
			step: function(){ me.updateScrollbarPos(); }
		});
	},
	findInfoOfView: function(aView){
		var i = 0;
		while(i < this.list.length){
			if( this.list[i].aView.uid == aView.uid){
				return this.list[i];
			}
			i++;
		}
		return null;
	},
	shutDown: function(){
		var me = this;
		$(this.AppsCTRL.ATLASViewportController).off('onAddATLASViewport', function(e, pAVP) {
			me.onAddAtlasViewport(e, pAVP);
		});
		$(this.AppsCTRL.viewController).off('onAddView', function(e, aView){
			me.onAddView(e, aView);
		});
		$(this.AppsCTRL.viewController).off('onDeleteView', function(e, aView){
			me.onDeleteView(e, aView);
		});
		$(window).off('resize', function(){
		  me.onWindowResize();
		});
		this.$e.off(TouchMouseEvent.DOWN, '.AtlasViewItem');
		this.$e.off(TouchMouseEvent.DOWN, '.deleteViewButton');
		this.$e.off('mouseover', '.AtlasViewItem');
		this.$e.off('mouseout', '.AtlasViewItem');
		this.$e.off('dblclick', '.AtlasViewItem');
		this.$e.remove();
	}
});
