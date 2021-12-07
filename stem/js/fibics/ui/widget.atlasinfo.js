TATLASInfoWidget = TBaseWidget.extend({
	init: function(pAppC){
		this._super(pAppC);
		loadCSS('css/aboutatlas.css');
		var me = this;
		$(this.appController).on('oninit', function(){
			me.updateHTML();
		});
		this.icone = 'about_atlas_icon.png';
		this.title = _e('aboutatlas');
		this.hint = _e('aboutatlas');
		this.id = 'ATLASInfoWidget';
		this.buildHTML();
	},
	buildHTML: function(){
		this._super();
	},
	buildPanel : function(){
		this._super();

		this.$panelC.append($('<fieldset></fieldset>'));
		this.$panelC.find('fieldset:last').append($('<legend>' + _e('about') + '</legend>'));
		this.$panelC.find('fieldset:last').append($('<a></a>').attr({'id': 'DesignedForCarlZeissLink',
			'href':'http://microscopy.zeiss.com',
			'target': "_blank"}));
		this.$panelC.find('a:last').append($('<img/>').attr({'src': 'images/designed_for_carl_zeiss.png',
														'alt':_e("designedforcarlzeiss"),
														'class':'designedFor'}));



		this.$panelC.find('fieldset:last').append($('<div></div>').addClass('designedByBox'));
		this.$panelC.find('div:last').append($('<div></div>').addClass('designedBy').html(_e('designedby')));
		this.$panelC.find('div.designedBy').after($('<img/>').attr({
			src:'images/fibics_logo.png',
			'class': 'fibicsLogoAboutATLAS',
			'alt': _e('fibicsincorporated'),
			id:'aboutATLASFibicsLogo'
		}));

		this.$panelC.find('#aboutATLASFibicsLogo').wrap($('<a></a>').attr({'href': 'http://www.fibics.com/', 'target': "_blank"}));
		this.$panelC.find('fieldset:last').append($('<div></div>').addClass('visitATLASWebSite'));
		this.$panelC.find('div:last').html(_e('visitthesite') + "<br /><a href='" + G_ATLAS_ZEISS_WEBSITE +"' target='_blank' class='visitATLAS'><img src='images/visit_atlas_website.png'  alt='Visit ATLAS Website'  class='visitATLASWebsite'/><br /></a>" + _e('website') + ".");

		this.$panelC.append($('<fieldset></fieldset>'));
		this.$panelC.find('fieldset:last').append($('<legend>Version</legend>'));
		this.$panelC.find('fieldset:last').append($('<div></div>').attr('id','ATLASBrowserBasedViewerVersion'));
		this.$panelC.append($('<fieldset></fieldset>'));
		this.$panelC.find('fieldset:last').append($('<legend>' + _e('notice') + '</legend>'));

		this.$panelC.find('fieldset:last').append($('<p></p>').html(_e('theabbvwillworkwithmostbrowsers')));
		this.$panelC.find('fieldset:last').append($('<p></p>').html(_e('noserversidescripting')));
		this.$panelC.find('fieldset:last').append($('<p></p>').html(_e("usesmicroscofttechnology")));


	},
	updateHTML: function(){
		this.$panel.find('#ATLASBrowserBasedViewerVersion').html(this.appController.getApplicationVersion());
	}
});
