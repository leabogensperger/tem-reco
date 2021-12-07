/*

This unit creates 3 dialogs form (jQuery UI)
	- Alert Form
	- Confirmation Form
	- Message Form
	
The forms will be themed with the selected jQuery UI Theme 

To have access to form you can call :

	- jMessage(msg, title, callback);
	- jAlert(msg, title, callback);
	- jConfirm(msg, title, callback);

*/

// Alert
function jAlert(s, aTitle, callback){
	$('#alertUI').find('.content').html(s);
	if(aTitle == undefined)
		aTitle = 'Atlas Browser-Based Viewer';
	$('#alertUI').dialog('option', 'title', aTitle);
	$('#alertUI').dialog('option', 'z-index', 5000);	
	$('#alertUI').dialog('open');
	if (typeof callback == "function"){ 
		$('#alertUI').dialog('option', 'close', callback);	
	}
}

// Confirmation Window
var g_confirmResult = false;
function jConfirm(s, aTitle, f){
	$('#confirmUI').find('.content').html(s);
	$('#confirmUI').dialog('option', 'title', aTitle);
	$('#confirmUI').dialog('open');
	if (typeof f == "function"){ 
		$('#confirmUI').dialog('option', 'close', f);	
	}
	return g_confirmResult;
}

function jMessage(s, aTitle, callback){
	var $msgUI = $('#messageUI');
	$msgUI.find('.content').html(s);
	$msgUI.dialog('option', 'title', aTitle);
	$msgUI.dialog('option', 'z-index', 5000);	
	$msgUI.dialog('open');
	if (typeof callback == "function"){ 
		$msgUI.dialog('option', 'close', callback);	
	}
}


// Message Window
jQuery(document).ready(function(){
	// load the CSS
	loadCSS('css/jalert.css');
	
	// Alert Form
	var $alertForm = $("<div></div>").attr('id', 'alertUI');
	var $contentPadding = $('<div></div>').attr('class', 'jUIPadding').appendTo($alertForm);
	$contentPadding.append($('<div></div>').attr('class', 'jAlertIcon'));
	$contentPadding.append($('<p></p>').attr('class', 'content'));
	
	
	$('body').append($alertForm);	
	$('#alertUI').dialog({autoOpen:false,
		modal:true,
		width:'400px',
		buttons: {'OK': function(){
			$(this).dialog('close');
		}}});
	
	// confirmation form
	$('#confirmUI').dialog({autoOpen:false,
			modal:true,
			width:'400px',
			open : function(){
				g_confirmResult = null;	
			},
			buttons: {'Yes': function(){
												g_confirmResult = true;
												$(this).dialog('close');},
							'no': function(){
												g_confirmResult = false;
												// unbind the close function (no means do not do anything)
												$('#confirmUI').dialog('option', 'close', null);												
												$(this).dialog('close');}}});	
	
	// Append the HTML DOM Element to the body	
	var $msgForm = $("<div></div>").attr('id', 'messageUI');
	$msgForm.append($('<div></div>').attr('class', 'jUIPadding'));
	$msgForm.append($('<div></div>').attr('class', 'jMessageIcon'));
	$msgForm.append($('<p></p>').attr('class', 'content'));
		
	$('body').append($msgForm);	
	$msgForm.dialog({autoOpen:false,
		modal:true,
		width:'400px',
		buttons: {'OK': function(){
			$(this).dialog('close');
		}}});
});


