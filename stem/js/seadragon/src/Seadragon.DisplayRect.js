//  This code is distributed under the included license agreement, also
//  available here: http://go.microsoft.com/fwlink/?LinkId=164943

Seadragon.DisplayRect = function(x, y, width, height, minLevel, maxLevel) {
    
    // Inheritance
    
    Seadragon.Rect.apply(this, arguments);
    
    // Properties (extended)
    
    this.minLevel = minLevel;
    this.maxLevel = maxLevel;
    
};

Seadragon.DisplayRect.prototype = new Seadragon.Rect();
