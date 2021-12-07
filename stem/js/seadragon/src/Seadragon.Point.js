//  This code is distributed under the included license agreement, also
//  available here: http://go.microsoft.com/fwlink/?LinkId=164943

(function() {

    Seadragon.Point = function(x, y) {
        
        // Properties
        
        this.x = typeof(x) == "number" ? x : 0;
        this.y = typeof(y) == "number" ? y : 0;
        
    };

    // Methods
    
    var SDPointPrototype = Seadragon.Point.prototype;

    SDPointPrototype.plus = function(point) {
        return new Seadragon.Point(this.x + point.x, this.y + point.y);
    };

    SDPointPrototype.minus = function(point) {
        return new Seadragon.Point(this.x - point.x, this.y - point.y);
    };

    SDPointPrototype.times = function(factor) {
        return new Seadragon.Point(this.x * factor, this.y * factor);
    };

    SDPointPrototype.divide = function(factor) {
        return new Seadragon.Point(this.x / factor, this.y / factor);
    };

    SDPointPrototype.negate = function() {
        return new Seadragon.Point(-this.x, -this.y);
    };

    SDPointPrototype.distanceTo = function(point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) +
                        Math.pow(this.y - point.y, 2));
    };

    SDPointPrototype.apply = function(func) {
        return new Seadragon.Point(func(this.x), func(this.y));
    };

    SDPointPrototype.equals = function(point) {
        return (point instanceof Seadragon.Point) &&
                (this.x === point.x) && (this.y === point.y);
    };

    SDPointPrototype.toString = function() {
        return "(" + this.x + "," + this.y + ")";
    };

})();