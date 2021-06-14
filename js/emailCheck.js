define([],function(){

	var DEBUG = false;
		/**
	 * @method, validateStep1
	 *
	 * @return, Promise
	 *
	 * @description,
	 *    Enter a description for this method here.
	 *
	 */
	var emailCheck = function(data) {
	
		var profile;

		$external = OCDLA.Checkout.callouts.validateContact(data.Email);
		
		$external.then(function(contacts) {
	
			if(!contacts) {
				throw new Error('An undefined error occurred.'); 
			}
			
			DEBUG && console.log('Number of contact are: '+contacts.length);
			DEBUG && console.log(contacts);
		});

		
		return $external.then(function(contacts){
			return choice(contacts,data);
		});


	};
	
	
	
	var choice = function(result,data){
	
			if(result.length >= 1) {

				// We noticed that there are result.length contacts in our system with that email address.
				// Please contact OCDLA to address that mess.
			
				profile = getPaymentProfileFormatFromContact(result[0]);


				// We won't load the customer's contact info unless we're actually able
				// to update the checkout form.
				return OCDLA.Checkout.callouts.attachAccountToShoppingCart(result[0],data.OpportunityId).then(function(res){
					$('#AccountId').val(result[0].AccountId);
					$('#ContactId').val(result[0].Id);
					loadProfile(profile);
				});
			
			}
	
			if (result.length === 0) {
			
				return new Promise(checkoutNewContactQuestion(data)).then(function(res){
					var c = {
						Id: null,
						FirstName: data.FirstName,
						LastName: data.LastName,
						Email: data.Email
					};
				
					return OCDLA.Checkout.callouts.generateGuestCheckoutContact(c,data.OpportunityId).then(function(res){
						DEBUG && console.log(res);
						$('#AccountId').val(res.AccountId);
						$('#ContactId').val(res.Id);
					});
				});
				
			}
	};
	
	

	var checkoutNewContactQuestion = function(contact){
		return function(resolve,reject){
			var $settings;

			$settings = {
				width:'90%',
				height:'auto',
				className: 'dialog',
				closeButton: false,
				transition: 'fade',
				opacity: 1.0
			};

			$settings.html = "<div><h1>Confirm Email Address</h1><div>The email address<p><em>"+contact.Email+"</em></p>isn't in our files.  We recommend you checkout with your OCDLA username/email.  If you are a new customer, click <em>Continue with checkout</em>, below.</div><div style='padding-top:5px;border-top:1px solid #eee; margin-top:30px;'><div id='changeEmail' class='button'>Use a different email</div><div class='button' id='createNewAccount'>Continue with checkout</div></div></div>";

			$.colorbox($settings);

			var createNewAccountAction = function(e){
				// alert('new account');
				$.colorbox.close();
				resolve();
			};

			var editEmailAction = function(e){
				$.colorbox.close();
				reject();
			};

			var changeEmailButton = document.getElementById('changeEmail');
			var createNewAccount = document.getElementById('createNewAccount');
			changeEmailButton.addEventListener('click',editEmailAction,false);
			createNewAccount.addEventListener('click',createNewAccountAction,false);
		};
	};
	
	return {
		go: emailCheck
	};

});