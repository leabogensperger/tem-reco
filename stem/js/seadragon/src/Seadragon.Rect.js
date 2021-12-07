//  This code is distributed under the included license agreement, also
//  available here: http://go.microsoft.com/fwlink/?LinkId=164943

(function () {
		// x, y are top left corner
    Seadragon.Rect = function(x, y, width, height) {
        
        // Properties
        
        this.x = typeof(x) == "number" ? x : 0;
        this.y = typeof(y) == "number" ? y : 0;
        this.width = typeof(width) == "number" ? width : 0;
        this.height = typeof(height) == "number" ? height : 0;

    };
    
    // Methods
    
    var SDRectPrototype = Seadragon.Rect.prototype;
    
    SDRectPrototype.getAspectRatio = function() {
        return this.width / this.height;
    };
    
    SDRectPrototype.getTopLeft = function() {
        return new Seadragon.Point(this.x, this.y);
    };
    
    SDRectPrototype.getBottomRight = function() {
        return new Seadragon.Point(this.x + this.width, this.y + this.height);
    };
    
    SDRectPrototype.getCenter = function() {
        return new Seadragon.Point(this.x + this.width / 2.0,
                        this.y + this.height / 2.0);
    };
    
    SDRectPrototype.getSize = function() {
        return new Seadragon.Point(this.width, this.height);
    };
    
    SDRectPrototype.equals = function(other) {
        return (other instanceof Seadragon.Rect) &&
                (this.x === other.x) && (this.y === other.y) &&
                (this.width === other.width) && (this.height === other.height);
    };
    
    SDRectPrototype.toString = function() {
        return "[" + this.x + "," + this.y + "," + this.width + "x" +
                this.height + "]";
    };

})();