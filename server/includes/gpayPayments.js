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

const baseCardPaymentMethod = {
	type: 'CARD',
	parameters: {
		allowedAuthMethods: allowedCardAuthMethods,
		allowedCardNetworks: allowedCardNetworks,
		allowPrepaidCards: true,
	}
};