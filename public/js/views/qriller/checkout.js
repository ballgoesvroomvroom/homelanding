/**
 * contains the logic for implementing checkout (deals with payment gateways)
 * will request for total value (outstanding invoice) from the server (most safest instead of storing data on local storage)
 * also invoked by Google Pay JS hosted by them, on onload event
 */

// GOOGLE PAY'S API PAYLOAD
let paymentsClient = null // initialised payments client instance from google api js, or null if not set yet
const baseRequest = {
	apiVersion: 2,
	apiVersionMinor: 0
};

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

const baseCardPaymentMethod = { // required fields
	type: 'CARD',
	parameters: {
		allowedAuthMethods: allowedCardAuthMethods,
		allowedCardNetworks: allowedCardNetworks,
	}
};

const cardPaymentMethod = Object.assign( // with optional fields
	{
		tokenizationSpecification: tokenizationSpecification
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
	console.log("FETCHED DATA", data)
	isAbleToProcessPayment = true // continue checkout flow

	return data
}).catch(httpErrStatusCode => {
	// refrain this page from doing anything in the first place
	// show warning modal, and redirect thereafter
	isAbleToProcessPayment = false // block any potential events from occurring

	// REDIRECT OUT ASAP
	window.location.href = "/qriller/buy"
})

function processPayment(token) {
	/**
	 * token: string, supplied by google's api to be supplied into Stripe's API
	 * master function that ultimately gets called whenever payment has been made from all payment options supported
	 * connects with server to process the payment
	 * returns a promise that eithers resolves upon confirmation from server (i.e. user got his goods), or rejects when user fails to get his goods (unable to grant, etc)
	 * promise rejects with the error object with keys, 'reason', 'message', 'intent'
	 */
	return new Promise((res, rej) => {
		res()
	})
}

function completePayment() {
	/**
	 * called when entire transaction is finished and items have been granted
	 */
	return true
}

function getGPaymentsClient() {
	/**
	 * generates a new payments client instance from google pay js if not yet instantiated
	 * returns a payments client instance
	 */
	if (paymentsClient == null) {
		paymentsClient = new google.payments.api.PaymentsClient({
			environment: "TEST",
			paymentDataCallbacks: {
				onPaymentAuthorized: paymentAuthorisedGPay
			}
		});
	}

	return paymentsClient
}

function paymentAuthorisedGPay(paymentData) {
	/**
	 * handles authorise payments callbacks (response)
	 * resolves with object with a differentiating field, 'transactionState', with values of either "SUCCESS" and "ERROR" for both success and failures respectively
	 */
	return new Promise((res, rej) => {
		console.log("CALLBACK FINAL SUCCESS", paymentData)
		processPayment(paymentData.paymentMethodData.tokenizationData.token).then(() => {
			res({"transactionState": "SUCCESS"})
		}).catch(errObj => {
			/**
			 * errObj: {
		 	 *	reason: "OFFER_INVALID"|"PAYMENT_DATA_INVALID"|"SHIPPING_ADDRESS_INVALID"|"SHIPPING_ADDRESS_UNSERVICEABLE"|"SHIPPING_OPTION_INVALID"|"OTHER_ERROR"
		 	 *	message: string, (e.g. "This shipping option is invalid for the given address")
		 	 *	intent: "OFFER"|"PAYMENT_AUTHORIZATION"|"SHIPPING_ADDRESS"|"SHIPPING_OPTION", (must be present in paymentDataRequest.callbackIntents)
			 * }
			 */
			console.log("CATCHING")
			res({
				transactionState: "ERROR",
				error: errObj
			})
		})
	})
}

function completeGPay() {
	/**
	 * to send payment payload to google's api upon click event on google pay button
	 * triggered by 'click' event of mounted google pay button
	 */
	console.log("PAYING")
	if (clickedGPayBtn) {
		return
	}

	clickedGPayBtn = true

	const paymentDataRequest = Object.assign({}, baseRequest);
	paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod]
	paymentDataRequest.merchantInfo = {
		merchantName: 'Example Merchant',
		merchantId: '12345678901234567890'
	};
	paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"]

	outstandingInvoice.then(data => {
		console.log("PASSED")
		paymentDataRequest.transactionInfo = {
			totalPrice: data.totalPrice,
			currencyCode: "SGD",
			totalPriceStatus: "FINAL",
			totalPriceLabel: "Total"
		}

		// call loadPaymentData method of payments client
		return getGPaymentsClient().loadPaymentData(paymentDataRequest)
	}).then(paymentData => {
		var paymentToken = paymentData.paymentMethodData.tokenizationData.token // token already dealt with in paymentAuthorisedGPay

		completePayment();
		console.log("SUCCESS", paymentData, paymentToken)
	}).catch(err => {
		// payment prompt did not go through (user most likely exitted)
		clickedGPayBtn = false // reset debounce

		console.log("FAILED NOT CAUGHT")
		console.error(err)
	})
}

function createGPayBtn() {
	/**
	 * will be invoked by onload event of Google Pay JS script
	 * will mount in a Google Pay button only after client is confirmed to be eligible via .isReadyToPay()
	 */

	// initiate a PaymentsClient object
	// https://developers.google.com/pay/api/web/reference/client#PaymentsClient
	console.log("LOADING TEST ENV")

	const isReadyToPayRequest = Object.assign({allowedPaymentMethods: [baseCardPaymentMethod]}, baseRequest);
	outstandingInvoice.then((data) => {
		// only create the button when the cart data is available, else don't accept any form of payments if redirection to other page fails
		console.log("GPAY BUTTON READY", data)
		return getGPaymentsClient().isReadyToPay(isReadyToPayRequest)
	}).then(function(response) {
		if (response.result) {
			// add a Google Pay payment button
			const button = getGPaymentsClient().createButton({
				onClick: completeGPay,
				allowedPaymentMethods: [baseCardPaymentMethod]
			}); // same payment methods as for the loadPaymentData() API call

			// append button
			document.getElementById("payment-container").appendChild(button);
		}
	}).catch(function(err) {
		// show error in developer console for debugging
		console.error(err);
	});
}

document.addEventListener("DOMContentLoaded", e => {
	outstandingInvoice.then(dataArr => {
		/** 
		 * dataArr.itemNames: [topicTitleRepr: string, qty: number][]
		 * build the DOM elements for the itemised bill
		 */
		var listContainer = document.getElementById("itemised-list")
		for (let i = 0; i < dataArr.itemNames.length; i++) {
			const li = document.createElement("li")
			const counterPTag = document.createElement("p")
			const titlePTag = document.createElement("p")
			const priceColPTag = document.createElement("p")

			priceColPTag.className = "total-price-col"

			counterPTag.innerHTML = `${i +1}.`
			titlePTag.innerHTML = `${dataArr.itemNames[i][0]}<br><span class="itemised-bill-qty-counter">Qty: ${dataArr.itemNames[i][1]}</span></p>`
			priceColPTag.innerHTML = `${dataArr.itemNames[i][1] *5}`

			li.appendChild(counterPTag)
			li.appendChild(titlePTag)
			li.appendChild(priceColPTag)

			listContainer.appendChild(li)
		}

		// update total price display in DOM too
		document.getElementById("total-price-summary").innerHTML = `${dataArr.totalPrice} SGD`
	})
})