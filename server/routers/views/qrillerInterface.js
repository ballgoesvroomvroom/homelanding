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
	static generateQriller(res, title, note, qnClass, qnAmt, ...qnArgs) {
		// wrapper for res object, generates qriller
		res.type("html")

		// generate qriller object
		var qrillerObj = new qriller.Qriller()
		qrillerObj.title = title
		qrillerObj.note = note

		// attach new questions
		qrillerObj.createQuestions(qnClass, qnAmt, ...qnArgs)

		// push reference
		qrillerObj.updateRefsToMem()

		var hydrated = Skeleton.document.replaceAll("%QRILLER-ID%", qrillerObj.id)
		hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", qrillerObj.title)
		hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note.replaceAll("\n", "<br>"))

		res.write(hydrated)
		res.status(200).end()
	}

	static hydrateDocument(documentId) {
		if (documentId in mem) {
			var qrillerObj = mem[documentId]
			var hydrated = Skeleton.document.replaceAll("%QRILLER-ID%", qrillerObj.id)
			hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", qrillerObj.title)
			hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note.replaceAll("\n", "<br>"))

			return hydrated
		}
	}

	static hydrateAnswerSheet(documentId) {
		if (documentId in mem) {
			var qrillerObj = mem[documentId]
			var hydrated = Skeleton.answerSheet.replaceAll("%QRILLER-ID%", qrillerObj.id)
			hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", qrillerObj.title)
			hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note.replaceAll("\n", "<br>"))
			hydrated = hydrated.replaceAll("%DOCUMENT-ANSWERSHEET-KEY%", "zls")

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

router.get("/status", (req, res) => {
	res.type("html")
	res.sendFile(views.qriller.worksheetDirectory)
})

router.get("/engine/test", (req, res) => {
	res.type("html")
	res.sendFile(views.qriller.engineTestInterface)
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
	qrillerObj.note = "Expressing percentage as a fraction.\nExpress your answer in the simplest form, without mixed fractions."

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

presetRouter.get("/percincr", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.3.1] Percentage Increase", "Calculate percentage increase from the given scenarios.\nRound off your answer to 3 significant figures wherever possible.",
		qriller.PercChange,
		100,
		true,
		true)
})

presetRouter.get("/percdecr", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.3.2] Percentage Decrease", "Calculate percentage decrease from the given scenarios.\nRound off your answer to 3 significant figures wherever possible.",
		qriller.PercChange,
		100,
		true,
		false)
})

presetRouter.get("/percchangeraw", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.3.3] Percentage Change", "Calculate percentage change between 2 numbers.\nRound off all your answers to 3 significant figures wherever possible.",
		qriller.PercChange,
		100,
		false)
})

presetRouter.get("/percchange", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.3.4] Percentage Change Word Problems", "Calculate percentage change from the given word problems.\nRound off your answer to 3 significant figures wherever possible.",
		qriller.PercChange,
		100,
		true)
})

presetRouter.get("/relpercincr", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.4.1] Percentage Manipulation [Increase]", "Increase a number by a factor relative to itself.\nRound off your answers to 3 significant figures wherever possible.",
		qriller.RelativePercManipulation,
		100,
		true)
})

presetRouter.get("/relpercdecr", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.4.2] Percentage Manipulation [Decrease]", "Decrease a number by a factor relative to itself.\nRound off your answers to 3 significant figures wherever possible.",
		qriller.RelativePercManipulation,
		100,
		false)
})

presetRouter.get("/expunitperc", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.5] Percentage Express Relative Units", "Express units relative to one another.\nRound off your answers to 3 significant figures wherever possible.",
		qriller.ExpressUnitPerc,
		100,
		true)
})

presetRouter.get("/relperc", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.6] Percentage Of", "Calculate a result based on the percentage of a number.\nRound off your answers to 3 significant figures wherever possible.",
		qriller.RelativePerc,
		100)
})

presetRouter.get("/revperc", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.7] Reverse Percentage", "Find a number given based on its percentage part.\nRound off your answers to 3 significant figures wherever possible.",
		qriller.ReversePerc,
		100)
})

presetRouter.get("/simplalge", (req, res) => {
	return Utils.generateQriller(
		res,
		"[3.1] Simplifcation of Algebraic Equations", "Manipulate algebraic terms and simplify each expression to their simplest form.",
		qriller.SimplifyAlgebraic,
		100,
		false)
})
presetRouter.get("/simplalgeparent", (req, res) => {
	return Utils.generateQriller(
		res,
		"[2.7] Simplifcation of Algebraic Equations Part II", "Manipulate algebraic terms and simplify each expression to their simplest form.",
		qriller.ModernAlgebra,
		100)
})

router.use("/presets", presetRouter)

module.exports = { // export router object and authenticated middleware
	baseURL, router
}