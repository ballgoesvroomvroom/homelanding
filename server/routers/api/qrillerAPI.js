const baseURL = `/${encodeURIComponent("qriller")}`

const express = require("express");
const path = require("path");
const dotenv = require("dotenv").config({path: path.join(__dirname, "../../../.env")});
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const databaseInterface = require("../../database/interface.js");
const qrillerDB = databaseInterface.qriller_users

const topicsData = require(path.join(__dirname, "../../../server-locked-resource/qrillerTopics.json"))

const mem = require(path.join(__dirname, "../../includes/qrillerMemory.js"))
const auth_router = require(path.join(__dirname, "../auth_router.js"));

const router = express.Router()

const ALLOWED_CURRENCIES = ["sgd", "usd"]

// fetches questions in a specific document
router.get("/db/:documentId/qns", (req, res) => {
	// return a js script to be runned in the browser
	if (req.params.documentId in mem) {
		var qriller = mem[req.params.documentId]
		var plaintextqns = qriller.questions.map(qnObj => [qnObj.qnReprString, qnObj.qnLatexEqn])

		res.type("text/javascript")
		res.write(`
			var QRILLER_ID = "${req.params.documentId}";
			var QRILLER_TITLE = "${qriller.title}";
			var QRILLER_CODE = "${qriller.code}";
			var QRILLER_CREATE_DATE = "${qriller.createDateRepr}";
			var QUESTIONS = ${JSON.stringify(plaintextqns)};
			var PAPER_SETUP = {"style": "workbook", "pageSize": "A4", "qnHtFactor": 1.25, "qnColumn": 2}`)
		return res.status(200).end()
	}

	return res.status(404).end()
})

// fetches answers
router.get("/db/:documentId/ans", (req, res) => {
	// return a js script to be runned in the browser

	// verify key first
	if (req.query.key !== "zls") {
		// 404 status to prevent exploiters from learning about anything
		return res.status(404).end()
	}

	if (req.params.documentId in mem) {
		var qriller = mem[req.params.documentId]

		var plaintextanswers = qriller.questions.map(qnObj => {
			var answerObj = qnObj.answerObj
			if (answerObj.isAlgebraic) {
				return [answerObj.ansReprString, answerObj.ansLatexEqn]
			} else {
				return [answerObj.ansReprString]
			}
		})

		res.type("text/javascript")
		res.write(`var QRILLER_ID = "${req.params.documentId}"; var ANSWERS = ${JSON.stringify(plaintextanswers)};`)
		return res.status(200).end()
	}

	return res.status(404).end() // 404 status to minimise information that is going out
})

// SAVE CART TO SERVER
router.post("/cart/overwrite", (req, res) => {
	/** 
	 * accepts a JSON object defining the entire cart's details in the schema,
	 * [
	 *	[topicCode-indexIfAny: string, qtyNumber: number]
	 * ]
	 * builds .cartItems and .cartItemsRepresentative of req.session
	 * returns a 200 status on success, otherwise 500 on server failure, if not 400 on bad syntax in requests
	 */
	console.log("SUPPLIED", req.body)
	var suppliedArr
	if (req.body.suppliedArr != null) {
		suppliedArr = req.body.suppliedArr
	} else {
		return res.status(400).end()
	}

	if (req.session.currentOrder.isValid === true) {
		// ongoing cart session, invalidate current card session
		req.session.currentOrder.isValid = false
	}

	// validate suppliedArr's dimension
	if (suppliedArr.length == null || suppliedArr.length === 0) {
		// nothing in cart??
		return res.status(400).end()
	}

	// validate suppliedArr and build .cartItemsRepresentative at the same time
	var cartItemsRepresentative = []
	try {
		for (let i = 0; i < suppliedArr.length; i++) {
			var ele = suppliedArr[i]
			if (ele.length !== 2) {
				// not valid syntax
				return res.status(400).end()
			}

			var split = ele[0].split("-") // will error if ele[0] is not of string type
			if (split.length === 0) {
				// empty ele[0], i.e. no uniqueCode supplied (empty string)
				return res.status(400).end()
			}

			var idx = topicsData.mapping.indexOf(split[0])
			if (idx === -1) {
				// no topic code exists for this
				return res.status(400).end()
			} else {
				// add topic title representation and qty to cartItemsRepresentative
				var title
				if (split.length === 2) {
					// has a sub topic
					title = topicsData.data[idx][3][parseInt(split[1])] // to throw error when split[1] is not an integer, i.e. TC001-X, x is not an integer
					title = `${idx +1}.${split[1]} | ${title}` // prepend topic number
				} else if (split.length === 1) {
					title = `${idx +1} | ${topicsData.data[idx][1]}`
				} else if (split.length >= 3) {
					// invalid unique code format
					return res.status(400).end()
				}

				cartItemsRepresentative.push([title, ele[1]])
			}
		}
	} catch (err) {
		// invalid request data input
		return res.status(400).end()
	}

	// post-validation, suppliedArr is valid
	console.log("PERFECT", cartItemsRepresentative)
	req.session.cartItems = suppliedArr
	req.session.cartItemsRepresentative = cartItemsRepresentative
	return res.status(200).end()
})

