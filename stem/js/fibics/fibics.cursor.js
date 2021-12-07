/*

	The Fibics cursor can be of 2 types:
		- Default windows cursor
		- An image

	When the type is windows, the img proprety is is the name the cursor.
	When the type is custom, the img property is the url to some image ( the windows cursor is set to none )
	Because of the problem of local files cannot be used to display custom cursors, 
		we use the canvas to draw the image.
			
*/



TFibicsCursor = function(aType, aImg, sWindowsAlternative,  offx, offy ){
		this.type = aType;  // windows or custom		
		
		if(this.type == 'windows'){
			this.img = aImg;
			this.windowsCursor = aImg;
		}
		else{
			this.img = new Image();
			this.windowsCursor = sWindowsAlternative;
			this.img.src = aImg;
		}
		this.offset = new Seadragon.Point(0,0);
		if(offx != undefined)
			this.offset.x = offx;
		if(offy != undefined)
			this.offset.y = offy; 
}



// Create all the global cursor
g_cursorWaypointHand = new TFibicsCursor('custom', 'images/cursors/over_waypoint_cursor.png', '',  -5, 0 );
g_cursorWaypointLink = new TFibicsCursor('custom', 'images/cursors/over_waypoint_link_cursor.png', 'pointer' -5, 0 );
g_cursorLink = new TFibicsCursor('windows', 'pointer', 'pointer', 0,0);
g_cursorPan = new TFibicsCursor('windows', 'grab', 'grab', 0,0);
g_cursorPanning = new TFibicsCursor('windows', 'grabbing', 'grabbing', 0,0);
g_cursorOverShape = new TFibicsCursor('custom', 'images/cursors/over_shapes.png','move', -5, 0 );

