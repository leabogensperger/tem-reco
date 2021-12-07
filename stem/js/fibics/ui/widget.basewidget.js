TBaseWidget = Class.extend({		
	init: function (pAppC){
		this.appController = pAppC;	
		this.$button = $('<div></div>');
		this.$panel = $('<div></div>');
		this.icone = '';
		this.title = '';
		this.hint = '';
		this.id = '';
		this.popup = false;
		var me = this;		
		
		$(window).on('resize', function(){
			me.fitContentHeight();	
		});		
	},
	shutDown: function(){
		this.$button.button('destroy');
		this.$panel.remove();
	},
	buildHTML: function(){
		this.$button.attr(
				{
				id : this.id + 'Button',
				'class': 'wButton button',
				"panel": this.id + 'Panel',
				"widgetID": this.id
				}).append($('<img />').attr({
						'src':'images/widget/' + this.icone,
						'title' : this.title,
						'class':'eastHint widgetIcon',
						'alt':this.hint					
				}));
		
		this.$button.button();		
		// Build the panel
		this.$panel.attr({
			'for' : this.id,
			'id': this.id + 'Panel',
			'button': this.id + 'Button', 
			'class' : 'wPanel ui-widget-content'			
		});	
		this.$panel.append($('<h3></h3>').html(this.title));
		this.buildForms();
		this.buildPanel();
	},
	buildForms: function(){
			
	},
	buildPanel: function(){
		this.$panelContent = $('<div></div>').attr('class', 'PanelContent').appendTo(this.$panel);
		this.$panelC = $('<div></div>').addClass('wContentPadding');
		this.$panelContent.append(this.$panelC);
	},
	getContentHeight: function(){
		var rHeight = 0;
		this.$panelC.children().each(function(){
			if($(this).is(':visible'))
				rHeight += $(this).outerHeight(); 																			
		});
		// add the padding of the content
		rHeight += parseFloat(this.$panelC.css('padding-top')) * 2;
		rHeight += 50;
		return rHeight;
	},
	fitContentHeight: function(){
	// make sure that the panel is not hidden bellow the window edge (smaller viewport).
			var sH = this.getContentHeight() + 20;
			var iTop = parseFloat(this.$panel.offset().top);
			var maxH = Math.min(sH, $(window).height() - iTop - 20);
			this.$panel.css('height', maxH);	
			this.$panelContent.css('max-height', maxH);	
	
	/*	var cH = this.getContentHeight();
		this.$panel.css('height', cH);*/
	}, 
	addLine: function($table, sCaption, sValue){
		var $tr = $('<tr/>').appendTo($table);
		$td = $('<td/>').appendTo($tr).html(sCaption).addClass('lineCaption');
		$td = $('<td/>').appendTo($tr).html(sValue).addClass('lineValue');
	}
});