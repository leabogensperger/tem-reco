// JavaScript Document

//  To maximize the realestate of the screen, the layout of the form should change as a function of the aspect ratio of the canvas.
var TBlendingLayout ={Portrait:0, Landscape:1};


TBlendingWidget = TUIElement.extend({
	init: function(pAppCTRL){
		this.$ctrCTNR = null;
		this._super();
		this.histogram = null;
		this.histogramFS = null;
		loadCSS('css/widget.blending.css');
		var me = this;
		this.$channelListCTNR = null;
		this.blender = new TCanvasBlender();
		this.blendingCtrl = new TBlendingController(pAppCTRL, this.blender);
		this.pAppCTRL = pAppCTRL;
		this.$refreshingDiv = null;
		this.buildHTML();
		this.eLayout = TBlendingLayout.Portrait;
		this.bHasCustomDim = false;
		this.pCustomDim = new TDimension(0,0);
		this.blendInfoUIList = new Array();


		$(this.pAppCTRL.ATLASViewportController).on('onAddATLASViewport', function(e, avp){
		});

		$(this.blendingCtrl).on('onBlend', function(e, blendCTRL){
			// resize the canvas to fit inside the form
			me.fitCanvas();
			me.updateHistogram();
		});

		$(this.pAppCTRL.ATLASViewportController).on('animationfinishVPC', function(){
				me.hideRefreshing();
				me.update();
		});

		$(this.pAppCTRL.ATLASViewportController).on('animationstartVPC', function(){
			if(me.blendingCtrl.blendingInfos.length > 0)
				me.showRefreshing();
		});

		$(this.pAppCTRL.ATLASViewportController).on('changeSize', function(e, AVPC){

		});

		$(this.blendingCtrl).on('addBlendingInfoCB', function(e, pBCTRL, pBInfo){
			var newBInfo = new TBlendingInfoUI(me.pAppCTRL, pBInfo, me.blendingCtrl);
			me.blendInfoUIList.push(newBInfo);
			newBInfo.$e.appendTo(me.$channelFS);

			me.$e.find('.BlendingOptionBlock').removeClass('firstBlendingInfoBlock');
			$(me.$e.find('.BlendingOptionBlock').get(0)).addClass('firstBlendingInfoBlock');
			me.update();
			me.updateChannelCaption();
		});

		$(this.blendingCtrl).on('deleteBlendingInfoCB', function(e, pBCTRL, pBInfo){
			var toDelete = me.getUIOfBlendInfo(pBInfo);
			toDelete.$e.remove();
			me.blendInfoUIList.removeItem(toDelete);
			me.update();
		});

		$(this.$e).on('change', '.operandSelect', function(){
			var i = parseFloat($(this).attr('operandOrder'));
			var opdI = parseFloat($(this).val());
			me.blender.setOperandOrder(i, opdI);
			me.update();
		});
	},
	updateChannelCaption: function(){
		var i = 1;
		this.$e.find('.ChannelOptionCaption').each(function(){
				$(this).html('Channel ' + i);
				i++;
		});
	},
	getUIOfBlendInfo: function(aBI){
		for(var i = 0; i < this.blendInfoUIList.length; i++){
			if(this.blendInfoUIList[i].blendingInfo.uid == aBI.uid){
				return this.blendInfoUIList[i];
			}
		}
		return null;
	},
	setLayout: function(eLS){
		this.eLayout = eLS;
		if(this.eLayout == TBlendingLayout.Landscape){
			$(this.blender.destCanvas).css({'clear':'both'});
			this.$ctrCTNR .css({'clear': 'both', 'float':'right'});
			this.histogramFS.css({'clear': 'none', 'float':'right'});
		}
		else if(this.eLayout == TBlendingLayout.Portrait){
			$(this.blender.destCanvas).css({'clear':'none', float:'left'});
			this.$ctrCTNR.css({'float': 'right', 'clear': 'none'});
			//this.histogramFS.css({'clear': 'both', 'float':'left'});
		}
	},
	/*
		This function does 2 things:
		- It resize the Canvas
		- it resizes the dialog box.
		- It resize the histogram to match the height or the width of the controls of the widget.
	*/
	fitCanvas: function(){
		return; //for now, handled in utils.canvasBlender.js

		var cw = this.blender.destCanvas.width;
		var ch = this.blender.destCanvas.height;
		//var ww = $(window).width() * 0.50;
		//var wh = $(window).height() * 0.50;
		var fw = (this.$e).width();//.dialog('option', 'width') - 50;
		var fh = (this.$e).height();//dialog('option', 'height') - 75;
		var formW = 0;
		var formH = 0;
		var newCW = 0;
		var vpAspR = 1;
		var newCH = 0;
		var vpW = 0
		var vpH = 0;
		var ctrlW = this.$e.find('.ImageBlendingControls').outerWidth();
		var ctrlH = this.$e.find('.ImageBlendingControls').outerHeight();

		if (this.pAppCTRL.ATLASViewportController.ATLASViewportList.length > 0){
			var vpW = this.pAppCTRL.ATLASViewportController.ATLASViewportList[0].getDisplayDim().width;
			var vpH = this.pAppCTRL.ATLASViewportController.ATLASViewportList[0].getDisplayDim().height;
			vpAspR = vpW/vpH;
		}
		var maxH = 0;
		var maxW = 0;

		// if it is not custom size, the width and height is 70% of the viewport display size
		if(!this.bHasCustomDim){
			newCW = 0.7*vpW;
			newCH = 0.7*vpH;

			// the maximum height is this
			if(this.eLayout == TBlendingLayout.Landscape){
				formW = newCW + 50;
				formH = newCH + ctrlH + 50;

			}
			else if(this.eLayout == TBlendingLayout.Portrait){
				formW = newCW + ctrlW + 100;
				formH = newCH + 50;
			}
		}
		// if it is custom size, now it is the form size that ditactes the size of the canvas.
		else{
			formW = fw;
			formH = fh;
			if(this.eLayout == TBlendingLayout.Landscape){
				newCW = formW - 50;
				newCH = newCW / vpAspR;
			}
			else if(this.eLayout == TBlendingLayout.Portrait){
				newCH = formH - 50;
				newCW = newCH * vpAspR;
			}
		}

		// Take care of the histogram
		if(this.eLayout == TBlendingLayout.Landscape){
			var iSize =  this.$channelFS.height() - 20;
		}
		if(this.eLayout == TBlendingLayout.Portrait){
			var iSize =  this.$channelFS.width() - 20;

		}
		this.histogram.resize(iSize, iSize);



		//$(this.blender.destCanvas).resize(newCW);
		//$(this.blender.destCanvas).height(newCH);

		//try 2
		// var bh = $(window).height() * .375;
		// var bw = bh * vpAspR;
		// var bctx = $(this.blender.destCanvas)[0].getContext('2d');
		// bctx.width = bw;
		// bctx.height = bh;
		// console.log('Z-bw+bh: '+bw+'+'+bh);
		//try3
		// var bh = $(window).height() * .375;
		// var bw = bh * vpAspR;
		//	$(this.blender.destCanvas).attr('width',bw);
		//	$(this.blender.destCanvas).attr('height',bh);
		//var i = 0;
		// for (i=0;i<this.blendingCtrl.blendingInfos.length;i++) {
		// 	this.blendingCtrl.blendingInfos[i].canvas.width = bw;
		// 	this.blendingCtrl.blendingInfos[i].canvas.height = bh;
		// }

		/*
		// now resize the form so it fits the canvas
		if(!this.bHasCustomDim){
			(this.$e).dialog('option', 'width', formW);
			(this.$e).dialog('option', 'height', formH);
		}
		*/

	},
	addControlLine: function(caption, ctrl){
		$('<tr></tr>').appendTo(this.$ctrTable);
		this.$ctrTable.find('tr:last').append($('<td></td>').addClass('blendCtrlCaption').html(caption));
		this.$ctrTable.find('tr:last').append($('<td></td>').html(ctrl));
	},
	update: function(){

		// do not update anything if not visible.
		if(!this.$e.is(':visible')) return false;
		if(this.blendingCtrl.blendingInfos.length == 0){
			this.histogram.hide();
			$(this.blender.destCanvas).hide();
		}
		else{
			this.histogram.show();
			$(this.blender.destCanvas).show();
		}
		this.blendingCtrl.blend();

		if(this.blender.getAspectRatio() < 1){
			this.setLayout(TBlendingLayout.Portrait);
		}else if(this.blender.getAspectRatio() > 1){
			this.setLayout(TBlendingLayout.Landscape);
		}
	},
	hideRefreshing: function(){
		if(this.$refreshingDiv != null)
			this.$refreshingDiv.hide();
	},
	showRefreshing: function(){
		if(this.$refreshingDiv == null){
			this.$refreshingDiv = $("<div></div>").attr({'id':'refreshingOnTopOfCanvas'}).html(_e('refreshing')).appendTo(this.$e);
			$('<span></span>').attr({'id':'LoadingDots'}).html('d').appendTo(this.$refreshingDiv).Loadingdotdotdot({
    	"speed": 100,
    	"maxDots": 3,
    	"word": ""});
		}
		this.$refreshingDiv.show();
		var top = ($(this.blender.destCanvas).height()/2) - this.$refreshingDiv.outerHeight()/2;
		var left = ($(this.blender.destCanvas).outerWidth()/2) - this.$refreshingDiv.outerWidth()/2;
		this.$refreshingDiv.css({'top':top,
														'left':left});
	},
	buildHTML: function(){
		var me = this;
		this.$e = $('<div></div>').attr({'id':'blendingForm', 'title':_e('channelblending')});
		this.$widgetContent = $('<div></div>').attr({'id':'blendingFormContent'}).appendTo(this.$e);


		// initialize the dialog
		this.$e.dialog({
				autoOpen:false,
				open: function(e){
					var vpW = me.pAppCTRL.ATLASViewportController.ATLASViewportList[0].getDisplayDim().width;
					var vpH = me.pAppCTRL.ATLASViewportController.ATLASViewportList[0].getDisplayDim().height;
					var vpAspR = vpW/vpH;

					if (vpAspR > 1)
						me.eLayout == TBlendingLayout.Landscape;
					else
						me.eLayout == TBlendingLayout.Portrait;

					me.bHasCustomDim = false;
					me.update();
					var w = 0;
					var h = 0;
					/*
					if( me.eLayout == TBlendingLayout.Landscape){
						w = $(me.blender.destCanvas).width();
						h = $(me.blender.destCanvas).height() + me.$ctrCTNR.height() ;
					}
					else if( me.eLayout == TBlendingLayout.Portrait){
						w = me.$ctrCTNR.width() + $(me.blender.destCanvas).width();
						h = Math.max($(me.blender.destCanvas).height(), me.$ctrCTNR.width());
					}
					w += 100;
					h += 50;
					*/
					var ww = $(window).width();
					var wh = $(window).height();
					//w = ww * .75;
					//h = wh *.75;
					w = ww * .7;
					h = wh * .625;

					if (G_DEBUG) {
						console.log('ctrCTNRxW-xH: '+me.$ctrCTNR.width()+'-'+me.$ctrCTNR.height());
					}
					$(this).dialog( "option", {"width": w, 'height': h});

				},
				resizeStop: function(e){
					me.bHasCustomDim = true;
					me.pCustomDim.width = $(this).dialog( "option", "width");
					me.pCustomDim.height = $(this).dialog( "option", "height");
					me.resize();
			}
		});

		$(this.blender.destCanvas).appendTo(this.$widgetContent);
		this.$ctrCTNR = $('<div></div>').appendTo(this.$widgetContent).addClass('ImageBlendingControls');
		this.$channelFS =  $('<fieldset></fieldset>').appendTo(this.$ctrCTNR).append($('<legend>' + _e('blendingoptions') + '</legend>')).addClass('blendingFS');
		// make the field set droppable

		this.$channelListCTNR = $('<div></div>').attr({'id':'channelBlendCTNR'}).appendTo(this.$channelFS);
		this.$channelListCTNR.droppable({'accept':'.BlendingOptionBlock'});
		this.histogramFS = $('<fieldset></fieldset>').appendTo(this.$ctrCTNR);
		this.histogramFS.append($('<legend></legend>').html(_e('histogram')));
		this.histogram = new THistogram(this.blender.destCanvas);
		this.histogram.appendTo(this.histogramFS);
		this.addButton = $('<div></div>').html(_e('addchannel')).appendTo(this.$channelFS).button();
		this.addButton.on('click', function(){
			me.blendingCtrl.addBlendingInfo(new TAtlasBlendingInfo());
		});

		// add the Histogram Type button

		this.$histogramTypeBS = $("<div></div>").attr('id', 'HistogramTypeButtonSet').prependTo(this.histogramFS);
		this.$histogramTypeBS.append("<input type='radio' value='grayscale' id='HistogramTypeGrayscale' name='HistogramType' /><label for='HistogramTypeGrayscale' class='button'>"+ _e('grayscale') + "</label>");
		this.$histogramTypeBS.append("<input type='radio' value='rgb' id='HistogramTypeRGB' name='HistogramType' /><label for='HistogramTypeRGB' class='button' >"+ _e('rgb') + "</label>");
		this.$histogramTypeBS.buttonset();

		//weird bug, select done here
		if (this.histogram.type == 'grayscale')
			$('#HistogramTypeButtonSet').find('#HistogramTypeGrayscale').prop('checked',true);
		else //if type is e.g. continuum
			$('#HistogramTypeButtonSet').find('#HistogramTypeRGB').prop('checked',true);
		$('#HistogramTypeButtonSet').buttonset('refresh');

		this.$histogramTypeBS.children().on(TouchMouseEvent.DOWN, function(e){			  // former click
			var aType = $('#' + $(this).attr('for')).val();
			me.histogram.setType(aType);
			return false;
		});

	},
	toggle: function(){
		if(this.$e.is(':visible'))
			this.$e.dialog('close');
		else
			this.$e.dialog('open');
	},
	updateHistogram :function (){
		this.histogram.update();
	},
	resize: function(w,h){
		this._super(w,h);
		this.fitCanvas();
		//this.histogram.resize(w-40, w/2);
	}
});
