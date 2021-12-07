//  This code is distributed under the included license agreement, also
//  available here: http://go.microsoft.com/fwlink/?LinkId=164943

(function() {
    
    // DUPLICATION CHECK -- necessary to prevent overwriting user changes
    if (Seadragon.Config) {
        return;
    }

    Seadragon.Config = {
        
        debugMode: false,
        
        animationTime: 1.5,
        
        blendTime: 0.5,
        
        alwaysBlend: false,
        
        autoHideControls: true,
        
        immediateRender: false,
        
        wrapHorizontal: false,
        
        wrapVertical: false,
        
        wrapOverlays: false,
        
        // experimental feature -- this gives subpixel precision to overlays in
        // browsers that support CSS transforms, but changes the behavior from
        // previous and from browsers that don't support CSS transforms.
        transformOverlays: false,
        
        // for backwards compatibility, keeping this around and defaulting to null.
        // if it ever has a non-null value, that means it was explicitly set.
        minZoomDimension: null,
        
        minZoomImageRatio: 0.8,
        
        maxZoomPixelRatio: 3,
        
        visibilityRatio: 0.5,
        
        springStiffness: 5.0,
        
        imageLoaderLimit: 2, 
        
        clickTimeThreshold: 200,
        
        clickDistThreshold: 5,
        
        zoomPerClick: 2.0,
        
        zoomPerScroll: 1.2,
        
        zoomPerSecond: 2.0,
        
        proxyUrl: null,
        
        imagePath: "img/"
        
    };

})();
