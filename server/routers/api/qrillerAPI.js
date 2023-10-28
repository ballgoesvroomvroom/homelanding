const baseURL = `/${encodeURIComponent("qriller")}`

const express = require("express")
const path = require("path")

const topicsData = require(path.join(__dirname, "../../../server-locked-resource/qrillerTopics.json"))

const mem = require(path.join(__dirname, "../../includes/qrillerMemory.js"))
const auth_router = require(path.join(__dirname, "../auth_router.js"));

const router = express.Router()

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

module.exports = { // export router object and authenticated middleware
	baseURL, router
}