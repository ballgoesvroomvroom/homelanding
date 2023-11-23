/**
 * manages service related to Qriller site's framework
 * i.e. handling payment charges, fulfilling orders
 */
const path = require("path")
const dotenv = require("dotenv").config({path: path.join(__dirname, "../../.env")});
console.log(process.env.STRIPE_SECRET)
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const qriller = require("./qriller.js")
const qrillerDirectory = require("./qrillerDirectory.js")

const databaseInterface = require("../database/interface.js");
const qrillerDB = databaseInterface.qriller_users

class Manager {
	/**
	 * manages the user data within the supplied userid
	 */
	static getCurrentOrder(userId) {
		/**
		 * returns payload of current order if any, else returns null if current order does not exists
		 * payload: {
	 	 * 	amount: number, cents
		 * }
		 */

		var userData = qrillerDB.data.users[userId]
		if (userData == null || userData.orders == null || userData.orders.current == null || userData.orders.current.amount == null) {
			// missing fields
			console.log("[DEBUG]: attempting to retrieve current order for", userId, userData.orders.current)
			return;
		}

		return {
			amount: userData.orders.current.amount
		}
	}

	static getCurrentOrderLockState(userId) {
		/**
		 * returns true if data.orders.current._isLocked === true, else false (even if errors occur)
		 */

		var userData = qrillerDB.data.users[userId]
		if (userData == null || userData.orders == null || userData.orders.current == null || userData.orders.current._isLocked == null) {
			// missing fields
			return false;
		}

		return userData.orders.current._isLocked;
	}

	static lockCurrentOrder(userId, toLock = true) {
		/**
		 * locks current order and prevents further modification
		 * returns 1 on successful lock, else 0
		 */

		var userData = qrillerDB.data.users[userId]
		if (userData == null || userData.orders == null || userData.orders.current == null) {
			// missing fields
			return 0
		}

		userData.orders.current._isLocked = toLock;
		return 1; // success state
	}

	static async generateWorksheet(userId, topicCode) {
		/**
		 * generates the worksheet based on the topic code
		 * stores generated worksheet in data.worksheets
		 * returns the worksheet code (base16 representation)
		 * returns 0 if unsuccessful
		 */
		const split =  topicCode.split("-") // e.g. TC001-2

		let rootTopicCode = split[0]
		let data = qrillerDirectory[rootTopicCode]

		if (split.length === 2) {
			// mono series
			let subTopic = split[1]

			if (data == null) {
				return 0
			} else {
				data = data[subTopic]
				if (data == null) {
					return 0
				}
			}
		}

		// data contains the subtopic data
		if (data.code == null || data.title == null || data.note == null || data.path == null) {
			// empty fields
			console.warn("[WARN]: empty fields in qrillerDirectory.js for topic code", topicCode)
			return 0
		}

		// create qriller object
		const q = new qriller.Qriller({
			code: data.code,
			title: data.title,
			note: data.note
		})

		// build questions
		if (split.length === 2) {
			// mono series
			q.createQuestions(data.path, 200)
		} else {
			// standard series
			if (data.subTopics == null) {
				// no subtopics
				console.warn("[WARN]: .subTopics is null in qrillerDirectory.js for topic code", topicCode)
				return 0;
			}

			for (let subData of data.subTopics) {
				if (subData.path == null) {
					console.warn("[WARN]: no .path field for subTopic data in qrillerDirectory.js for topic code", topicCode, code)
					return 0;
				}

				q.createQuestions(subData.path, 40)
			}
		}

		// serialise data to be stored in database
		let seed = q.rngseed;


		// add it to data.worksheets
		const userData = qrillerDB.data.users[userId]
		if (userData == null) {
			// missing user
			return 0
		}
		if (userData.worksheets == null) {
			// missing fields
			userData.worksheets = {}
		}

		// generate a worksheet code
		var worksheetId;
		for (let i = 0; i < 10; i++) {
			worksheetId = crypto.randomBytes(32).toString("hex")
			if (userData.worksheets[worksheetId] == null) {
				// passed collision checks
				break
			} else if (i === 9) {
				// last attempt still not valid
				return 0 // unable to fail-safe
			}
		}

		userData.worksheets[worksheetId] = {
			title: `${data.code} | ${data.title}`,
			topicCode,
			seed, // store seed to deterministically generate worksheet on each call
			dateCreatedUnixEpochMS: +new Date()
		}

		return worksheetId
	}

	static async fulfilOrder(userId, paymentIntentCS) {
		/**
		 * userId: key for the qriller database
		 * paymentIntentCS: string, client secret of the server-side generated paymentIntent
		 *
		 * fulfils the current order tagged under qrillerDB
		 * validates whether user has current order (and it is locked), and status of paymentIntent == "succeeded"
		 * will modify the data.orders.current into data.orders.fulfilled if successful
		 * chore: validate whether a paymentIntent already exists and is for the same orderId, else returns 0
		 * chore: validate whether order amount is what paymentIntent has paid, else return 2
		 * chore: if order unable to be fulfilled by our side, returns 3
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
		// current order is locked (._isLocked === true), no modificatons can occur, following two appended data should stick with respective orders
		currentOrderData.stripePaymentIntentId = paymentIntent.id;
		currentOrderData.stripePaymentAttachedForOrderId = currentOrderData.orderId;

		// retrieve orderId
		var orderId = currentOrderData.orderId;
		if (userData.orders.fulfilled[orderId] != null) {
			// id generation should have checked for id collisisons within order.fulfilled
			// fail-safe, re-generate a whole orderId of 32 bytes long
			var newOrderId;
			for (let i = 0; i < 10; i++) {
				newOrderId = crypto.randomBytes(32).toString("hex")
				if (userData.orders.fulfilled[newOrderId] == null &&
					(userData.orders.current == null || userData.orders.current.orderId == null || userData.orders.current.orderId !== newOrderId)) {
					// no fulfilled data, or has current order whose orderId DOES NOT match the newly generated id
					currentOrderData.orderId = newOrderId
					orderId = newOrderId
					break
				} else if (i === 9) {
					// last attempt still not valid
					return 0 // unable to fail-safe
				}
			}
		}

		// create new order payload in data.orders.fulfilled
		userData.orders.fulfilled[orderId] = {
			orderId: orderId,
			worksheetIds: [],
			amount: currentOrderData.amount,
			stripePaymentIntentId: currentOrderData.stripePaymentIntentId,
			dateCreatedUnixEpochMS: currentOrderData.dateCreatedUnixEpochMS
		}

		// actual fulfillment of orders (generate worksheets and attach their resource locator (represented in base 16) into data.orders.fulfilled[orderId])
		// TO-DO
		for (let orderItem of currentOrderData.orderCart) {
			for (let i = 0; i < orderItem[1]; i++) {
				// iterate over the quantity
				var generatedWsId = await Manager.generateWorksheet(userId, orderItem[0])

				if (generatedWsId === 0) {
					// error thrown
					return 3;
				} else {
					userData.worksheets[generatedWsId].orderId = orderId // append new field, orderId to attach worksheet data to corresponding orderId
					userData.orders.fulfilled[orderId].worksheetIds.push(generatedWsId)
				}
			}
		}

		// set current cart to be empty (removes ._isLocked property, simultaneously unlocking current order to allow for modifications)
		delete orderData.current;

		// return 1 for success
		return 1
	}
}

module.exports = Manager