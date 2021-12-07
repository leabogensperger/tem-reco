// JavaScript Document
TABBVSettingsForm = TBaseWidget.extend({
	init: function(pAppsCTRL){
		this._super();
		this.$form = $('<div />').attr({'id':'ATLASSettingsForm', 'title':_e('abbvsettingsformtitle'),  'class':'aDialog nonSelect wPanel'});
		this.appsCTRL = pAppsCTRL;
		this.icone = 'settings.png';
		this.title = 'Settings';
		this.hint = _e('applicationsettings');
		this.id = 'applicationSettings';
		this.popup = true;
		this.$button.attr('popup', '1');
		this.buildHTML();
		var me = this;
		// Register on some events
		$(window).on('resize', function(){
			var winH = $(this).height();
			var formH = Math.min(winH - 100, 500);
			me.$form.css('height', (formH) + 'px');
		});

	},
	shutDown: function(){
		this.$form.dialog('destroy');
		this._super();
	},
	setFormOpacity: function(v){
		this.$form.find('#fillOpacityValue').html(v*100 + '%');
		this.$fillOpacitySlider.slider("option", "value", v*100);
	},
	makeForm: function(){
		// this has to be called after the HTML code is inserted in the page otherwise, the form will be empty
		var me = this;
		this.$form.dialog({autoOpen:false,
						modal:true,
						width:540,
						show: "fade",
						hide: "fade",
						open:function(){
							$('body').css('overflow', 'hidden');
							me.reassignSettings();
							},
						buttons: {'OK': function(){
							me.assignSettings();
							$(this).dialog('close');
						}}});

	  $('#lineColor').minicolors(
			{defaultValue:g_lineColor,
			close: function(hex, rgb){ g_tempLineColor = hex;},
			change: function(hex, rgb){ g_tempLineColor = hex;}});

		this.$crosshairColorInput.minicolors(
			{defaultValue:g_crosshairColor,
			close: function(hex, rgb){	g_tempCrosshairColor = hex;},
			change: function(hex, rgb){	g_tempCrosshairColor = hex;}});

		$('#outlineColor').minicolors({
			defaultValue:g_outlineColor,
			close: function (hex, rgb) {g_tempOutlineColor = hex;},
			change: function (hex, rgb) {g_tempOutlineColor = hex;}});

		$('#textColor').minicolors({
			defaultValue:g_textColor,
			change: function (hex, rgb) {g_tempTextColor = hex;},
			close: function (hex, rgb) {g_tempTextColor = hex;}});

		$('#textOutlineColor').minicolors({
			defaultValue:g_textOutlineColor,
			change: function (hex, rgb) {g_tempTextOutlineColor =  hex;},
			close: function (hex, rgb) {	g_tempTextOutlineColor =  hex;}});

		$('#waypointTextColor').minicolors({
			defaultValue:g_textColor,
			change: function (hex, rgb) {g_tempWaypointTextColor = hex;},
			close: function (hex, rgb) {g_tempWaypointTextColor = hex;}});

		$('#waypointTextOutlineColor').minicolors({
			defaultValue:g_textColor,
			change: function (hex, rgb) {g_tempWaypointTextOutlineColor = hex;},
			close: function (hex, rgb) {g_tempWaypointTextOutlineColor = hex;}});
	},
	assignSettings: function(){
		g_fontSize = _safeNumParse($('#fontSize').val(), g_fontSize);
		//changeFontSizeTo(g_fontSize);
		g_lineThickness = $('#lineThickness').val();
		g_outlineColor = g_tempOutlineColor;
		g_textOutlineColor = g_tempTextOutlineColor;
		g_textColor =  g_tempTextColor;
		g_lineColor = g_tempLineColor;
		lineColorRGB = new RGBColor(g_lineColor);
		g_fillOpacity = g_tempFillOpacity;
		g_areaFillColor = "rgba(" + lineColorRGB.r + ", " +  lineColorRGB.g + ", " +  lineColorRGB.b + ", " + (g_fillOpacity/100) + ")";
		g_crosshairColor = g_tempCrosshairColor;
		g_fontFamily = g_tempFontFamily;
		g_waypointTextColor = g_tempWaypointTextColor;
		g_waypointTextOutlineColor = g_tempWaypointTextOutlineColor;
		g_crosshairThickness = $('#crosshairThickness').val();
		g_drawTextSolidBackground = $('#drawTextSolidBackground').children('input:checked').val() == 1;
		g_showCallOutTail = $('#showCallOutTail').children('input:checked').val() == 1;
		g_zoomOutBeforeGoingToView = $('#zoomOutBeforeGoingToView').children('input:checked').val() == 1;
		g_drawFill = $('#drawFill').children('input:checked').val() == 1;
		g_showAngle = $('#showAngle').children('input:checked').val() == 1;
		g_enableAnim = $('#enableAnim').children('input:checked').val() == 1;

		Seadragon.Config.animationTime = (g_enableAnim)?(1.5):(0);

		// make sure to change the changecount on all the measurements
		var i = 0;
		while( i < this.appsCTRL.measurementController.measurementList.length){
			this.appsCTRL.measurementController.measurementList[i].incChangeCount();
			i++;
		}
		i = 0;
		while( i < this.appsCTRL.waypointController.waypointList.length){
			this.appsCTRL.waypointController.waypointList[i].incChangeCount();
			i++;
		}
	},
	buildHTML: function(){
		this._super();

		this.$measurementFS = $('<fieldset />').appendTo(this.$form);
		$("<legend />").html(_e('measurements')).appendTo(this.$measurementFS);
		this.$shapeFS = $('<fieldset />').appendTo(this.$measurementFS);
		$("<legend />").html('Shape').appendTo(this.$shapeFS);
		this.$shapeTable = $('<table />').addClass('measurementSettings').appendTo(this.$shapeFS);
		$('<tr />').appendTo(this.$shapeTable).html("<td><label>" + _e('shapecolor') + "</label></td><td><input type='hidden' id='lineColor' /></td><td><label>" + _e('linethickness') + "</label></td><td><select name='lineThickness' id='lineThickness'><option value='1'>1</option><option value='2' selected='selected' >2</option><option value='3'>3</option><option value='4'>4</option><option value='5'>5</option><option value='6'>6</option><option value='7'>7</option></select></td>");
		$('<tr />').appendTo(this.$shapeTable).html("<td><label>" + _e('outlinecolor') + "</label></td><td><input type='hidden'  id='outlineColor' class='colorHolder outlineColor' /></td><td></td><td></td>");
		this.$textFS = $('<fieldset />').appendTo(this.$measurementFS);
		$("<legend />").html(_e('text')).appendTo(this.$textFS);
		this.$textTable = $('<table />').addClass('measurementSettings').appendTo(this.$textFS);
		$('<tr />').appendTo(this.$textTable).html("<td><label>" + _e('textcolor') + "</label></td><td><input type='hidden' id='textColor' class='colorHolder mainColor' /></td><td ><label>" + _e('fontsize') + "</label></td><td ><select name='fontSize' id='fontSize'><option value='8'>8</option><option value='9'>9</option><option value='10'>10</option><option value='11'>11</option><option value='12' selected='selected'>12</option><option value='14'>14</option><option value='16'>16</option><option value='20'>20</option><option value='24'>24</option><option value='30'>30</option><option value='36'>36</option><option value='40'>40</option><option value='48'>48</option><option value='60'>60</option><option value='72'>72</option></select></td>");
		$('<tr />').appendTo(this.$textTable).html("<td><label>" + _e('textoutlinecolor') + "</label></td><td><input type='hidden'  id='textOutlineColor' class='colorHolder outlineColor' /></td><td class='fontSelectElement'><label>" + _e('font') + "</label></td><td class='fontSelectElement'><select name='fontFamily' id='fontFamily'><option value='monospace' class='monospaceFont'>Monospace</option><option value='georgia' class='georgiaFont'>Georgia</option><option value='times new roman' class='timesNewRomanFont'>Times New Roman</option><option value='trebuchet ms' class='trebuchetFont'>Trebuchet MS</option><option value='verdana' class='verdanaFont'>Verdana</option><option value='courier' class='courierFont'>Courier</option><option value='arial' class='arialFont'>Arial</option></select></td>");

		this.$textTable.find('#fontFamily').change(function(){
			g_tempFontFamily = $(this).val();
		});
		this.$textBGTable = $('<table />').appendTo(this.$textFS).html("<tr><td class='checkBoxGroupCaption'>" + _e('solidbackground') + "</td><td><div id='drawTextSolidBackground' class='buttonSet'><input type='radio' name='drawTextSolidBackground' id='drawTextSolidBackground1' value='1' /><label for='drawTextSolidBackground1'>" + _e('yes') + "</label>	<input type='radio' name='drawTextSolidBackground' id='drawTextSolidBackground2' value='0' /><label for='drawTextSolidBackground2'>" + _e('no') + "</label>	</div>	</td>	</tr>");

		//this.$textBGTable.append("<tr><td class='checkBoxGroupCaption'>	" + _e('showcallouttail') + "	</td>	<td>	<div id='showCallOutTail' class='buttonSet'>	<input type='radio' name='showCallOutTail' id='showCallOutTail1' checked='checked' value='1' /><label for='showCallOutTail1'>" + _e('yes') + "</label>	<input type='radio' name='showCallOutTail' id='showCallOutTail2' value='0' /><label for='showCallOutTail2'>" + _e('no') + "</label>	</div>	</td>	</tr>");

		this.$fillFS = $('<fieldset />').appendTo(this.$measurementFS);
		$("<legend />").html(_e('fill')).appendTo(this.$fillFS);
		this.$drawFillInput = $('<div />').attr({'id':'drawFill', 'class':'buttonSet'}).html("<input type='radio' name='drawFill' id='drawFill1' checked='checked' value='1' /><label for='drawFill1'>" + _e('yes') + "</label><input type='radio' name='drawFill' id='drawFill2' value='0' /><label for='drawFill2'>" + _e('no') + "</label>");
		var me = this;
		this.$drawFillInput.on(TouchMouseEvent.UP, function(){
			if($('#drawFill').children('input:checked').val() == 1)
				me.$fillOpacity.hide();
			else me.$fillOpacity.show();
		});

		this.$drawFillTable = $('<table />').appendTo(this.$fillFS);
		this.$drawFillTable.append($('<tr />').html("<td class='checkBoxGroupCaption'>"+ _e('drawfill')+ "</td>").append($('<td />').append(this.$drawFillInput)));
		this.$fillOpacity = $('<div />').addClass('oppacityCTNR').appendTo(this.$fillFS);
		this.$fillOpacitySlider = $('<div />').attr({'id':'fillOpacitySlider',  'class':'slider'});
		$("<table />").appendTo(this.$fillOpacity).append($("<tr />").append($("<td />").html(_e('opacity'))).append($("<td />").append(this.$fillOpacitySlider)).append($("<td />").html("<div id='fillOpacityValue'></div>")));
			this.$fillOpacitySlider.slider({
			slide: function( event, ui){
				$('#fillOpacityValue').html(ui.value + '%');
				g_tempFillOpacity = ui.value/100;
			}
		});

		this.$showAngleInput = $('<div />').attr({'id':'showAngle', 'class':'buttonSet'}).html("<input type='radio' name='showAngle' id='showAngle1' checked='checked' value='1' /><label for='showAngle1'>" + _e('yes') + "</label><input type='radio' name='showAngle' id='showAngle2' value='0' /><label for='showAngle2'>" + _e('no') + "</label>");
		$("<table />").appendTo(this.$measurementFS).append($('<tr />').append($('<td />').html(_e('showangle'))).append($('<td />').append(this.$showAngleInput)));

		// crosshair settings
		this.buildCrossairHTML();
		this.buildWaypointsHTML();
		this.buildMiscHTML();

		this.$form.find('.buttonSet').buttonset();
	},
	buildCrossairHTML: function(){
		this.$crosshairFS = $('<fieldset />').appendTo(this.$form);
		$("<legend />").html(_e('crosshair')).appendTo(this.$crosshairFS);
		this.$crosshairColorInput = $('<input />').attr( {'type':'hidden','id':'crosshairColor', 'class':'colorPick'});
		this.$crosshairTable = $('<table />').appendTo(this.$crosshairFS).append($('<tr />').append($('<td />').html('<label>' + _e('color') + '</label>')).append($('<td />').append(this.$crosshairColorInput)));
		this.$crosshairThicknessInput = $('<select />').attr({'name':'crosshairThickness', 'id':"crosshairThickness"}).html("<option value='1'  selected='selected'>1</option><option value='2' >2</option><option value='3'>3</option><option value='4'>4</option><option value='5'>5</option><option value='6'>6</option><option value='7'>7</option>");
		this.$crosshairTable.find('tr').append($('<td />').html('<label>' + _e('thickness') + '</label>')).append($('<td />').append(this.$crosshairThicknessInput));
	},
	buildWaypointsHTML: function(){
		// waypoint settings
		this.$waypointFS = $('<fieldset />').appendTo(this.$form);
		$("<legend />").html(_e('waypoints')).appendTo(this.$waypointFS);
		this.$waypointTable = $('<table />').addClass('measurementSettings').appendTo(this.$waypointFS);
		$('<tr />').appendTo(this.$waypointTable).html("<td><label>" + _e('textcolor') + "</label></td><td><input type='hidden' id='waypointTextColor' /></td><td><label>" + _e('outlinecolor') + "</label></td><td><input type='hidden' id='waypointTextOutlineColor' /></td>");
	},
	buildMiscHTML: function(){
		this.$miscFS = $('<fieldset />').appendTo(this.$form);
		$("<legend />").html(_e('misc')).appendTo(this.$miscFS);
		this.$enableAnimInput = $('<div />').attr({'id':'enableAnim', 'class':'buttonSet'}).html("<input type='radio' name='enableAnim' id='enableAnim1' checked='checked' value='1' /><label for='enableAnim1'>" + _e('yes') + "</label><input type='radio' name='enableAnim' id='enableAnim2' value='0' /><label for='enableAnim2'>" + _e('no') + "</label>");
		$("<table />").appendTo(this.$miscFS).append($('<tr />').append($('<td />').html(_e('enableanim')+" ?  ")).append($('<td />').append(this.$enableAnimInput)));
	},
	reassignSettings: function (){

		$('#fontSize').val(g_fontSize);
		$('#fontFamily').val(g_fontFamily);
		$('#fontFamily').find('option[value="'+g_fontFamily+'"]').attr('selected', 'selected');
		g_tempFontFamily = g_fontFamily;
		g_tempLineThickness = g_lineThickness;
		g_tempTextColor = g_textColor;
		g_tempOutlineColor = g_outlineColor;
		g_tempTextOutlineColor = g_tempTextOutlineColor;
		g_tempLineColor = g_lineColor;
		g_tempCrosshairColor = g_crosshairColor;
		g_tempWaypointTextColor = g_waypointTextColor;
		g_tempWaypointTextColor = g_waypointTextColor;
		g_tempWaypointTextOutlineColor = g_waypointTextOutlineColor;

		$('#lineColor').minicolors('value', g_lineColor);
		$('#crosshairColor').minicolors('value', g_crosshairColor);
		$('#outlineColor').minicolors('value', g_outlineColor);
		$('#textColor').minicolors('value', g_textColor);
		$('#textOutlineColor').minicolors('value', g_textOutlineColor);
		$('#waypointTextColor').minicolors('value', g_waypointTextColor);
		$('#waypointTextOutlineColor').minicolors('value', g_waypointTextOutlineColor);

		$('#lineThickness').val(g_lineThickness);
		$('#crosshairThickness').val(g_crosshairThickness);
		this.setFormOpacity(g_fillOpacity);

		$('#drawTextSolidBackground').children().prop('checked', false);
		if(g_drawTextSolidBackground) $('#drawTextSolidBackground').children('[value=1]').prop('checked', true);
		else $('#drawTextSolidBackground').children('[value=0]').prop('checked', true);

		$('#drawTextSolidBackground').buttonset('refresh');

		$('#showCallOutTail').children().prop('checked', false);
		if(g_showCallOutTail){
			$('#showCallOutTail').children('[value=1]').prop('checked', true);
			$('#showCallOutTail').buttonset('refresh');
		}
		else{
			$('#showCallOutTail').children('[value=0]').prop('checked', true);
			$('#showCallOutTail').buttonset('refresh');
		}

		$('#drawFill').children().prop('checked', false);
		if(g_drawFill){
			$('#drawFill').children('[value=1]').prop('checked', true)
			$('#drawFill').buttonset('refresh');
		}
		else{
			$('#drawFill').children('[value=0]').prop('checked', true);
			$('#drawFill').buttonset('refresh');
		}

		$('#showAngle').children().prop('checked', false);
		if(g_showAngle){
			$('#showAngle').children('[value=1]').prop('checked', true);
			$('#showAngle').buttonset('refresh');
		}
		else{
			$('#showAngle').children('[value=0]').prop('checked', true);
			$('#showAngle').buttonset('refresh');
		}

		$('#enableAnim').children().prop('checked', false);
		if(g_enableAnim){
			$('#enableAnim').children('[value=1]').prop('checked', true);
			$('#enableAnim').buttonset('refresh');
		}
		else{
			$('#enableAnim').children('[value=0]').prop('checked', true);
			$('#enableAnim').buttonset('refresh');
		}
	}
});

