globalScripts(["default/modules/checkout/js/form","default/modules/checkout/js/view"],function(form,view){



	var isShippable;


	var showBilling = function(){
		// alert("will show billing");
		$(".checkout-billing-panel").removeClass("panel-closed");
	};
	
	var hideBilling = function(){
		$(".checkout-billing-panel").addClass("panel-closed");		
	};
	

	
	document.addEventListener('click',function(e){
		e = e || window.event;
		
		var target = e.target || e.srcElement,
		
		fn,
		
		params,
		
		amt,
		
		params = target.dataset && target.dataset.action;
		

		
		if(!params) return false;
		
		fn = form.doAction;

		view.clearMessages();
		view.setState('CHECKOUT_LOADING');
		
		// alert('action is: '+params);
		
		$('body').addClass('loading');
		
		fn.call(null,params).then(function(res){
			console.log(res);

			if(!res) {
				console.log('Action resolved with undefined.');
				return;
			}
			
			if(res.formState == 'CONTACT_VALIDATED') {
				view.setState('CHECKOUT_BILLING_ACTIVE');
				showBilling();
			}
			
			if(res.formState == 'CHECKOUT_FORM_COMPLETE') {
				view.setState('CHECKOUT_FORM_COMPLETE');
				hideBilling();
			}
			
			if(res.formState == 'BILLING_VALIDATED') {
				view.setState('CHECKOUT_FORM_COMPLETE');
			}
			
			
			if(res.formState == 'CHECKOUT_COMPLETE'){
				view.setState('CHECKOUT_COMPLETE');
				view.showSuccesses("Your Order was completed!  A receipt for this transaction has been sent to your email address.");
			}
			
			// view.removeState('CHECKOUT_LOADING');
		})
		.then(function(){
			$('body').removeClass('loading');		
		})
		.catch(function(message){
			$('body').removeClass('loading');		
			view.removeState('CHECKOUT_LOADING');
			view.setState('CHECKOUT_ERRORS');
			console.log(message);
			view.showErrors(message);
		});

		
		return false;
	});




	

});