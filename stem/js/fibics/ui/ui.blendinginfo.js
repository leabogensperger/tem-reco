// JavaScript Document
TBlendingInfoUI = TUIElement.extend({
	init: function(pAppCTRL, pBlendingInfo, pBlendingInfoCTRL){
		this.blendingInfo = pBlendingInfo;
		this.pAppCTRL = pAppCTRL;
		this.blendingInfoCTRL = pBlendingInfoCTRL;
		this.buildHTML();
	},
	buildHTML:function(){
		var me = this;
		this.$e = $("<div></div>").addClass('BlendingOptionBlock').attr({'uid': this.blendingInfo.uid});
		//this.$e.draggable();
		this.signalSelector = this.generateSignalSelect();


		this.$firstRow = $("<div></div>").addClass('BlendingOptionRow1  BlendingOptionRow').appendTo(this.$e);
		this.$channelCaption = $("<span></span>").html('Channel').addClass('ChannelOptionCaption').appendTo(this.$firstRow);
		this.signalSelector.appendTo(this.$firstRow);

		this.$topControls = $("<div></div>").addClass('ChannelOptionsCTRLs').appendTo(this.$firstRow);
		this.$theEye = $('<img />').attr({'src':'images/blending_eye.png'}).addClass('BlendingEye').appendTo(this.$topControls);
		this.$deleteChannel = $("<div></div>").html('X').addClass('DeleteChannel').appendTo(this.$topControls);

		this.$deleteChannel.click(function(e){
			var	uid = $(this).closest('.BlendingOptionBlock').attr('uid');
			var vpInfo = me.blendingInfoCTRL.getBlendingInfoByID(uid );
			me.blendingInfoCTRL.deleteBlendingInfo(vpInfo);
			me.blendingInfoCTRL.blend();
		});

		this.$theEye.click(function(){
			me.blendingInfo.visible = $(this).attr('src') != 'images/blending_eye.png';

			if(me.blendingInfo.visible)
				$(this).attr('src', 'images/blending_eye.png');
			else
				$(this).attr('src', 'images/blending_eye_x.png');

			me.blendingInfoCTRL.blend();

		});

		//this.$secondRow = $("<div></div>").addClass('BlendingOptionRow2  BlendingOptionRow').appendTo(this.$e);

		this.$blendOptSelect = $('<select></select>').addClass('blendingmode');

		//loop to reduce code-size
		var i = 0; var tmp = ['normal','lighter','lighten','darken','copy','soft-light','hard-light','screen'];
			for(i=0;i<tmp.length;i++) { $('<option></option>').attr({'value':tmp[i]}).html(_e(tmp[i])).appendTo(this.$blendOptSelect); }
		$('<option></option>').attr({'value':'overlay', 'selected':'selected'}).html(_e('overlay')).appendTo(this.$blendOptSelect);
		tmp = ['multiply','color-burn','color-dodge','difference','exclusion','luminosity'];
			for(i=0;i<tmp.length;i++) { $('<option></option>').attr({'value':tmp[i]}).html(_e(tmp[i])).appendTo(this.$blendOptSelect); }
		//$('<option></option>').attr({'value':'pin-light'}).html('Pin-light').appendTo(this.$blendOptSelect);

		this.$blendOptSelect.change(function(){
			me.blendingInfo.blendingMode = $(this).val();
			me.blendingInfoCTRL.blend();
		});

		this.$thirdRow = $("<div></div>").addClass('BlendingOptionRow3 BlendingOptionRow').appendTo(this.$e);
		//this.$blendOptSelect.appendTo(this.$thirdRow);

		$opSlider = $("<div></div>").addClass('BlendStrength');
		$opt = $('<div></div>').append(this.$blendOptSelect).addClass('blendingControlLine').append($('<span></span>').addClass('opacityVal').html('100'));
		this.$thirdRow.append($opt);
		$opSlider.appendTo($opt);

		$opSlider.slider({ 'change':function(event, ui){
					me.blendingInfo.strength = ui.value/100;
					me.$e.find('.opacityVal').html(ui.value);
				},
				'slide':function(event, ui){
					me.$e.find('.opacityVal').html(ui.value);
				},
				value:100,
			 'stop':function(event, ui){
			 		me.blendingInfo.strength = ui.value/100;
					me.blendingInfoCTRL.blend();
				}});
		this.$e.wrapInner($('<div></div>').addClass('BlendingOptionPadding'));
	},
	generateSignalSelect: function(){
		$s = $('<select></select>').addClass('ChannelSelect');
		var me = this;
		var i = 0;
		var vp = null;
		while (i < this.pAppCTRL.project.getChannelCount()){
			pC = this.pAppCTRL.project.getChannel(i);
			$opt = $('<option></option>').html(pC.sAlias).appendTo($s);
			if (this.blendingInfo.signal == i){
				$opt.attr({'selected': 'selected'});
			}
			$opt.attr({'value':i});
			i++;
		}

		$s.change(function(){
			var i = $(this).find('option').index($(this).find('option:selected'));
			me.blendingInfo.signal = i;
			me.blendingInfoCTRL.blend();
		});
		return $s;
	}
});
