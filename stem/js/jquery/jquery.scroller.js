
(function($) {

$.fn.gotoEnd = function(options) {
	return this.each(function(options) {		
		var parentW = 	$(this).parent().width();
		var thisW = $(this).width();
		var newLeft = Math.min(10, parentW-thisW);
		$(this).animate({'left':(newLeft)+'px'}, 100);
	});	
};

$.fn.gotoBeginning = function(options) {
	return this.each(function(options) {		
		$(this).css('left', '0px');
	});	
};

$.fn.gotoChildren = function(aLi){
	var xChild = -aLi.position().left;
	var par = aLi.closest('ul');
	var displayWidth = $('.viewContent').width();
	if(Math.abs(xChild) + 100 > displayWidth){
		par.css('left', xChild + displayWidth - 150);
	}
	if(Math.abs(xChild) < Math.abs(parseFloat(par.css('left')))){
			par.css('left', xChild);
	}
}


$.fn.gotoNext = function(options) {
	return this.each(function(options) {		
		$(this).stop(); 
		var parentW = $(this).parent().width();
		var listLeft = $(this).offset().left;
		var self = $(this);
		var parentLeftOffset = $(this).parent().offset().left;
		$(this).children().each(function(){
			var cOffsetLeft = $(this).offset().left;
			if( (cOffsetLeft - parentLeftOffset) > -110){
				var deltaShift = (cOffsetLeft - parentLeftOffset);
				var newLeft = self.position().left - deltaShift;
				self.animate({'left':(newLeft)+'px'}, 500);
				return false;
			}
		});
	});	
};

$.fn.gotoPrevious = function(options) {
	return this.each(function(options) {		
		$(this).stop();
		var parentW = $(this).parent().width();
		var listLeft = $(this).offset().left;
		var self = $(this);
		var parentRightOffset = $(this).parent().offset().left + $(this).parent().width() ;
		
		// check if beyond
		if((self.children('li:last').position().left + self.children('li:last').width()) >= parentRightOffset){
			return null;
		}
		
		$(this).children().each(function(i, item ){
			var cOffsetLeft = $(item).offset().left;
			if( Math.abs(cOffsetLeft - parentRightOffset) < 100){
				var deltaX = $(item).outerWidth() - Math.abs(cOffsetLeft - parentRightOffset);
				//var deltaShift = (cOffsetLeft - parentLeftOffset);
				var newLeft = self.position().left - deltaX;
				self.animate({'left':(newLeft)+'px'}, 500);
				return false;
			}
		});
	});	
};
	
$.fn.scroller = function(options) {
   return this.each(function(options) {	   
	   var defaults = {delay : 100};
	   var options = $.extend(defaults, options);
	   var self = $(this);
	   var m_scrollCTNRWidth;
	   var m_xPos;
	   var m_ctnrRatio;
	   var m_viewBrowsers;
	   var m_leftButton;
	   var m_rightButton;
	   var m_scrollMain;
	   var m_currentOverflow;
	   var m_overflow;	
	   var m_scrollButton;
	   var m_scrollAmount;
	   var m_scrolling = false;
	   var m_displayWidth = 0;
	   var m_contentWidth = 0;
	   var m_liWidth = 0;

	   var m_scrollCTNR = $('<div></div>').addClass('scrollbottom');
	   m_scrollCTNR = self.wrap(m_scrollCTNR).closest('.scrollbottom');
	   m_scrollMain = $('<div></div>').addClass('scrollbottomMargin');	   
	   m_scrollMain = m_scrollCTNR.wrap(m_scrollMain).parent('.scrollbottomMargin');
	   
	   function startScrolling(obj, param)
	   {
		  // return false;
		   cLeft = obj.position().left;
		   nLeft = cLeft + param;
		   
		   if(nLeft < (m_displayWidth - m_contentWidth)){
			   nLeft = Math.min(0,m_displayWidth - m_contentWidth);
			   obj.animate({"left": nLeft+'px'}, 50);
		   }
		   else if(nLeft > 0){
			   nLeft = 0;
			   obj.animate({"left": nLeft+'px'}, 50);		   
		   }
		   if (!m_scrolling ) { obj.stop(); }
		   else
			   obj.animate({"left": nLeft+'px'}, 50, function(){
					       if (m_scrolling){
					    	   startScrolling(obj, param);
					       }
	     });
	   }

	   
	   // add the push buttons
	   m_viewBrowsers = $('<div></div>').addClass('viewBrowsers');
	   m_scrollMain.parent().prepend(m_viewBrowsers);	  
	   m_leftButton = $("<div></div>").addClass('viewBrowserLeft viewScrollButton button viewBrowser ui-corner-right').html("<div class='viewBrowserLeftImg' ></div>").button();
	   m_rightButton = $("<div></div>").addClass('viewBrowserRight viewScrollButton button viewBrowser ui-corner-left').html("<div class='viewBrowserRightImg' ></div>").button();
	   m_viewBrowsers.append(m_leftButton);
	   m_viewBrowsers.append(m_rightButton);
	   
	   function getOverflow(){		   
		   var listW = self.width();
		   var ctnrW =  m_scrollCTNR.width();
		   return Math.max(0, listW - ctnrW);
	   }
	   
	   function getCurrentOverflow(){
		   var listX = self.offset().left;
		   var ctnrX = m_scrollCTNR.offset().left; 
		   return ( listX - ctnrX );		   
	   }
	   
	   function updateCursor(){
		   var cO = getCurrentOverflow();
		   var tO = getOverflow();		   
		   var oPercent = -(cO/tO);		   
		   //svar newX = Math.max(0, oPercent*(m_scrollMain.outerWidth(true)) - m_scrollButton.outerWidth(true));
		  // m_scrollButton.animate({'left': (newX)+'px'}, 200);   
	   }
	
	   self.parent().trigger('resize');	   
	   
	   m_leftButton.mousedown(function(){
		   m_displayWidth = m_scrollCTNR.width();
		   m_contentWidth = self.width();
		   m_scrollAmount = 25;
		   m_scrolling = true;		   
		   startScrolling(self, m_scrollAmount );
	   });
	   m_rightButton.mousedown(function(){
		   m_displayWidth = m_scrollCTNR.width();
		   m_contentWidth = self.width();
		   m_scrollAmount = -25;
		   m_scrolling = true;		   
		   startScrolling(self, m_scrollAmount );
	   });
	   
	   m_leftButton.add(m_rightButton).add($(document)).mouseup(function(){
		   m_scrolling = false;
	   });
	   
	   function getRightElement(){
		   m_displayWidth = m_scrollCTNR.width();
		   ulPos = self.position();
		   var e;
		   var apos;
		   self.children().each(function(i){
			   e = this;
			   if($(this).position().left + ulPos.left > m_displayWidth ){				
				return false;
			 } 			  
		  });	   
		  
		  return e;
	   }
	   
	   function getLeftElement(){
		   m_displayWidth = m_scrollCTNR.width();
		   ulPos = self.position();
		   var e;
		   var apos;
		   self.children().each(function(i){
			   apos = $(this).position();
			   e = this;
			   if((ulPos.left + apos.left) > 0 ){				
				 return false;
			 } 			  
		  });
		   return e;
	   }
	   
	   function getLIWidth(){
		   if(m_liWidth == 0){
			   m_liWidth = self.children('li:first').outerWidth(true);
		   }
		   return m_liWidth;		   
	   }
	   	   
	   m_leftButton.click(function(){		  
		   var i = Math.max(0, self.index(getLeftElement())-1);
		   $('#viewList').gotoNext();	   		   
	   });
		
	   m_rightButton.click(function(){
		   var i = Math.max(0, self.index(getLeftElement())+3);
		 	// m_scrollCTNR.scrollTo(5, 100);
		  //$('#viewList').animate({'left': '300'}, 300);
		   $('#viewList').gotoPrevious();	
	   });	   
	  /* 
	   function updateScroller(){
		   // check if 
		   if(m_scrollCTNR.width()>(self.position().left + self.width())){
			//   m_scrollCTNR.scrollTo('100%', 100, updateCursor());			   
		   }		   
	   }   
	   self.delegate('li', 'click', function(){
		   updateScroller();
	   });*/	   
   });
}
})(jQuery);