// Application Settings
// Initialization of the settings
var g_shiftDown = false;
var g_exportLineColor = '#0000FF';
var g_crosshairThickness = 1;
var g_textOutlineColor = "#00FF00";
var g_drawTextSolidBackground = true;
var g_showCallOutTail = true;
var g_zoomOutBeforeGoingToView = true;
var g_anchorFillColor = '#ff0000';
var g_anchorStrokeColor = '#990000';
var g_captionPadding = 5;
var g_nodeSize = 8;
var g_iPadNodeSize = 40;
var g_anchorSize = 6;
var g_CTRLDown = false;
var g_measurementCanvas;
var g_drawFill = true;
var g_showAngle = true;
var g_enableAnim = true;
var g_calloutColor = '#0000ff';
var g_viewportUpdateInterval = 40;
var g_fontFamily = 'trebuchet ms';
var g_lineHitTestThreshold = 5;

// temp var for settings
var g_tempCrosshairColor = g_crosshairColor;
var g_tempLineColor = g_lineColor;
var g_tempOutlineColor = g_outlineColor ;
var g_tempTextColor =  g_textColor;
var g_tempTextOutlineColor =  g_textOutlineColor;
var g_tempFillOpacity = g_fillOpacity;
var g_tempFontFamily = g_fontFamily;
var g_tempWaypointTextColor = g_waypointTextColor;
var g_tempWaypointTextOutlineColor = g_waypointTextOutlineColor;
