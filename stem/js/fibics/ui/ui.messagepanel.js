// JavaScript Document
TMessagePanel = Class.extend({
	init: function(pMsgCTRL, pAppCTRL){
		this.pMsgCTRL = pMsgCTRL;
		this.pAppCTRL = pAppCTRL;
		loadCSS('css/messagepanel.css');
		this.buildHTML();
		var me = this;
		
		$(this.pAppCTRL).on('onFinalizeLoad', function(){
			me.synchView();																									
		});		
		
	},
	buildHTML: function(){
		this.$e = $('<div></div>').attr({'id': 'MessagePanelCTNR'}).appendTo($('body'));
		this.$msgUL = $('<ul></ul>').appendTo(this.$e);
		if(this.pMsgCTRL.msgList.length > 0){
			this.$e.css('display','block');
		}
	},
	synchView: function(){
		this.$msgUL.html('');
		for(var idx = 0; idx < this.pMsgCTRL.msgList.length; idx++){
			var $li = $('<li></li>').appendTo(this.$msgUL);
			$li.html(this.pMsgCTRL.msgList[idx]);
		}
	}
});