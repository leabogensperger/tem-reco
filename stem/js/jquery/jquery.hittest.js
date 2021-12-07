/*
 * jQuery "hitTest" plugin
 * @warning: does not work with elements that are "display:hidden"
 * @param {Number} x The x coordinate to test for collision
 * @param {Number} y The y coordinate to test for collision
 * @return {Boolean} True if the given jQuery object's rectangular bounds contain the point defined by params x,y
 */
(function($){
    $.fn.hitTest = function(x, y){
        var bounds = this.offset();
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();
        return x >= bounds.left
        	&& x <= bounds.right
            && y >= bounds.top
            && y <= bounds.bottom;
    };
})(jQuery);