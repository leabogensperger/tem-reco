function inflateRect(r, hm){
	r.x = r.x - hm/2;
	r.y = r.y - hm/2;
	r.width = r.width + hm;
	r.height = r.height + hm;
}

function distance(a, b){
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	return Math.sqrt(dx*dx + dy*dy);
}

function isDefined(obj){
	return (obj != undefined) && (obj != null);
}

function getIntersectionRectSegment(R, Sg, direction){

	// First check if one of the Pt of th segment is inside the rectangle
	if((!R.hitTest(Sg.a)) && (!R.hitTest(Sg.b)))
		return null;

	if(R.hitTest(Sg.a))
		hPt = Sg.a;
	else
		hPt = Sg.b;

	if((Sg.b.x - Sg.a.x) == 0)
		var mSg = (Sg.b.y - Sg.a.y)/(0.0001);
	else
		var mSg = (Sg.b.y - Sg.a.y)/(Sg.b.x - Sg.a.x);

	var bSg = Sg.b.y - (mSg*Sg.b.x);

	result = new TAtlasPoint(0,0);
	var a = 360*Sg.angle()/(2*Math.PI);

	if((a > 135) || ( a < -135)){
		if(direction){
			result.x = R.x + R.width;
			result.y = mSg*result.x + bSg;
		}
		else{
			result.x = R.x;
			result.y = mSg*result.x + bSg;
		}
	}
	else if((a > 45) && ( a < 135)){
		if(direction){
			result.y = R.y;
			if(mSg == 0){
				result.x = Sg.b.x;
			}
			else
				result.x = (result.y - bSg)/mSg;
		}
		else{
			result.y = R.y + R.height;
			if(mSg == 0){
				result.x = Sg.b.x;
			}
			else
				result.x = (result.y - bSg)/mSg;
		}
	}
	else if((a > -45) && (a < 45)){
		if(direction){
			result.x = R.x;
			result.y = mSg*result.x + bSg;
		}
		else{
			result.x = R.x + R.width;
			result.y = mSg*result.x + bSg;
		}
	}
	else{
		if(direction){
			result.y = R.y + R.height;
			if(mSg == 0){
				result.x = Sg.b.x;
			}
			else
				result.x = (result.y - bSg)/mSg;
		}
		else{
			result.y = R.y;
			if(mSg == 0){
				result.x = Sg.b.x;
			}
			else
				result.x = (result.y - bSg)/mSg;
		}
	}

	if(result.y < R.y) result.y = R.y;
	if(result.y > (R.y + R.height)) result.y = R.y + R.height;
	if(result.x < R.x) result.x = R.x;
	if(result.x > (R.x + R.width)) result.x = R.x + R.width;

	return result;
}

function distanceFromLine(a, b, pt) {
	var xDelta = b.x - a.x;
	var yDelta = b.y - a.y;
	if ((Math.abs(xDelta) < 0.01) || (Math.abs(yDelta) < 0.01)) {
		// if vertical
		if(xDelta < 0.01){
			if((Math.abs(pt.x - b.x) < 10 )
						&& ((pt.y < Math.max(b.y, a.y))
										&& (pt.y > Math.min(b.y, a.y)))){
					return 	Math.abs(pt.x - b.x);
			}
		}
		// Horizontal Line
		else if(yDelta < 0.01){
			if((Math.abs(pt.y - b.y) < 10 )
						&& ((pt.x < Math.max(b.x, a.x))
										&& (pt.x > Math.min(b.x, a.x)))){
					return 	Math.abs(pt.y - b.y);
			}
		}
	}
	var u = ((pt.x - a.x) * xDelta + (pt.y - a.y) * yDelta) / (xDelta * xDelta + yDelta * yDelta);

	if (u <0) 	closestPoint = new TAtlasPoint(a.x, a.y);
	else if (u> 1)	 closestPoint = new TAtlasPoint(b.x, b.y);
	else closestPoint = new TAtlasPoint(a.x + u * xDelta, a.y + u * yDelta);
	return closestPoint.distanceFrom(new TAtlasPoint(pt.x, pt.y));
}


var TReferencePoint = {rpCenter:0,
		rpTopLeft:1,
		rpTopCenter:2,
		rpTopRight:3,
		rpCenterLeft:4,
		rpCenterRight:5,
		rpBottomLeft:6,
		rpBottomCenter:7,
		rpBottomRight:8};
