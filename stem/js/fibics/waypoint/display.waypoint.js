var g_externalLinkTextColor = '#999999';
var g_externalLinkBackgroundColor = '#ff0000';
//var g_waypointWidth = 23;
var g_waypointWidth = 32;
var g_waypointHeight = 32;
var g_waypointTextColor = '#ffffff';// "rgba(255, 255, 255, 1)";
var g_waypointTextOutlineColor = '#000000';//"rgba(0, 0, 0, 0.6)";
var g_waypointCaptionOffset = 19;
var g_waypointCaptionPadding = 5;
var g_waypointExternalLinkOffset = new Seadragon.Point(15, 0);


TDisplayWaypoint = Class.extend({
	init: function(WP){
		this.waypoint = WP;
		//this.imgURLSelected = false;
		this.imgObj = new Image();
		this.imgSelectedObj = new Image();
		var selectedImgURL =  './images/waypoints/nwp_s.png';
		var imgURL = './images/waypoints/nwp.png';

		this.imgSelectedObj.src =  selectedImgURL;
		this.imgObj.src = imgURL;
		this.isCreation = false;
		this.pointRegistered = new Seadragon.Point(0,0);
		this.wpChangeCount = -1;
		this.textCaption = new TTextDisplay(new Seadragon.Point(0,0), '', 12, 'Arial');
		this.textCaption.fontStyle = "bold";
		this.textCaption.textColor = g_waypointTextColor;
		this.textCaption.backgroundColor = g_waypointTextOutlineColor;
		this.textCaption.baseline = 'bottom';

		//label-text overlay for waypoint icon
		this.textIDLabel = new TTextDisplay(new Seadragon.Point(0,0), '', 12, 'Arial','center');
		this.textIDLabel.fontStyle = "bold";
		this.textIDLabel.textColor = g_waypointTextColor;
		this.textIDLabel.baseline = 'bottom';
		this.textIDLabel.type = 'iLabel';

		//this.textDisplayBounds = new rect(0,0,0,0);
		this.textDisplayPt = new Seadragon.Point(0,0);

		this.viewportUpdated = false;

		// Description Text
		this.descriptionDisplay =  new TTextDisplay(new Seadragon.Point(0,0), this.waypoint.description, G_WAYPOINT_DESCRIPTION_FONTSIZE, 'Arial');
		this.descriptionDisplay.textColor = g_waypointTextColor;
		this.descriptionDisplay.backgroundColor = g_waypointTextOutlineColor;
		this.descriptionDisplay.fontStyle = 'italic';

	},
	hitTest: function(pt, pSDConverter){
		if(!this.waypoint.visible) return false;
		var dPt = pSDConverter.pixelFromMicron(this.waypoint.pt);
		var isInsideIcon = (dPt.x - (g_waypointWidth/2)) <= pt.x;
		isInsideIcon = isInsideIcon && ((dPt.x + (g_waypointWidth/2)) >= pt.x ) ;
		isInsideIcon = isInsideIcon && (dPt.y >= pt.y);
		isInsideIcon = isInsideIcon && ((dPt.y - g_waypointHeight) <= pt.y);
		// check if in the link caption
		//insideLink = this.hitTestLink(pt);
		return isInsideIcon;// || insideLink;
	},
	draw: function(pSDConverter, cnv){
		var ctx = cnv.getContext('2d');
		if(!this.waypoint.visible) return false;
		this.update(pSDConverter, cnv);

		var imgToUse =  null;
		if(this.waypoint.selected)
			imgToUse = this.imgSelectedObj;
		else
			imgToUse = this.imgObj;

		if (imgToUse == null )
			return false;
		ctx.drawImage(imgToUse, (this.displayPt.x - (g_waypointWidth/2)), this.displayPt.y - (g_waypointHeight));

		// Description Drawing
		if(this.waypoint.selected && this.waypoint.captionVisible){
			this.descriptionDisplay.draw(pSDConverter, cnv);
		}

		/// Draw the label
		if(this.waypoint.captionVisible){
			this.textCaption.draw(pSDConverter, cnv);
		}

		/// Draw the label-id text
		this.textIDLabel.draw(pSDConverter, cnv);
	},
	registerPoint: function(pt, pSDConverter){
		if(pSDConverter != undefined){
			var umpt = pSDConverter.micronFromPixel(pt);
			this.waypoint.mouseDownPointUm.x = umpt.x;
			this.waypoint.mouseDownPointUm.y = umpt.y;
		}
		this.pointRegistered.x = pt.x;
		this.pointRegistered.y = pt.y;
		this.waypoint.mouseDownRegistered = true;
	},
	mousedown: function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt);
		switch(this.waypoint.state){
			case TWaypointState.idle:
				if(this.hitTest(pt, pSDConverter)){
					this.waypoint.state = TWaypointState.move;
					this.registerPoint(pt, pSDConverter);
				}
			break;
		}
	},
	mouseup: function(e, pt, pSDConverter){
		this.unregisterPoint();
		this.waypoint.state = TWaypointState.idle;
		// check if it realase on the link
		/*if(this.hitTestLink(pt)){
			if(this.waypoint.hasExternalLink())
			OpenLinkInNewWindow(this.waypoint.externalLink,  'Region' + this.waypoint.uid);
		}*/
	},
	mousemove: function(e, pt, pSDConverter){
		var umPt = pSDConverter.micronFromPixel(pt);
		switch(this.waypoint.state){
			case TWaypointState.idle:
			break;
			case TWaypointState.move:
				this.waypoint.moveTo(umPt);
			break;
		}
	},
	dblclick: function(e, pt, pSDConverter){

	},
	unregisterPoint : function(){
		this.waypoint.mouseDownRegistered = false;
	},
	update: function(pSDConverter, pCNV){
		if ((this.wpChangeCount != this.waypoint.changeCount) || ( this.viewportUpdated )) {
			var extH = 10;
			var captionH = 0;
			this.displayPt = pSDConverter.pixelFromMicron(this.waypoint.pt, true);
			this.textCaption.text = this.waypoint.caption;
			this.textCaption.update(new Seadragon.Point(this.displayPt.x + g_waypointCaptionOffset, this.displayPt.y - g_waypointCaptionOffset + g_waypointCaptionPadding), pSDConverter, pCNV);


			//draw wp label-id text
			this.textIDLabel.text = this.waypoint.getLabel();
			this.textIDLabel.update(new Seadragon.Point(this.displayPt.x - (g_waypointCaptionPadding)+1, this.displayPt.y - 11), pSDConverter, pCNV);


			this.descriptionDisplay.text = this.waypoint.description;
			this.descriptionDisplay.update(new Seadragon.Point(this.displayPt.x + g_waypointCaptionOffset, this.displayPt.y - (g_waypointCaptionPadding) + 2), pSDConverter, pCNV);
			this.wpChangeCount = this.waypoint.changeCount;
			this.viewportUpdated = false;
		}
	},
	getCursor: function(pt){
		/*if(this.hitTestLink(pt))
			return g_cursorWaypointLink;*/
		return g_cursorWaypointHand;
	}
});
