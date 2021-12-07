//  This code is distributed under the included license agreement, also
//  available here: http://go.microsoft.com/fwlink/?LinkId=164943

Seadragon.Debug = function() {
    
    // Methods
    
    this.log = function(msg, important) {
        var console = window.console || {};
        var debug = Seadragon.Config.debugMode;
        
        if (debug && console.log) {
            console.log(msg);
        } else if (debug && important) {
            alert(msg);
        }
    };
    
    this.error = function(msg, e) {
        var console = window.console || {};
        var debug = Seadragon.Config.debugMode;
        
        if (debug && console.error) {
            console.error(msg);
        } else if (debug) {
            alert(msg);
        }
        
        if (debug) {
            // since we're debugging, fail fast by crashing
            throw e || new Error(msg);
        }
    };
    
    this.fail = function(msg) {
        alert(Seadragon.Strings.getString("Errors.Failure"));
        throw new Error(msg);
    };
    
};

// Seadragon.Debug is a static class, so make it singleton instance
Seadragon.Debug = new Seadragon.Debug();
