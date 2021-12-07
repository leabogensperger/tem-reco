// Waypoint
TWaypointState = {
	idle:0,
	move:1
};

g_waypointFontSize = 12;
g_waypointFont = 'Arial';

TWaypoint = TChangeCounted.extend({
	init: function(x, y, label, index, caption, description){
		this._super();
		this.pt = new Seadragon.Point(x,y);					// the position in μm
		//this.id = id;
		this.label = label;						// this is a letter A, B, C, D, etc...
		this.uid = guid();
		this.caption = caption;				// this is a string that hold a user specified text
		this.index = index;
		this.imgHTML = null;			// the overlay html (spot)
		this.captionHTML = null;			// the overlay html (caption)
		this.state = TWaypointState.idle;
		this.description = description;
		this.selected = false;
		this.visible = true;
		this.mouseDownPointUm = new Seadragon.Point(0,0);
		this.mouseDownRegistered = false;
		this.captionVisible = true;
		this.externalLink = null;
		this.locked = false;
	},
	setExternalLink : function(aLink){
		this.externalLink = aLink;
		this.incChangeCount();
	},
	hasExternalLink: function(){
		return !((this.externalLink == null) || (this.externalLink == ''));
	},
	hasCaption: function(){
		 return !((this.caption == null) || (this.caption == ''));
	},
	setDescription: function (aDesc){
		if(aDesc.length > g_waypointDescriptionLimit){
			aDesc = aDesc.substring(0, g_waypointDescriptionLimit);
		}
		this.description = aDesc;
		this.incChangeCount();
	},
	setLabel: function(sLabel){
		this.label = sLabel;
		this.incChangeCount();
	},
	setCaption: function(sCaption){
		this.caption = sCaption;
		this.incChangeCount();
	},
	setLocked: function(sLocked){
		this.locked = sLocked;
		this.incChangeCount();
		$(this).trigger('onSetLocked', [this]);
	},
	getCaptionSize: function(ctx){
		if(! this.hasCaption())
			return new rect(0, 0, 0, 0);
		ctx.textAlign = 'left';
		ctx.font = 'bold ' + g_waypointFontSize +"px " + g_waypointFont;
		var cHeight = 0;
		var i = 0;
		var w = ctx.measureText(this.caption).width;
		return new rect(0,0, w, g_waypointFontSize);
	},
	// Converts the ID to a letter for the glyph of the waypoint
	getLabel :function(){
		return this.label;  //String.fromCharCode(this.id + 65)
	},
	setXY : function(x,y){
		if(this.locked) return false;

		this.pt.x = x;
		this.pt.y = y;
		$(this).trigger('onChange', this);
		this.incChangeCount();
	},
	moveTo: function(umPt){
		if(this.locked) return false;

		var offsetPt;
		if(this.mouseDownRegistered){
			offsetPt = this.mouseDownPointUm;
		}
		// Take Center
		else{
			offsetPt = this.pt;
		}

		var delta = new TAtlasPoint(offsetPt.x - umPt.x, offsetPt.y - umPt.y);
		this.pt.x -= delta.x;
		this.pt.y -= delta.y;

		if(this.mouseDownRegistered){
			this.mouseDownPointUm.x -= delta.x;
			this.mouseDownPointUm.y -= delta.y;
		}
		this.incChangeCount();
		$(this).trigger('onChange', [this]);
	},
	moveBy: function(umPtdelta){
		if(this.locked) return false;
		//var toPt = new Seadragon.Point(this.pt.x + umPtdelta.x, this.pt.y + umPtdelta.y);
		this.pt.x += umPtdelta.x;
		this.pt.y += umPtdelta.y;
		this.incChangeCount();
		$(this).trigger('onChange', [this]);
	},
	fromJSON: function(aJSON){
		this.pt.x = aJSON.x;
		this.pt.y = aJSON.y;
		this.label = aJSON.label;
		this.uid = aJSON.uid;
		//this.id =  aJSON.id;
		this.caption = aJSON.caption;
		this.index = aJSON.index;
		this.externalLink = aJSON.externalLink;
		this.description = aJSON.description;
		this.locked = aJSON.locked;
		/*this.selected = false;
		this.visible = true;*/
	},
	toJSON: function(){
		var aJSON = new Object();
		aJSON.x = this.pt.x;
		//aJSON.id = this.id;
		aJSON.uid = this.uid;
		aJSON.y = this.pt.y;
		aJSON.label = this.label;
		aJSON.caption = this.caption;
		aJSON.index = this.index;
		aJSON.locked = this.locked;
		aJSON.description = this.description;
		aJSON.externalLink = this.externalLink;
		aJSON.captionVisible  = this.captionVisible;
		return aJSON;
	},
	toXML :function($n){
		//$("<id />").html(this.id).appendTo($n);
		$("<uid />").html(this.uid).appendTo($n);
		$("<x />").html(this.pt.x.toFixed(4)).appendTo($n);
		$("<y />").html(this.pt.y.toFixed(4)).appendTo($n);
		$("<wpcaption />").html(formatStrToXML(this.caption)).appendTo($n);
		$("<index />").html(this.index).appendTo($n);
		$("<wplabel />").html(this.label).appendTo($n);
		$("<captionvisible />").html(this.captionVisible).appendTo($n);
		$("<description />").html(formatStrToXML(this.description)).appendTo($n);
		$("<externallink />").html(this.externalLink).appendTo($n);
		$("<isvisible />").html(this.isVisible).appendTo($n);
		$("<locked />").html(this.locked).appendTo($n);
	},
	fromXML : function($n){
		var n = $n.children('uid');
		if(n != null) this.uid = n.text();
		var n = $n.children('x');
		if(n != null) this.pt.x = parseFloat(n.text());
		var n = $n.children('y');
		if(n != null) this.pt.y = parseFloat(n.text());
		var n = $n.children('wpcaption');
		if(n != null) this.caption = n.text();
		var n = $n.children('wplabel');
		if(n != null) this.label = n.text();
		var n = $n.children('index');
		if(n != null) this.index = n.text();
		var n = $n.children('captionvisible');
		if(n != null) this.captionVisible = n.text();
		var n = $n.children('description');
		if(n != null) this.description = n.text();
		var n = $n.children('isvisible');
		if(n != null) this.isvisible = n.text();
		var n = $n.children('externallink');
		if(n != null) this.externalLink = n.text();
		var n = $n.children('locked');
		if(n != null) this.locked = n.text();

		if((this.description != null) && (this.description != undefined))
			this.description = formatStrFromXML(this.description);
		if((this.caption != null) && (this.caption != undefined))
			this.caption = formatStrFromXML(this.caption);

		// make sure they are locked by default
		this.locked = this.locked || (G_MUSEUM_OF_NATURE && !G_DEBUG);

	},
	select: function(){
		this.selected = true;
		this.incChangeCount();
	},
	deselect: function(){
		this.selected = false;
		this.incChangeCount();
	},
	getPositionHTML: function(){
		return "<span>"+ this.pt.x.toFixed(3) + ", " + this.pt.y.toFixed(3) + " &mu;m</span>";
	},
	setVisible: function(f){
		this.visible = f;
		this.incChangeCount();
		$(this).trigger('onSetVisible', [this]);
	},
	setCaptionVisible: function(f){
		this.captionVisible = f;
		this.incChangeCount();
		$(this).trigger('onSetCaptionVisible', [this]);
	},
	hasExternalLink: function(){
		return ((this.externalLink != null) && (this.externalLink != undefined) && (this.externalLink != ''));
	}
});
