const baseURL = `/qriller`

const express = require("express");
const path = require("path");
const fs = require("fs")

const views = require("../../includes/views.js");
const qriller = require("../../includes/qriller.js");
const mem = require("../../includes/qrillerMemory.js");

const router = express.Router()
const presetRouter = express.Router()

// cache skeleton pages
class Skeleton {
	static document = fs.readFileSync(views.qriller.document, {encoding: "utf8", flag: "r"})
	static answerSheet = fs.readFileSync(views.qriller.answerSheet, {encoding: "utf8", flag: "r"})
}

// utils
class Utils {
	static hydrateDocument(documentId) {
		if (documentId in mem) {
			var qrillerObj = mem[documentId]
			var hydrated = Skeleton.document.replaceAll("%QRILLER-ID%", qrillerObj.id)
			hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", qrillerObj.title)
			hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note)

			return hydrated
		}
	}

	static hydrateAnswerSheet(documentId) {
		if (documentId in mem) {
			var qrillerObj = mem[documentId]
			var hydrated = Skeleton.answerSheet.replaceAll("%QRILLER-ID%", qrillerObj.id)
			hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", qrillerObj.title)
			hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note)

			return hydrated
		}
	}
}

// landing page (generate a new qrilerObj)
router.get("/", (req, res) => {
	res.type("html")

	// generate qriller object
	var qrillerObj = new qriller.Qriller()
	qrillerObj.title = "[2.1] Fractions to Percentage"
	qrillerObj.note = "Round off your answer to 3 significant figures."

	// attach new questions
	qrillerObj.createQuestions(qriller.FracToPerc, 50)

	// push reference
	qrillerObj.updateRefsToMem()

	var hydrated = Skeleton.document.replaceAll("%QRILLER-ID%", qrillerObj.id)
	hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", qrillerObj.title)
	hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note)

	res.write(hydrated)
	res.status(200).end()
})

// load a specific document
router.get("/:documentId", (req, res) => {
	// hydrate html document with qriller properties (fields)
	// questions are fetched and rendered on the client side
	var hydrated = Utils.hydrateDocument(req.params.documentId)
	if (hydrated) {
		res.write(hydrated)
		res.status(200).end()
	} else {
		res.status(404).sendFile(views.notFound)
	}
})

// load answer sheet for a specific document
router.get("/:documentId/ans", (req, res) => {
	// requires key query to match
	if (req.query.key !== "zls") {
		// 404 request to prevent exploiters from learning about anything
		return res.status(404).sendFile(views.notFound)
	}

	// hydrate html document with qriller poperties (fields)
	// answers are fetched and rendered on the client side
	var hydrated = Utils.hydrateAnswerSheet(req.params.documentId)
	if (hydrated) {
		res.write(hydrated)
		res.status(200).end()
	} else {
		res.status(404).sendFile(views.notFound)
	}
})

// load presets
presetRouter.get("/perctofrac", (req, res) => {
	res.type("html")

	// generate qriller object
	var qrillerObj = new qriller.Qriller()
	qrillerObj.title = "[2.2] Percentage to Fractions"
	qrillerObj.note = "Express your answer in the simplest form, without mixed fractions."

	// attach new questions
	qrillerObj.createQuestions(qriller.PercToFrac, 100)

	// push reference
	qrillerObj.updateRefsToMem()

	var hydrated = Skeleton.document.replaceAll("%QRILLER-ID%", qrillerObj.id)
	hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", qrillerObj.title)
	hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note)

	res.write(hydrated)
	res.status(200).end()
})
router.use("/presets", presetRouter)


module.exports = { // export router object and authenticated middleware
	baseURL, router
}