// SHOP
router.get("/shop/getTotal", auth_router.authenticated, (req, res) => {
	/**
	 * returns a JSON object with the following keys:
	 *	username: string, username of the user to verify the total he/she is paying is for her account
	 *	totalPrice: string
	 *	itemNames: [[topicName: string, qtyOrdered: number], ...]
	 * returns 403 forbidden if shopping cart is empty
	 */

	if (req.session.cartItems == null || req.session.cartItems.length === 0) {
		// missing or empty cart (yet to be set?)
		return res.status(403).end()
	}

	// calculate total
	var total = 0
	for (let i = 0; i < req.session.cartItems.length; i++) {
		total += 5 *req.session.cartItems[i][1]
	}
	
	return res.status(200).json({
		username: req.session.username,
		totalPrice: total.toFixed(2), // returns string representation
		itemNames: req.session.cartItemsRepresentative
	})
})

// ORDER
router.get("/shop/createOrder", auth_router.authenticated, (req, res) => {
	/**
	 * creates a new order under the tagged user, into qrillerDB
	 * returns object containing the items, total, currency to be used
	 * 
	 * will over-write the current existing order, if any; unless currentorder._isLocked is true
	 * if order fails to create, returns 403 forbidden
	 */
	if (req.session.cartItems.length === 0) {
		// empty cart, nothing to create order with
		return res.status(403).end()
	}

	var userData = qrillerDB.data.users[req.session.userId]
	if (userData.orders.current != null && userData.orders.current._isLocked === true) {
		// current order exists and is locked from further modification
		return res.status(403).end()
	}

	// populate cart data in data.orders.current
	userData.orders.current.orderId = crypto.randomBytes(32).toString("hex") // generate order id
	userData.orders.current.orderCart = req.session.cartItems.map(r => [...r]) // create a shallow copy
	userData.orders.current.amount = req.session.cartItems.reduce((sum, currEle) => sum +(5 *currEle[1]), 0) // $5 for each quantity and topic

	return res.status(200).json({
		creation: "OKAY",
		username, userData.username, // for user to ensure name is his
		total: userData.orders.current.amount, // return as cents
		totalRepr: (userData.orders.current.amount /100).toFixed(2), // return as a representative string
		itemNames: req.session.cartItemsRepresentative, // return the built representative
	})
})

// PROCESSING PAYMENT END (TO RETURN DEFINITE OKAY|ERROR STATES BEFORE PURCHASE IS CONFIRMED)
// last line of authorisation before order is granted
router.post("/shop/processPayment", auth_router.authenticated, (req, res) => {
	/**
	 * POST /shop/processPayment
	 *
	 * 1. validates order's total tallies with payment received
	 * 2. processes the token supplied by payment method, to be supplied into Stripe's API (payment processor) for processing
	 *
	 * POST body:
	 * 	token: string, token returned by payment method
	 * 	amount: number, 64-bit floating point
	 * 	currency: "sgd"|"usd", currency type
	 */

	// validate if order exists
	if (req.session.currentOrder.isValid === false) {
		// order not created yet, forbidden
		return res.status(403).end()
	}

	// validate body has .token as a string
	if (!req.body.hasOwnProperty("token") || typeof req.body["token"] !== "string") {
		return res.status(400).end() // bad request
	}
	if (!req.body.hasOwnProperty("amount") || typeof req.body["amount"] !== "number") {
		return res.status(400).end()
	}
	if (!req.body.hasOwnProperty("currency") || typeof req.body["currency"] !== "string") {
		return res.status(400).end()
	} else {
		// executes .hasOwnProperty's function
		var validCurrency = false
		for (let i = 0; i < ALLOWED_CURRENCIES.length; i++) {
			if (ALLOWED_CURRENCIES[i] === req.body["currency"]) {
				validCurrency = true
				break
			}
		}

		if (validCurrency === false) {
			return res.status(400).end() // invalid currency supplied
		}
	}

	// validate if supplied amount to be paid matches order's total (lowest unit should be cents, should not hit marginal error unless values mismatched)
	if (Math.abs(req.body.amount -req.session.currentOrder.total) > 0.0001) {
		// allow for marginal discrepenacies
		// price discrepenacies too high, forbidden to process
		return res.status(403).end()
	}

	// lock current order while order is processing
	orderPayload._isLocked = true
	
	// create a stripe payment method based on the token supplied
	const paymentMethod = stripe.paymentMethods.create({
		type: "card",
		card: {
			token: req.body.token
		}
	}).catch(err => {
		console.warn(`[ERROR]: UNABLE TO INVOKE stripe.paymentMethods.create WITH ERROR`, err)

		// end connection
		res.status(400).end()

		return new Promise.reject(-1) // exit
	})

	// create a payment intent
	paymentMethod.then(paymentMethodObj => {
		// paymentMethodObj: paymentMethod object returned by stripe api
		return stripe.paymentIntents.create({
			amount: Math.floor(req.body.amount *100),
	        currency: req.body.currency,
			payment_method: paymentMethodObj.id,
			confirm: true
		})
	}).then(paymentIntentObj => {
		// store the paymentIntent status to be checked
		req.session.currentOrder.paymentIntentId = paymentIntentObj.id;
		switch (paymentIntentObj.status) {
			case "succeeded":
				// fulfil order
				break
			case "requires_payment_method":
				// need to retry with different payment method
				break
			case "requires_action":
				// further action required
				// such as 3DS
				console.warn("CONFIRMING PAYMENT INTENT REQUIRES FURTHER ACTION");
				break

			default:
				console.warn("CONFIRMING PAYMENT INTENT RESOLVED WITH .status,", paymentIntentObj.status)
		}
		if (paymentIntentObj.status === "succeeded") {
			// succees
		}
	})
})

module.exports = { // export router object and authenticated middleware
	baseURL, router
}