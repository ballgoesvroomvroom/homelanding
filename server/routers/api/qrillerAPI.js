const baseURL = `/${encodeURIComponent("qriller")}`

const express = require("express")
const path = require("path")

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

// SHOP
router.get("/shop/getTotal", (req, res) => {
	/**
	 * returns a JSON object with the following keys:
	 *	totalPrice: string
	 *	itemNames: [[topicName: string, qtyOrdered: number], ...]
	 */
	return res.status(200).json({
		totalPrice: "15.00",
		itemNames: [["1 | Indices", 3]]
	})
})

module.exports = { // export router object and authenticated middleware
	baseURL, router
}