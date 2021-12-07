TViewportModeControl = Class.extend({		
	init: function (AVController){
		this.AVController = AVController;
		this.buildHTML();
	},
	buildHTML: function(){
		this.$e = $("<div></div>").attr('id', 'ATLASViewportDisplayLayoutChanger');
		//this.$e.append($('<span>Display Mode</span><br>'));	
		this.$e.append("<input type='radio' value='stack' id='DisplayLayoutStack' name='DisplayLayout'  /><label for='DisplayLayoutStack' class='button' title='" + _e('stackhint')+ "'>" + _e('stack') +"</label>");
		this.$e.append("<input type='radio' value='side' id='DisplayLayoutSide' name='DisplayLayout'  /><label for='DisplayLayoutSide' title='" + _e('sidebysidehint')+ "' class='button' >" + _e('side') +"</label>");
		
		if(this.AVController.displayLayout == 'stack')
			this.$e.find('#DisplayLayoutStack').prop('checked', true);
		if(this.AVController.displayLayout == 'side')
			this.$e.find('#DisplayLayoutSide').prop('checked', true);
	
		var me = this;
		this.$e.buttonset();
		var AVC = this.AVController;
		
		this.$e.children().on('change', function(e){
			if(!$(this).is(':checked')) return false;
			var aMode = $(this).val();
			AVC.setDisplayLayout(aMode);
		});		
		
		$(this.AVController).on('onAddATLASViewport', function(){
			if (AVC.ATLASViewportList.length == 1)
				me.$e.hide();
			else
				me.$e.show();
		});		
	}
});