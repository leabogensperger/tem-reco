TCaption = TMeasurement.extend({
	init:function(aText, aPt){
		this._super();
		this.fontSize = g_fontSize;
		this.hasCustomFontSize = false;
		this.fontFamily = g_fontFamily;
		this.textAlign = 'left';
		this.baseline = 'top';
		this.textlines = new Array();
		this.textlines.push(aText);
		this.textColor = g_textColor;
		this.basePt = new Seadragon.Point(aPt.x, aPt.y);  // this the point used to align the text horizontally and vertically
		this.hasCustomPosition = false;
		this.nodeVisible = true;
		this.hasCustomFontFamily = false;
	},
	resetDisplaySize: function(){
		$(this).trigger('onResetDisplaySize', [this]);
	},
	initVar: function(){
		this._super();
		this.className = 'TCaption';
	},
	getTextOutlineColor: function(){
		return g_textOutlineColor;
	},
	// put all the data to be saved into a object (to be converted in JSON)
	packInfo : function(obj){
		try{
			if(obj == undefined)
				obj = new Object();
			this._super(obj);
			obj.fontSize = this.fontSize;
			obj.hasCustomPosition = this.hasCustomPosition;
			obj.baseline = this.baseline;
			obj.textAlign = this.textAlign;
			obj.fontFamily = this.fontFamily;
			obj.textColor = this.textColor;
			obj.nodeVisible = this.nodeVisible;
			obj.basePtX = this.basePt.x;
			obj.basePtY = this.basePt.y;
			obj.textlines = this.textlines.join('\n');
			obj.hasCustomFontSize = this.hasCustomFontSize;
			obj.hasCustomFontFamily = this.hasCustomFontFamily;
		}
		catch(error){
			displayError(error);
		}
		return obj;
	},
	// load the info about the caption from JSON obj
	fromJSON: function(obj){
		this._super(obj);
		this.fontSize = obj.fontSize;
		this.hasCustomPosition = obj.hasCustomPosition;
		this.textlines = obj.textlines.split('\n');
		this.fontSize = obj.fontSize;
		this.hasCustomPosition = obj.hasCustomPosition;
		this.baseline = obj.baseline;
		this.textAlign = obj.textAlign;
		this.fontFamily = obj.fontFamily;
		this.textColor = obj.textColor;
		this.nodeVisible = obj.nodeVisible;
		this.basePt.x = obj.basePtX;
		this.basePt.y = obj.basePtY;
		this.textlines = obj.textlines.split('\n');
		this.hasCustomFontSize = obj.hasCustomFontSize;
		this.hasCustomFontFamily = obj.hasCustomFontFamily;
	},
	toXML : function($n){
		this._super($n);
		//case 5959
		newXMLNode('BasePt').html('<X>'+(this.basePt.x)+'</X><Y>'+(this.basePt.y)+'</Y>').appendTo($n);

		newXMLNode('TextAlign').html(this.textAlign).appendTo($n);
		newXMLNode('BaseLine').html(this.baseline).appendTo($n);
		newXMLNode('HasCustomPosition').html(this.hasCustomPosition).appendTo($n);
		newXMLNode('IsCustomFontSize').html(this.isCustomFontSize).appendTo($n);
		newXMLNode('FontSize').html(this.fontSize ).appendTo($n);
		newXMLNode('FontFamily').html(this.fontFamily ).appendTo($n);
		newXMLNode('PixelSize').html(this.pixelSize).appendTo($n);
		newXMLNode('Text').html(formatStrToXML(this.textlines.join('\n'))).appendTo($n);
		newXMLNode('CustomFontSize').html(this.hasCustomFontSize).appendTo($n);
		newXMLNode('CustomFontFamily').html(this.hasCustomFontFamily).appendTo($n);
	},
	fromXML: function($n){
		this._super($n);
		this.basePt.x = parseFloat($n.children('BasePt').children('X').text());
		this.basePt.y = parseFloat($n.children('BasePt').children('Y').text());
		this.textAlign = $n.children('TextAlign').text();
		this.baseline = $n.children('BaseLine').text();
		this.isCustomFontSize = $n.children('IsCustomFontSize').text() == 'true';
		this.pixelSize = parseFloat($n.children('PixelSize').text());
		this.hasCustomPosition = $n.children('HasCustomPosition').text() == 'true';
		this.fontSize = _safeNumParse($n.children('FontSize').text(),12);
		this.fontFamily = $n.children('FontFamily').text();
		this.text = formatStrFromXML($n.children('Text').text());
		this.textlines = this.text.split("\n");
		this.incChangeCount();
		this.hasCustomFontSize = $n.children('CustomFontSize').text() == 'true';
		this.hasCustomFontFamily = $n.children('CustomFontFamily').text() == 'true';
	},
	getText: function(){
		return this.textlines.join('\n');
	},
	setFontSize: function(newFS){
		if(this.fontSize == newFS) return false;

		newFS = Math.max(5, newFS);
		this.incChangeCount();
		this.fontSize = newFS;
		this.resetDisplaySize();
		this.hasCustomFontSize = this.fontSize != g_fontSize;
	},
	addLine : function(l){
		this.textlines.push(l);
		this.incChangeCount();
	},
	clear : function(){
		this.textlines.length = 0;
		this.resetDisplaySize();
		this.incChangeCount();
	},
	getTextDisplayHeight : function(){
		return this.textlines.length * parseFloat(this.getFontSize());
	},
	getLineHeight: function(){
		return parseFloat(this.getFontSize());
	},
	getTextDim : function(cnv){
		if(cnv == undefined)
			console.log('NotDefined');

		var maxWidth = 0;
		var ctx = cnv.getContext('2d');
		ctx.textAlign = this.textAlign;
		ctx.font = 'bold ' + this.getFontSize() +"px " + this.getFontFamily();
		var cHeight = 0;
		var i = 0;
		var maxI = -1;
		var maxChar = -1;
		var str = null;
		while(i < this.textlines.length){
			str = this.textlines[i];
			if(str == null){
				i++;
				continue;
			}
			if (maxChar < str.length){
				maxI = i;
				maxChar = this.textlines[i].length;
			}
			i++;
		}
		maxWidth = ctx.measureText(this.textlines[maxI]).width;
		return new rect(0,0, maxWidth, this.getTextHeight() * this.textlines.length);
	},
	resetUpdateBoundsFlag: function(){
		$(this).trigger('onUpdateBoundsFlag');
	},
	getTextHeight: function() {
		 /* var text = $('<span style="font: ' + this.fontFamily + ' ' + this.fontSize + 'px">Hg</span>');
		  var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');
		  var div = $('<div></div>');
		  div.append(text, block);
		  var body = $('body');
		  body.append(div);
			var result = {};
			block.css({ verticalAlign: 'baseline' });
			result.ascent = block.offset().top - text.offset().top;
			block.css({ verticalAlign: 'bottom' });
			result.height = block.offset().top - text.offset().top;
			result.descent = result.height - result.ascent;
			div.remove();*/
		  return this.getFontSize() + 0.2*(this.getFontSize() - 10);//result.height;
	},
	moveTo : function(umPt){
		this.incChangeCount();
		var offsetPt;
		if((this.mouseDownPointUm != undefined) && (this.mouseDownPointUm != null)){
			offsetPt = this.mouseDownPointUm;
		}
		// Take Center
		else{
			offsetPt = this.basePt;
		}
		var delta = new TAtlasPoint(offsetPt.x - umPt.x, offsetPt.y - umPt.y);
		this.basePt.x = this.basePt.x - delta.x;
		this.basePt.y = this.basePt.y - delta.y;

		if(this.mouseDownPointUm != undefined){
			this.mouseDownPointUm.x -= delta.x;
			this.mouseDownPointUm.y -= delta.y;
		}
		this.resetUpdateBoundsFlag();
	},
	moveBy: function(umPtDelta){
		this.basePt.x = this.basePt.x + umPtDelta.x;
		this.basePt.y = this.basePt.y + umPtDelta.y;
	},
	getFontSize: function(){
		if(this.hasCustomFontSize) return this.fontSize;
		else return g_fontSize;
	},
	getFontFamily: function(){
		if(this.hasCustomFontFamily) return this.fontFamily;
		else return g_fontFamily;
	}
});



// Add the HTML code to the body of the application

/*
<!-- Begin Annotation Form -->
<div id='annotationForm' class='aDialog' title='Annotation Properties'>
	<input type="hidden" class='newMeasurement' value=false/>
</div>
<!-- End of Annotation Form -->
 */
