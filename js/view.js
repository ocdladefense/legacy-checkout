define([],function(){
	var viewState = [];
	
	// The container for this app.
	var container;
	
	var DEBUG = true;

	var	$status = $('#ccAuthorizeMessages');
	
	
	var states = {
		CHECKOUT_LOADING: {classes: ['loading'], functions:[clearErrors]},
		CHECKOUT_BILLING_ACTIVE: {classes: ['with-billing','without-shipping']},
		CHECKOUT_SHIPPING_ACTIVE: {classes: ['with-billing','with-shipping'],functions:[waitingForData]},
		CHECKOUT_SHIPPING_INACTIVE: {classes: ['with-billing','without-shipping']},
		CHECKOUT_INCOMPLETE: {classes: ['without-billing','without-shipping']},
		CHECKOUT_ERRORS: {classes: ['with-errors']},
		CHECKOUT_FORM_COMPLETE: {classes: ['form-complete'],functions:[formReady,buttonText]},
		CHECKOUT_COMPLETE: {classes: ['checkout-success','without-billing','without-shipping']},
	};
	
	
	
	var MESSAGES = {
		FREE_ORDER_SUCCESS: 'Done!<br />Your Order was successfully completed.  You should receive an Order confirmation by email shortly. Your Order # is: %OrderNumber%</div>',
		PAID_ORDER_SUCCESS: 'Paid!<br />Your card was successfully charged.<br />Your Order # is: %OrderNumber%</div>',
	};


	// level should be in notice, warning, error
	var showMessages = function(level,messages){
		messages = Array.isArray(messages) ? messages : [messages];
		$('html, body').animate({ scrollTop: 0 }, 'fast');

		$status.show();
		$status.html('<div class="message message-'+level+'">'+messages.join('<br />')+'</div>');
	};
	
	var clearMessages = function(){
		$status.html('<div class="">&nbsp;</div>');	
		$status.hide();	
	};
	
	function buttonText(){
		$('#validateStep1').html('Change billing/shipping info');
	}



	function setClass(container,classes){
		classes = Array.isArray(classes) ? classes.join(' ') : classes;
		DEBUG && console.log('Will set classes to: '+classes);
		container.className = classes;
	}

	function setState(sName,data){
		DEBUG && console.log('Preparing to set state to: '+sName);
		var state = states[sName];
		setClass(container,state.classes);
		
		if(state.functions){
			for(var i = 0; i<state.functions.length;i++){
				DEBUG && console.log('going to execute: '+state.functions[i]);
				state.functions[i](data);
			}
		}
	}
	
	
	function formReady(){
		$('#ccSubmit').prop('disabled',false);
	}
	
	function formNotReady(){
		$('#ccSubmit').prop('disabled',true);	
	}
	
	function showShipping(){
		$(container).removeClass('without-shipping');
		$(container).addClass('with-shipping');	
	}
	
	function hideShipping(){
		$(container).removeClass('with-shipping');
		$(container).addClass('without-shipping');
	}
	
	function clearErrors(){
		$('.cc-status').html('');
	}
	

	
	
	function waitingForData() {
		$.colorbox.close();
		$button = $('#validateStep1');
		$('#ccEmail').prop('disabled',true);
		$button.removeClass('loading');	
	}
	
	// view state code
	var updateViewPaid = function() {
		$button = $('#ccSubmit').addClass('loading');
		$('#ccSubmit').prop('disabled',true);
	};



	$(function() {
		container = document.getElementById('checkout-app');
	});

	var removeState = function(){
		$(container).removeClass('loading');
	};

	return {
		setState: setState,
		removeState: removeState,
		states: states,
		showErrors: showMessages.bind(this,'error'),
		showSuccesses: showMessages.bind(this,'success'),
		showWarnings: showMessages.bind(this,'warning'),
		clearMessages: clearMessages
	};

});