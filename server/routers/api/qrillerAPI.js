const baseURL = `/${encodeURIComponent("qriller")}`

const express = require("express")
const path = require("path")

const mem = require(path.join(__dirname, "../../includes/qrillerMemory.js"))
const auth_router = require(path.join(__dirname, "../auth_router.js"));

const router = express.Router()

// fetches questions in a specific document
router.get("/db/:documentId", (req, res) => {
	// return a js script to be runned in the browser
	if (req.params.documentId in mem) {
		var qriller = mem[req.params.documentId]
		var plaintextqns = qriller.questions.map(qnObj => [qnObj.question, qnObj.equationList])

		res.type("text/javascript")
		res.write(`var QRILLER_ID = "${req.params.documentId}"; var QUESTIONS = ${JSON.stringify(plaintextqns)};`)
		return res.status(200).end()
	}

	return res.status(404).end()
})

module.exports = { // export router object and authenticated middleware
	baseURL, router
}