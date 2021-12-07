$( window ).on( "load", function(){
	if (G_DEBUG) {
		$('#Footer .ui-button').css('padding',0);
		$('#Footer .ui-buttonset').css('padding',0);
		$('#Footer .ui-buttonset').css('margin-top',1.5);
		$('#FooterWidgetCTNR').css('display','inline-block');
		$('#FooterLogo').css('position','absolute');
		$('#FooterLogo').css('right',0);
		$('#FooterLogo').css('bottom',0);
		$('#FooterLogo').css('z-index',-1);
		if ($('.ATLASViewportCTNR').length < 2) {
			$('#ATLASViewportDisplayModeChanger').css('display','none');
		}
	}
	G_APPLICATION_CTRL.footer.adjustViewWidgetWidth();
});
