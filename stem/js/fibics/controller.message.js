// JavaScript Document
TMessageController = Class.extend({
	init: function(){
		this.msgList = new Array();
	},
	addMessage: function(msg){
		this.msgList.push(msg);
	}
});