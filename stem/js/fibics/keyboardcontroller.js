TKeyboardController =  TBaseController.extend({
	init: function(MCtrl, WPCtrl, AVPCtrl){
		this._super();
		this.measurementController = MCtrl;
		this.waypointController = WPCtrl;
		this.ATLASViewportController = AVPCtrl;
		this.registerKeyEvents();
		this.inField = false;
		this.blockInput();
	},
	blockInput: function(){
		var me = this;
		$(document).on('focus', 'input[type=text], textarea', function(){
			me.inField = true;
		});
		$(document).on('blur', 'input[type=text], textarea', function(){
			me.inField = false;
		});
	},
	registerKeyEvents: function(){
		var me = this;
		$(window).keydown(function(e){
			if(me.inField) return null;			
			me.ATLASViewportController.updateCursors();
			var handled = false;
			handled = me.measurementController.keydown(e);
			if(handled) return false;			
			handled = me.waypointController.keydown(e);
			if(handled) return false;
			return true;					   
		});		
		
		$(window).keyup(function(e){
			me.ATLASViewportController.updateCursors();			   
		});		
	}
});

var KEYCODE_ENTER = 13;
var KEYCODE_ESC = 27;

