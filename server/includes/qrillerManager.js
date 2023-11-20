/**
 * manages service related to Qriller site's framework
 * i.e. handling payment charges, fulfilling orders
 */
const dotenv = require("dotenv").config({path: path.join(__dirname, "../../.env")});
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const databaseInterface = require("../database/interface.js");
const qrillerDB = databaseInterface.qriller_users

class Manager {
	/**
	 * manages the user data within the supplied userid
	 */

	async fulfilOrder(userId, paymentIntentCS) {
		/**
		 * userId: key for the qriller database
		 * paymentIntentCS: string, client secret of the server-side generated paymentIntent
		 *
		 * fulfils the current order tagged under qrillerDB
		 * validates whether user has current order (and it is locked), and status of paymentIntent == "succeeded"
		 * will modify the data.orders.current into data.orders.fulfilled if successful
		 * chore: validate whether a paymentIntent already exists and is for the same orderId, else returns 0
		 * chore: validate whether order amount is what paymentIntent has paid, else return 2
		 * returns 1 on successful fulfilments
		 * otherwise, returns 0 on failed fulfilments
		 */

		var userData = qrillerDB.data.users[userId]
		if (userData == null) {
			// missing user
			return 0
		}

		var orderData = userData.orders
		if (orderData == null || orderData.current == null || orderData.current._isLocked === false) {
			// missing fields, no current order, or current order is not in a locked state
			return 0
		}

		var currentOrderData = orderData.current
		if (currentOrderData.stripePaymentIntentId != null && currentOrderData.stripePaymentAttachedForOrderId === currentOrderData.orderId) {
			// has a paymentIntent already attached, with matching orderId
			return 0
		}

		// get state of paymentIntent
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentCS)
		if (paymentIntent.status !== "succeeded") {
			// not the right state
			return 0
		}
		if (Math.abs(currentOrderData.amount - paymentIntent.amount) > 0.001) {
			// over marginal threshold
			return 2 // return value of 2, as specified in function's descriptor comments
		}

		// current order exists, paymentIntent status and amount matches
		// attach stripePaymentIntent, fulfil current order, build data to data.orders.fulfilled
		currentOrderData.stripePaymentIntentId = paymentIntent.id;
		currentOrderData.stripePaymentAttachedForOrderId = currentOrderData.orderId;

		// retrieve orderId
		var orderId = currentOrderData.orderId;
		if (userData.orders.fulfilled[orderId] != null) {
			// id generation should have checked for id collisisons within order.fulfilled
			// fail-safe, re-generate a whole orderId of 32 bytes long
		}

		// create new order payload in data.orders.fulfilled
		userData.orders.fulfilled[orderId] = {

		}

		// set current cart to be empty
		delete orderData.current;
	}
}