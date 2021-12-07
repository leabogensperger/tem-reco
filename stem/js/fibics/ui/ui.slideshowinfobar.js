/*

The Slide Show Info Bar Class

The slideshow info bar is a bar that is positioned at the top of the application when the
SlideShow is started.

It is displays some information about the current view as well as some controls like pause and stop.


*/

TSlideShowInfoBar = TUIElement.extend({
	init: function (pAppC, pSSCTRL){
		this._super();
		this.pAppCTRL = pAppC;
		this.pSSCTRL = pSSCTRL;
		this.buildHTML();
		this.hideDirection = 'up';
		this.registerEvents();
	},
	buildHTML: function(){
		var me = this;
		this.$e = $('<section />').attr({'id':'SlideShowTopBar'}).appendTo($('body'));
		this.$ePaddec = $('<div />').attr({'id':'SlideShowTopBarPadded'}).appendTo(this.$e);
		this.$ePaddec.append($('<div />').attr({'id':'SlideShowViewCaption'}));
		this.$ePaddec.append($('<div />').attr({'id':'SlideShowViewCounter'}));
		this.$ePaddec.append($('<div />').attr({'id':'SlideShowViewDescription'}));

		// add the control to pause
		this.$pauseText = $("<div />").html(_e('pauseslideshow')).attr({'id': 'SlideShowTopBarPause'});
		this.$pauseText.appendTo(this.$e);
		this.$pauseText.on(TouchMouseEvent.DOWN,function(e){
			if(me.pSSCTRL != null) {
				me.pSSCTRL.pauseSlideShow();
				me.setPauseButton('resume');
			}
		});
		// add the control to resume
		this.$resumeText = $("<div />").html(_e('resumeslideshow')).attr({'id': 'SlideShowTopBarResume'});
		this.$resumeText.appendTo(this.$e);
		this.$resumeText.on(TouchMouseEvent.DOWN,function(e){
			if(me.pSSCTRL != null) {
				me.pSSCTRL.resumeSlideShow();
				me.setPauseButton('pause');
			}
		});
		// add the control to stop
		this.$stopText = $("<div />").html(_e('stopslideshow')).attr({'id': 'SlideShowTopBarStop'});
		this.$stopText.appendTo(this.$e);
		this.$stopText.on(TouchMouseEvent.DOWN,function(e){
			if(me.pSSCTRL != null)
				me.pSSCTRL.stopSlideShow();
		});
		// add "Press enter to go to next slide
		this.$e.append('<br>');
		this.$enterToNext = $("<div />").html(_e('pressentertogotonextslide')).attr({'id': 'SlideShowTopBarEnterToNext'});
		this.$enterToNext.appendTo(this.$e);
	},
	registerEvents: function(){
		var me = this;
		// onStartSlideShow
		if(me.pSSCTRL != null){
			$(this.pSSCTRL).on('onStartSlideShow', function(){
				me.onStartSlideCB();
			});
			$(this.pSSCTRL).trigger('onStartSlideShow');
			// onEndSlideShow
			$(this.pSSCTRL).on('onStopSlideShow', function(){
					me.onStopSlideCB()
			});
			// onPauseSlideShow
			$(this.pSSCTRL).on('onPauseSlideShow', function(){ me.onPauseSlideCB(); });
			// onResumeSlideShow
			$(this.pSSCTRL).on('onResumeSlideShow', function(){ me.onResumeSlideCB(); });
			// onChangeView
			$(this.pSSCTRL).on('onViewChange', function(e, pSSCTRL){
				me.updateViewInfo(pSSCTRL.pCurrentView);
			});
		}
	},
	setPauseButton: function(btn) {
		if (btn.indexOf('pause')!==-1) {
			$('#SlideShowTopBarResume').css('display','none');
			$('#SlideShowTopBarPause').css('display','inline-block');
		} else if (btn.indexOf('hide')!==-1) {
			$('#SlideShowTopBarResume').css('display','none');
			$('#SlideShowTopBarPause').css('display','none');
		} else {
			$('#SlideShowTopBarResume').css('display','inline-block');
			$('#SlideShowTopBarPause').css('display','none');
		}
	},
	onStartSlideCB: function(){
		if(this.pSSCTRL != null){
			if(this.pSSCTRL.bDisplayViewInfo)
				this.showUI();
			if(this.pSSCTRL.eMode == TSlideShowMode.Auto) {
				//this.$enterToNext.hide();
				//ui changes
				this.setPauseButton('pause');
				$('#SlideShowTopBarEnterToNext').html(_e('pressenterresumeslideshow'));
			} else {
				this.$enterToNext.show();
				//ui changes
				this.setPauseButton('hide');
				$('#SlideShowTopBarEnterToNext').html(_e('pressentertogotonextslide'));
			}
		}
	},
	onStopSlideCB: function(){
		this.hideUI();
	},
	onPauseSlideCB: function(){
		this.setPauseButton('resume');
	},
	onResumeSlideCB: function(){
		this.setPauseButton('pause');
	},
	updateViewInfo: function(pView){
		if ((pView != undefined ) && (pView != null)){
			var current = this.pSSCTRL.pViewCTRL.viewList.findIndex(pView) + 1;
			var total = this.pSSCTRL.pViewCTRL.viewList.length;

			this.$e.find('#SlideShowViewCaption').html(pView.name);
			this.$e.find('#SlideShowViewCounter').html("("+current+" of "+total+")");
			this.$e.find('#SlideShowViewDescription').html(pView.description);
		}
	},
	shutDown: function(){
		this.$e.remove();
		var me = this;
		if(me.pSSCTRL != null){
			$(this.pSSCTRL).off('onStartSlideShow', function(){me.onStartSlideCB();});
			$(this.$pSSCTRL).off('onStopSlideShow', function(){me.onStopSlideCB();});
		}
	}
});
