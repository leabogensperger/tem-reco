//  This code is distributed under the included license agreement, also
//  available here: http://go.microsoft.com/fwlink/?LinkId=164943

Seadragon.Viewport = function(containerSize, contentSize) {
    
    // Fields
    
    var self = this;
    
    var containerSize = new Seadragon.Point(containerSize.x, containerSize.y); // copy
    var contentAspect = contentSize.x / contentSize.y;
    var contentHeight = contentSize.y / contentSize.x;
    
    var centerSpringX = new Seadragon.Spring(0);
    var centerSpringY = new Seadragon.Spring(0);
    var zoomSpring = new Seadragon.Spring(1);
    var zoomPoint = null;
    
    var homeBounds = new Seadragon.Rect(0, 0, 1, contentHeight);
    
    // Helpers
    
    function init() {
        self.goHome(true);
        self.update();
    }
    
    function getHomeZoom() {
        var aspectFactor = contentAspect / self.getAspectRatio();
        // if content is wider, we'll fit width, otherwise height
        return (aspectFactor >= 1) ? 1 : aspectFactor;
    }
    
    function getMinZoom() {
        var homeZoom = getHomeZoom();
        
        // for backwards compatibility, respect minZoomDimension if present
        if (Seadragon.Config.minZoomDimension) {
            var zoom = (contentSize.x <= contentSize.y) ?
                Seadragon.Config.minZoomDimension / containerSize.x :
                Seadragon.Config.minZoomDimension / (containerSize.x * contentHeight);
        } else {
            var zoom = Seadragon.Config.minZoomImageRatio * homeZoom;
        }
        
        return Math.min(zoom, homeZoom);
    }
    
    function getMaxZoom() {
        var zoom = contentSize.x * Seadragon.Config.maxZoomPixelRatio / containerSize.x;
        return Math.max(zoom, getHomeZoom());
    }
    
    // Methods -- ACCESSORS
    
    this.getAspectRatio = function() {
        return containerSize.x / containerSize.y;
    };
    
    this.getContainerSize = function() {
        return new Seadragon.Point(containerSize.x, containerSize.y);
    };
    
    this.getBounds = function(current) {
        var center = self.getCenter(current);
        var width = 1.0 / self.getZoom(current);
        var height = width / self.getAspectRatio();
        
        return new Seadragon.Rect(center.x - width / 2.0, center.y - height / 2.0,
            width, height);
    };
    
    this.getCenter = function(current) {
        var centerCurrent = new Seadragon.Point(centerSpringX.getCurrent(),
                centerSpringY.getCurrent());
        var centerTarget = new Seadragon.Point(centerSpringX.getTarget(),
                centerSpringY.getTarget());
        
        if (current) {
            return centerCurrent;
        } else if (!zoomPoint) {
            // no adjustment necessary since we're not zooming
            return centerTarget;
        }
        
        // to get the target center, we need to adjust for the zoom point.
        // we'll do this in the same way as the update() method.
        var oldZoomPixel = self.pixelFromPoint(zoomPoint, true);
        
        // manually calculate bounds based on this unadjusted target center.
        // this is mostly a duplicate of getBounds() above. note that this is
        // based on the TARGET zoom but the CURRENT center.
        var zoom = self.getZoom();
        var width = 1.0 / zoom;
        var height = width / self.getAspectRatio();
        var bounds = new Seadragon.Rect(centerCurrent.x - width / 2.0,
                centerCurrent.y - height / 2.0, width, height);
        
        // the conversions here are identical to the pixelFromPoint() and
        // deltaPointsFromPixels() methods.
        var newZoomPixel = zoomPoint.minus(bounds.getTopLeft()).times(containerSize.x / bounds.width);
        var deltaZoomPixels = newZoomPixel.minus(oldZoomPixel);
        var deltaZoomPoints = deltaZoomPixels.divide(containerSize.x * zoom);
        
        // finally, shift center to negate the change.
        return centerTarget.plus(deltaZoomPoints);
    };
    
    this.getZoom = function(current) {
        if (current) {
            return zoomSpring.getCurrent();
        } else {
            return zoomSpring.getTarget();
        }
    };
    
    // Methods -- MODIFIERS
    
    this.applyConstraints = function(immediately) {
        // first, apply zoom constraints
        var actualZoom = self.getZoom();
        var constrainedZoom = Math.max(Math.min(actualZoom, getMaxZoom()), getMinZoom());
        if (actualZoom != constrainedZoom) {
            self.zoomTo(constrainedZoom, zoomPoint, immediately);
        }
        
        // then, apply pan constraints
        var bounds = self.getBounds();
        var visibilityRatio = Seadragon.Config.visibilityRatio;
        
        // threshold in normalized coordinates
        var horThres = visibilityRatio * bounds.width;
        var verThres = visibilityRatio * bounds.height;
        
        // amount visible in normalized coordinates
        var left = bounds.x + bounds.width;
        var right = 1 - bounds.x;
        var top = bounds.y + bounds.height;
        var bottom = contentHeight - bounds.y;
        
        // adjust viewport horizontally -- in normalized coordinates!
        var dx = 0;
        if (Seadragon.Config.wrapHorizontal) {
            // nothing to constrain
        } else if (left < horThres) {
            dx = horThres - left;
        } else if (right < horThres) {
            dx = right - horThres;
        }
        
        // adjust viewport vertically -- in normalized coordinates!
        var dy = 0;
        if (Seadragon.Config.wrapVertical) {
            // nothing to constrain
        } else if (top < verThres) {
            dy = verThres - top;
        } else if (bottom < verThres) {
            dy = bottom - verThres;
        }
        
        // pan if we aren't zooming, otherwise set the zoom point if we are.
        // we've already implemented logic in fitBounds() for this.
        if (dx || dy) {
            bounds.x += dx;
            bounds.y += dy;
            self.fitBounds(bounds, immediately);
        }
    };
    
    this.ensureVisible = function(immediately) {
        // for backwards compatibility
        self.applyConstraints(immediately);
    };
    
    this.fitBounds = function(bounds, immediately) {
        var aspect = self.getAspectRatio();
        var center = bounds.getCenter();
        
        // resize bounds to match viewport's aspect ratio, maintaining center.
        // note that zoom = 1/width, and width = height*aspect.
        var newBounds = new Seadragon.Rect(bounds.x, bounds.y, bounds.width, bounds.height);
        if (newBounds.getAspectRatio() >= aspect) {
            // width is bigger relative to viewport, resize height
            newBounds.height = bounds.width / aspect;
            newBounds.y = center.y - newBounds.height / 2;
        } else {
            // height is bigger relative to viewport, resize width
            newBounds.width = bounds.height * aspect;
            newBounds.x = center.x - newBounds.width / 2;
        }
        
        // stop movement first! this prevents the operation from missing
        self.panTo(self.getCenter(true), true);
        self.zoomTo(self.getZoom(true), null, true);
        
        // capture old values for bounds and width. we need both, but we'll
        // also use both for redundancy, to protect against precision errors.
        // note: use target bounds, since update() hasn't been called yet!
        var oldBounds = self.getBounds();
        var oldZoom = self.getZoom();
        
        // if we're already at the correct zoom, just pan and we're done.
        // we'll check both zoom and bounds for redundancy, to protect against
        // precision errors (see note below).
        var newZoom = 1.0 / newBounds.width;
        if (newZoom == oldZoom || newBounds.width == oldBounds.width) {
            self.panTo(center, immediately);
            return;
        }
        
        // otherwise, we need to zoom about the only point whose pixel transform
        // is constant between the old and new bounds. this is just tricky math.
        var refPoint = oldBounds.getTopLeft().times(containerSize.x / oldBounds.width).minus(
                newBounds.getTopLeft().times(containerSize.x / newBounds.width)).divide(
                containerSize.x / oldBounds.width - containerSize.x / newBounds.width);
        
        // note: that last line (cS.x / oldB.w - cS.x / newB.w) was causing a
        // divide by 0 in the case that oldBounds.width == newBounds.width.
        // that should have been picked up by the zoom check, but in certain
        // cases, the math is slightly off and the zooms are different. so now,
        // the zoom check has an extra check added.
        
        self.zoomTo(newZoom, refPoint, immediately);
    };
   
    this.goHome = function(immediately) {
        // calculate center adjusted for zooming
        var center = self.getCenter();
        
        // if we're wrapping horizontally, "unwind" the horizontal spring
        if (Seadragon.Config.wrapHorizontal) {
            // this puts center.x into the range [0, 1) always
            center.x = (1 + (center.x % 1)) % 1;
            centerSpringX.resetTo(center.x);
            centerSpringX.update();
        }
        
        // if we're wrapping vertically, "unwind" the vertical spring
        if (Seadragon.Config.wrapVertical) {
            // this puts center.y into the range e.g. [0, 0.75) always
            center.y = (contentHeight + (center.y % contentHeight)) % contentHeight;
            centerSpringY.resetTo(center.y);
            centerSpringY.update();
        }
        
        self.fitBounds(homeBounds, immediately);
    };
    
    this.panBy = function(delta, immediately) {
        // this breaks if we call self.getCenter(), since that adjusts the
        // center for zoom. we don't want that, so use the unadjusted center.
        var center = new Seadragon.Point(centerSpringX.getTarget(),
                centerSpringY.getTarget());
        self.panTo(center.plus(delta), immediately);
    };
    
    this.panTo = function(center, immediately) {
        if (immediately) {
            centerSpringX.resetTo(center.x);
            centerSpringY.resetTo(center.y);
        } else {
            centerSpringX.springTo(center.x);
            centerSpringY.springTo(center.y);
        }
    };
    
    this.zoomBy = function(factor, refPoint, immediately) {
        self.zoomTo(zoomSpring.getTarget() * factor, refPoint, immediately);
    };
    
    this.zoomTo = function(zoom, refPoint, immediately) {
        // we used to constrain zoom automatically here; now it needs to be
        // explicitly constrained, via applyConstraints().
        //zoom = Math.max(zoom, getMinZoom());
        //zoom = Math.min(zoom, getMaxZoom());
        
        if (immediately) {
            zoomSpring.resetTo(zoom);
        } else {
            zoomSpring.springTo(zoom);
        }
        
        zoomPoint = refPoint instanceof Seadragon.Point ? refPoint : null;
    };
    
    this.resize = function(newContainerSize, maintain) {
        // default behavior: just ensure the visible content remains visible.
        // note that this keeps the center (relative to the content) constant.
        var oldBounds = self.getBounds();
        var newBounds = oldBounds;
        var widthDeltaFactor = newContainerSize.x / containerSize.x;
        
        // update container size, but make copy first
        containerSize = new Seadragon.Point(newContainerSize.x, newContainerSize.y);
        
        if (maintain) {
            // no resize relative to screen, resize relative to viewport.
            // keep origin constant, zoom out (increase bounds) by delta factor.
            newBounds.width = oldBounds.width * widthDeltaFactor;
            newBounds.height = newBounds.width / self.getAspectRatio(); 
        }
        
        self.fitBounds(newBounds, true);
    };
    
    this.update = function() {
        var oldCenterX = centerSpringX.getCurrent();
        var oldCenterY = centerSpringY.getCurrent();
        var oldZoom = zoomSpring.getCurrent();
        
        // remember position of zoom point
        if (zoomPoint) {
            var oldZoomPixel = self.pixelFromPoint(zoomPoint, true);
        }
        
        // now update zoom only, don't update pan yet
        zoomSpring.update();
        
        // adjust for change in position of zoom point, if we've zoomed
        if (zoomPoint && zoomSpring.getCurrent() != oldZoom) {
            var newZoomPixel = self.pixelFromPoint(zoomPoint, true);
            var deltaZoomPixels = newZoomPixel.minus(oldZoomPixel);
            var deltaZoomPoints = self.deltaPointsFromPixels(deltaZoomPixels, true);
            
            // shift pan to negate the change
            centerSpringX.shiftBy(deltaZoomPoints.x);
            centerSpringY.shiftBy(deltaZoomPoints.y);
        } else {
            // don't try to adjust next time; this improves performance
            zoomPoint = null;
        }
        
        // now after adjustment, update pan
        centerSpringX.update();
        centerSpringY.update();
        
        return centerSpringX.getCurrent() != oldCenterX ||
                centerSpringY.getCurrent() != oldCenterY ||
                zoomSpring.getCurrent() != oldZoom;
    };
    
    // Methods -- CONVERSION HELPERS
    
    this.deltaPixelsFromPoints = function(deltaPoints, current) {
        return deltaPoints.times(containerSize.x * self.getZoom(current));
    };
    
    this.deltaPointsFromPixels = function(deltaPixels, current) {
        return deltaPixels.divide(containerSize.x * self.getZoom(current));
    };
    
    this.pixelFromPoint = function(point, current) {
        var bounds = self.getBounds(current);
        return point.minus(bounds.getTopLeft()).times(containerSize.x / bounds.width);
    };
    
    this.pointFromPixel = function(pixel, current) {
        var bounds = self.getBounds(current);
        return pixel.divide(containerSize.x / bounds.width).plus(bounds.getTopLeft());
    };
    
    // Constructor
    
    init();
    
};
