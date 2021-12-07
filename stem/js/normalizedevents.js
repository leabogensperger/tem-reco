/**************************************
**
**	This file should be used if you want the touch events and the mouse events to behave the same way.
**		By that we mean that you can map a single event callback that will be called on the touchdown and mousedown events.
**
**		Examples:
**				if you want your application to do something on mouse up and on touchUp (touch event),
**				you would need to register 2 callbacks:
**					$('#yourDOM').mouseup(...);
**					$('#yourDOM').touchstart(...);
**
**
**				you can now just do a single callback using the TouchMouseEvent:
					$('#yourDOM').on(TouchMouseEvent.UP, function(){
																												});
**
**
**
**
****************************************/


TouchMouseEvent = {
        DOWN: "touchmousedown",
        UP: "touchmouseup",
        MOVE: "touchmousemove"};
// declaration of global variable.
var onMouseEvent;
var normalizeEvent;
var onTouchEvent;
var jQueryDocument;

// the definition of the events needs to be incapsulated in the $(document).ready() since it makes use of the $()
// the errors were not always showing, but QBaka had it happened thousands of times...

$(document).ready(function(){

	onMouseEvent = function(event) {
   var type;
	    switch (event.type) {
				case "mousedown": type = TouchMouseEvent.DOWN; break;
				case "mouseup":   type = TouchMouseEvent.UP;   break;
				case "mousemove": type = TouchMouseEvent.MOVE; break;
				default:
						return;
     }
     var touchMouseEvent = normalizeEvent(type, event, event.pageX, event.pageY);
     $(event.target).trigger(touchMouseEvent);
    }


	normalizeEvent = function(type, original, x, y) {
        return $.Event(type, {
            pageX: x,
            pageY: y,
            originalEvent: original
        });
    }

	onTouchEvent = function(event) {
        var type;

        switch (event.type) {
            case "touchstart": type = TouchMouseEvent.DOWN; break;
            case "touchend":   type = TouchMouseEvent.UP;   break;
						case "touchmove":  type = TouchMouseEvent.MOVE; break;
            default:{
							  debugLog('other touch');
								$(event.target).trigger(event);
								return;
						}

        }

        var touch = event.originalEvent.touches[0];
        var touchMouseEvent;

        if (type == TouchMouseEvent.UP)
          touchMouseEvent = normalizeEvent(type, event, null, null);
        else
          touchMouseEvent = normalizeEvent(type, event, touch.pageX, touch.pageY);

        $(event.target).trigger(touchMouseEvent);
			// cannot prevent default, since it breaks the normal behavior of the JqueryUI components...
			//	event.preventDefault();
    }

	jQueryDocument = $(document);

    G_MOUSE_ENABLED_DEVICE = true;

    if ("ontouchstart" in window) {
        G_MOUSE_ENABLED_DEVICE = false;
        jQueryDocument.on("touchstart", onTouchEvent);
        jQueryDocument.on("touchmove", onTouchEvent);
        jQueryDocument.on("touchend", onTouchEvent);
        //register mouse also
        if (!!('onmousemove' in window)) {
            G_MOUSE_ENABLED_DEVICE = true;
            jQueryDocument.on("mousedown", onMouseEvent);
            jQueryDocument.on("mouseup", onMouseEvent);
            jQueryDocument.on("mousemove", onMouseEvent);
        }
	} else {
        jQueryDocument.on("mousedown", onMouseEvent);
        jQueryDocument.on("mouseup", onMouseEvent);
        jQueryDocument.on("mousemove", onMouseEvent);
	}
});


function mousetouchdown_event() {
    return (G_MOUSE_ENABLED_DEVICE?'click':TouchMouseEvent.DOWN);
}
