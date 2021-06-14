define(["default/modules/checkout/js/emailCheck","default/modules/ccauthorize/js/data","default/modules/ccauthorize/js/actions"],function(emailCheck,ccForm,ccActions){

	
	var data = {};

	var DEBUG = true;	
	
	window.ccForm = ccForm;

	if(!window.console){
		window.console = function(e){};
	}
	
	function log(m){
		DEBUG && console.log(m);
	}
	
	var showShipping = function(){
		// alert("will show billing");
		$(".checkout-shipping-panel").show();
	};
	
	var hideShipping = function(){
		$(".checkout-shipping-panel").hide();
	};
	
	var DESTROY_CART_ON_PAYMENT = true;

	window.getData = getCheckoutData;

	var doAction = function(action){
			
			var data, ret, orderPromise;
			
			data = getCheckoutData();
			

			console.log("Form data is: ",data);
			
			try {
			
				if(action == "completeTransaction"){


					/**
					 * We either complete the transaction immediately (for free Orders)
					 * or charge the card.  The finalize the Order.
					 */
					if(data.amount == 0){
						orderPromise = ccActions.completeTransaction(data);
					} else {
						doValidationFuncs(data);
						orderPromise = ccActions.pay(data);
					}
					
					return orderPromise.then(function(phpResp){
						var order = phpResp.order;
						var ccResp = phpResp.ccResp;
						log("About to finalize order.");
						log(phpResp);
						return phpResp;
					}).then(function(phpResp){
						return ccActions.finalizeOrder(phpResp.order.OrderId, phpResp.ccResp);
					}).then(function(){
						if(DESTROY_CART_ON_PAYMENT){
							rolloverCart();
						}
						return {isSuccess: true, formState: "CHECKOUT_COMPLETE"};
					})
					.catch(function(e){
						console.log(e);
												
						if(typeof e === "string"){
							return Promise.reject(e);	
						} else {
							return Promise.reject(e.message);
						}
					});
					
				}
				
		
				if(action == 'validateContact'){
					validate(['contact'],data);
					return emailCheck.go(data)
					.then(function(res){
						if(parseInt(data.amount) == 0) {
							doFreeSetup();
							return {isSuccess: true, formState: 'CHECKOUT_FORM_COMPLETE'};
						} else {
							// return Promise.reject('Checkout is currently disabled and will be back online 2/4 at 11 am PST.');
							return {isSuccess: true, formState: 'CONTACT_VALIDATED'};
						}
					});

				}


				if(action == 'evaluateShipping'){
					ret = data.sameShipping ? {isSuccess:true,formState:'CHECKOUT_SHIPPING_INACTIVE'} : {isSuccess:true,formState:'CHECKOUT_SHIPPING_ACTIVE'};
					doShipping();
					$('#checkout-app').removeClass('loading');	
				}

				if(action == 'validateBilling'){
					validate(['contact','billing'],data);
					ret = {isSuccess: true,formState: 'CHECKOUT_FORM_COMPLETE'};
				}
				
				if(action == 'validateShipping'){
					validate(['contact','billing','shipping'],data);
					ret = {isSuccess: true,formState: 'CHECKOUT_FORM_COMPLETE'};
				}


				return Promise.resolve(ret);
				
			} catch(e){
			
				return Promise.reject(e.message);
			}
	
		
	};


	function doFreeSetup(){
		$('#ccSubmit').html('Complete transaction');
		$('#free-text').css({display:'block'});
		$('#ccSubmit').css({display:'block',visibility:'visible'});
	}


	var validate = function(domains,data){

		domains = Array.isArray(domains) ? domains : [domains];
		
		if(domains.indexOf('contact') !== -1){
			OCDLA.Checkout.validateContact(data);
		}
		
		if(domains.indexOf('billing') !== -1){
			doValidationFuncs(data);		
		}
		
		if(domains.indexOf('shipping') !== -1){
			doValidationFuncs(data);
		}
		
		if(domains.indexOf('checkout') !== -1){
			doValidationFuncs(data);
		}

	};


	
	
	var doValidationFuncs = function(data) {
		for(var i in data) {
			if(OCDLA.Checkout.validationFuncs[i]) {
				OCDLA.Checkout.validationFuncs[i](data[i]);
			}
		}
	};



	function doShipping(){
		var bInfo = ccForm.getData();
		var shipping = {
			ShipToContactId: (bInfo.BillToContactId || bInfo.ContactId),
			ShippingStreet: bInfo.BillingStreet,
			ShippingCity: bInfo.BillingCity,
			ShippingStateCode: bInfo.BillingStateCode,
			ShippingPostalCode: bInfo.BillingPostalCode,
			ShippingCountryCode: bInfo.BillingCountryCode
		};
		if(bInfo.sameShipping){
			ccForm.setData(shipping);
		} else {
			var newShipping = {
			ShipToContactId: (bInfo.BillToContactId || bInfo.ContactId),
			ShippingStreet: "",
			ShippingCity: "",
			ShippingStateCode: "",
			ShippingPostalCode: "",
			ShippingCountryCode: ""
			};
			ccForm.setData(newShipping);
		}
		
		if(!bInfo.sameShipping){
			showShipping();
		} else {
			hideShipping();		
		}
	}

	
	function getCheckoutData(){
		// alert("foobar");
		var bInfo = ccForm.ccData();
		bInfo.ShipToContactId = !bInfo.BillToContactId ? bInfo.ContactId : bInfo.BillToContactId;
		if(bInfo.sameShipping){
			// bInfo.ShippingStreet = "foobar";
			bInfo.ShippingStreet = bInfo.BillingStreet;
			bInfo.ShippingCity = bInfo.BillingCity;
			bInfo.ShippingStateCode = bInfo.BillingStateCode;
			bInfo.ShippingPostalCode = bInfo.BillingPostalCode;
			bInfo.ShippingCountryCode = bInfo.BillingCountryCode;
		}
		
		return bInfo;
	}


	function rolloverCart(){

		try {
			convertShoppingCart();
		} catch(e) {
			l('There was an error converting the shopping cart to \'Won\' status: '+e.message);
			throw e.message;
		}
		
	}
	
	function errors(reason){
		if(typeof reason === 'error'){
			message = e.message;
		} else if(typeof reason === 'object') {
			var UNKNOWN_ERROR = 'Unknown error.';
			var alternateErrorCode = reason.description || 'Unknown error.';
			message = reason.TransactionResponseDescription || UNKNOWN_ERROR;
			message = message == UNKNOWN_ERROR ? alternateErrorCode : message;
		} else {
			message = reason;
		}
	}

	return {doAction:doAction};
	
});