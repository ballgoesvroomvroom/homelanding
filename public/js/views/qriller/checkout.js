/**
 * contains the logic for implementing checkout (deals with payment gateways)
 * will request for total value (outstanding invoice) from the server (most safest instead of storing data on local storage)
 * also invoked by Google Pay JS hosted by them, on onload event
 */

// GOOGLE PAY'S API PAYLOAD
const baseRequest = {
	apiVersion: 2,
	apiVersionMinor: 0
};

const baseCardPaymentMethod = { // required fields
	type: 'CARD',
	parameters: {
		allowedAuthMethods: allowedCardAuthMethods,
		allowedCardNetworks: allowedCardNetworks,
	}
};

const cardPaymentMethod = Object.assign( // with optional fields
	{
		tokenizationSpecification: tokenizationSpecification,
		allowPrepaidCards: true
	},
	baseCardPaymentMethod
);
//

// states
let isAbleToProcessPayment = false // will be set to true when able to retrieve outstanding invoice from the server side
let clickedGPayBtn = false // debounce value

// get outstanding invoice
let outstandingInvoice = fetch(`/api/qriller/shop/getTotal`, {
	method: "GET",
	credentials: "same-origin"
}).then(r => {
	if (r.status === 200) {
		return r.json()
	} else {
		throw new Promise.reject(r.status)
	}
}).then(data => {
	/**
	 * data payload schema: {
 	 *	totalPrice: '25',
 	 *	itemNames: [["1.0 | Topic 1", 3], ["1.2 | Topic 1.2", 2]]
	 * }
	 */
	return data
}).catch(httpErrStatusCode => {
	// refrain this page from doing anything in the first place
	// show warning modal, and redirect thereafter
	isAbleToProcessPayment = false // block any potential events from occurring
})

function completeGPay() {
	/**
	 * to send payment payload to google's api upon click event on google pay button
	 * triggered by 'click' event of mounted google pay button
	 */
	if (clickedGPayBtn) {
		return
	}

	clickedGPayBtn = true
	const paymentDataRequest = Object.assign({}, baseRequest);
	paymentDataRequest.allowedPaymentMethods = [baseCardPaymentMethod]
	paymentDataRequest.merchantInfo = {
		merchantName: 'Example Merchant'
		merchantId: '12345678901234567890'
	};
	outstandingInvoice.then(data => {
		paymentDataRequest.transactionInfo = {
			totalPrice: data.totalPrice,
			currencyCode: "SGD"
		}
	})
}

function createGPayBtn() {
	/**
	 * will be invoked by onload event of Google Pay JS script
	 * will mount in a Google Pay button only after client is confirmed to be eligible via .isReadyToPay()
	 */

	// initiate a PaymentsClient object
	// https://developers.google.com/pay/api/web/reference/client#PaymentsClient
	const paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});

	// const tokenizationSpecification = {
	// 	type: "PAYMENT_GATEWAY",
	// 	parameters: {
	// 		"gateway": "stripe",
	// 		"stripe:version": "2018-10-31",
	// 		"stripe:publishableKey": "YOUR_PUBLIC_STRIPE_KEY"
	// 	}
	// }

	const tokenizationSpecification = {
		type: 'PAYMENT_GATEWAY',
		parameters: {
			'gateway': 'example',
			'gatewayMerchantId': 'exampleGatewayMerchantId'
		}
	};

	const allowedCardNetworks = ["AMEX", "JCB", "MASTERCARD", "VISA"];
	const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"]; // https://stripe.com/docs/payments/cards/supported-card-brands#online-card-brand-capabilities

	const isReadyToPayRequest = Object.assign({}, baseRequest);
	isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];
	paymentsClient.isReadyToPay(isReadyToPayRequest).then(function(response) {
		if (response.result) {
			// add a Google Pay payment button
			const button = paymentsClient.createButton({
				onClick: () => completeGPay,
				allowedPaymentMethods: [baseCardPaymentMethod]
			}); // same payment methods as for the loadPaymentData() API call

			// append button
			document.getElementById('container').appendChild(button);
		}
	}).catch(function(err) {
		// show error in developer console for debugging
		console.error(err);
	});
}