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
	static document = () => fs.readFileSync(views.qriller.document, {encoding: "utf8", flag: "r"})
	static answerSheet = fs.readFileSync(views.qriller.answerSheet, {encoding: "utf8", flag: "r"})
}

// utils
class Utils {
	static getDefaultProperties() {
		/*
		 * returns a dictionary representing the template data used to generate a Qriller object
		 */
		return {
			code: "", // e.g. "1.0"
			title: "",
			note: ""
		}
	}

	static populateDocument(q) {
		/*
		 * q: Qriller object
		 * reads Skeleton.document and hydrates it with data in the qriller object
		 * returns a string (html file read with proper line breaks)
		 */
		var hydrated = Skeleton.document().replaceAll("%QRILLER-ID%", q.id)
		hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", `[${q.code}] ${q.title}`)
		hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", q.note.replaceAll("\n", "<br>"))

		return hydrated
	}

	static generateQriller(res, code, title, note, qnClass, qnAmt, ...qnArgs) {
		// wrapper for res object, generates qriller
		res.type("html")

		// generate qriller object
		var qrillerObj = new qriller.Qriller()
		qrillerObj.code = code
		qrillerObj.title = title
		qrillerObj.note = note

		// attach new questions to .questions of qrillerObj
		qrillerObj.createQuestions(qnClass, qnAmt, ...qnArgs)

		// push reference
		qrillerObj.updateRefsToMem()

		var hydrated = Skeleton.document().replaceAll("%QRILLER-ID%", qrillerObj.id)
		hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", `[${qrillerObj.code}] ${qrillerObj.title}`)
		hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note.replaceAll("\n", "<br>"))

		res.write(hydrated)
		res.status(200).end()
	}

	static generateQrillerDynamic(res, code, title, note, qnObject) {
		// wrapper for res object, generates qriller
		// qnObject is an array which contains objects to generate qns
		// objects schema: [qnClass, qnAmt, [..constructorArgs]]
		res.type("html")

		// generate qriller object
		var qrillerObj = new qriller.Qriller()
		qrillerObj.code = code
		qrillerObj.title = title
		qrillerObj.note = note

		// attach new questions
		for (let i = 0; i < qnObject.length; i++) {
			var qnO = qnObject[i]
			qrillerObj.createQuestions(qnO[0], qnO[1], ...qnO[2])
		}

		// push reference
		qrillerObj.updateRefsToMem()

		var hydrated = Skeleton.document().replaceAll("%QRILLER-ID%", qrillerObj.id)
		hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", `[${qrillerObj.code}] ${qrillerObj.title}`)
		hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note.replaceAll("\n", "<br>"))

		res.write(hydrated)
		res.status(200).end()
	}

	static hydrateDocument(documentId) {
		if (documentId in mem) {
			var qrillerObj = mem[documentId]
			var hydrated = Skeleton.document().replaceAll("%QRILLER-ID%", qrillerObj.id)
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
	// home page
	res.type("html")
	res.sendFile(views.qriller.homePage)
})

router.get("/series", (req, res) => {
	// series page
	res.type("html")
	res.sendFile(views.qriller.seriesPage)
})

router.get("/topic-list", (req, res) => {
	// topic listing page
	res.type("html")
	res.sendFile(views.qriller.listingPage)
})

router.get("/status", (req, res) => {
	res.type("html")
	res.sendFile(views.qriller.worksheetDirectory)
})

router.get("/coverpage", (req, res) => {
	res.type("html")
	res.sendFile(views.qriller.worksheetCoverPage)
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

{
	presetRouter.get("/loi/0", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "1.0"
		data.title = "Laws of Indices Part I"
		data.note = "Manipulate algebraic expressions with indices in the form of\na^m * a^n = a^(m+n)\na^m / a^n = a^(m-n)"

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.LawOfIndices, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/loi/1", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "1.1"
		data.title = "Laws of Indices Part II"
		data.note = "Manipulate algebraic expressions with indices in the form of\na^0 = 1; (a^m)^n = a^(mn)\n(a*m)^b = a^b * m^b\na^(-n) = 1/a^n"

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.LawOfIndices, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/loi/2", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "1.2"
		data.title = "Laws of Indices Final Part"
		data.note = "Manipulate algebraic expressions with indices in the form of\na^m * a^n = a^(m+n)\na^m / a^n = a^(m-n)\na^0 = 1; (a^m)^n = a^(mn)\n(a*m)^b = a^b * m^b\na^(-n) = 1/a^n"

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.LawOfIndices, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/loi/3", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "1.3"
		data.title = "Standard Form"
		data.note = "Express numbers in standard, scientific form."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.StandardForm, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})
}

{
	presetRouter.get("/fump/0", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "2.0"
		data.title = "Factoring Univariate Polynomials"
		data.note = "Factor the polynomials with either known or unknown coefficients into the simplest form."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.FactorisingPolynomial, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})
}

{
	presetRouter.get("/quad/0", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "3.0"
		data.title = "Solving Linear Equations"
		data.note = "Solve the linear equations by finding x."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.LinearEquation, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/quad/1", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "3.1"
		data.title = "Systems of Linear Equations"
		data.note = "Solve the systems of linear equations."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.SimultaneousEquation, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/quad/2", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "3.2"
		data.title = "Quadratic Equations (factorisation)"
		data.note = "Solve the quadratic equation (polynomial degree 2) by factorisation."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.QuadraticRootsByFactorisation, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/quad/3", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "3.3"
		data.title = "Quadratic Equations (quadratic formula)"
		data.note = "Solve the quadratic equation (polynomial degree 2) by using the quadratic formula."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.QuadraticRootsByFormula, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/quad/4", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "3.4"
		data.title = "Quadratic Equations (complete the square)"
		data.note = "Solve the quadratic equation (polynomial degree 2) by completing the square method."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.QuadraticRootsBySquare, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/quad/5", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "3.5"
		data.title = "Quadratic Equations (fractional)"
		data.note = "Solve the quadratic equation (polynomial degree 2) that contains fractions."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.QuadraticRootsWithFractions, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})
}

{
	presetRouter.get("/diff/0", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "4.0"
		data.title = "Differentiating Univariate Polynomials (Power rule)"
		data.note = "Differentiate the equations via the Power rule."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.DifferentiatingPolynomialPowerRule, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/diff/1", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "4.1"
		data.title = "Differentiating Univariate Polynomials (Product rule)"
		data.note = "Differentiate the equations via the Product rule."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.DifferentiatingPolynomialProductRule, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/diff/2", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "4.2"
		data.title = "Differentiating Univariate Polynomials (Quotient rule)"
		data.note = "Differentiate the equations via the Quotient rule."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.DifferentiatingPolynomialQuotientRule, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})

	presetRouter.get("/diff/3", (req, res) => {
		const data = Utils.getDefaultProperties()

		data.code = "4.3"
		data.title = "Differentiating Univariate Polynomials (Chain rule)"
		data.note = "Differentiate the equations via the Chain rule."

		const q = new qriller.Qriller(data)
		q.createQuestions(qriller.DifferentiatingPolynomialChainRule, 100)

		res.write(Utils.populateDocument(q))
		res.status(200).end()
	})
}

// presetRouter.get("/perctofrac", (req, res) => {
// 	res.type("html")

// 	// generate qriller object
// 	var qrillerObj = new qriller.Qriller()
// 	qrillerObj.title = "[2.2] Percentage to Fractions"
// 	qrillerObj.note = "Expressing percentage as a fraction.\nExpress your answer in the simplest form, without mixed fractions."

// 	// attach new questions
// 	qrillerObj.createQuestions(qriller.PercToFrac, 100)

// 	// push reference
// 	qrillerObj.updateRefsToMem()

// 	var hydrated = Skeleton.document().replaceAll("%QRILLER-ID%", qrillerObj.id)
// 	hydrated = hydrated.replaceAll("%DOCUMENT-TITLE%", qrillerObj.title)
// 	hydrated = hydrated.replaceAll("%DOCUMENT-NOTE%", qrillerObj.note)

// 	res.write(hydrated)
// 	res.status(200).end()
// })

// presetRouter.get("/percincr", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"2.3.1",
// 		"Percentage Increase", "Calculate percentage increase from the given scenarios.\nRound off your answer to 3 significant figures wherever possible.",
// 		qriller.PercChange,
// 		100,
// 		true,
// 		true)
// })

// presetRouter.get("/percdecr", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[2.3.2] Percentage Decrease", "Calculate percentage decrease from the given scenarios.\nRound off your answer to 3 significant figures wherever possible.",
// 		qriller.PercChange,
// 		100,
// 		true,
// 		false)
// })

// presetRouter.get("/percchangeraw", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[2.3.3] Percentage Change", "Calculate percentage change between 2 numbers.\nRound off all your answers to 3 significant figures wherever possible.",
// 		qriller.PercChange,
// 		100,
// 		false)
// })

// presetRouter.get("/percchange", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[2.3.4] Percentage Change Word Problems", "Calculate percentage change from the given word problems.\nRound off your answer to 3 significant figures wherever possible.",
// 		qriller.PercChange,
// 		100,
// 		true)
// })

// presetRouter.get("/relpercincr", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[2.4.1] Percentage Manipulation [Increase]", "Increase a number by a factor relative to itself.\nRound off your answers to 3 significant figures wherever possible.",
// 		qriller.RelativePercManipulation,
// 		100,
// 		true)
// })

// presetRouter.get("/relpercdecr", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[2.4.2] Percentage Manipulation [Decrease]", "Decrease a number by a factor relative to itself.\nRound off your answers to 3 significant figures wherever possible.",
// 		qriller.RelativePercManipulation,
// 		100,
// 		false)
// })

// presetRouter.get("/expunitperc", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[2.5] Percentage Express Relative Units", "Express units relative to one another.\nRound off your answers to 3 significant figures wherever possible.",
// 		qriller.ExpressUnitPerc,
// 		100,
// 		true)
// })

// presetRouter.get("/relperc", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[2.6] Percentage Of", "Calculate a result based on the percentage of a number.\nRound off your answers to 3 significant figures wherever possible.",
// 		qriller.RelativePerc,
// 		100)
// })

// presetRouter.get("/revperc", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[2.7] Reverse Percentage", "Find a number given based on its percentage part.\nRound off your answers to 3 significant figures wherever possible.",
// 		qriller.ReversePerc,
// 		100)
// })

// presetRouter.get("/simplalge", (req, res) => {
// 	return Utils.generateQrillerDynamic(
// 		res,
// 		"[3.1] Simplification of Algebraic Expressions", "Manipulate algebraic terms and simplify each expression to their simplest form.",
// 		[[qriller.SimplifyAlgebraic, 40, [1]], [qriller.SimplifyAlgebraic, 60, [2]]])
// })

// presetRouter.get("/simplalgemult", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[3.1.1] Simplification of Algebraic Expressions Part II", "Manipulate algebraic terms and simplify each expression to their simplest form.",
// 		qriller.SimplifyAlgebraic,
// 		100,
// 		2)
// })

// presetRouter.get("/simplalgeparent", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[3.1.2] Simplification of Algebraic Expressions Part II", "Manipulate algebraic terms and simplify each expression to their simplest form.",
// 		qriller.SimplifyAlgebraic,
// 		100,
// 		3)
// })

// presetRouter.get("/algetest", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[3.1.2] Simplification of Algebraic Expressions Part II", "Manipulate algebraic terms and simplify each expression to their simplest form.",
// 		qriller.FutureAlgebra,
// 		100,
// 		4)
// })

// presetRouter.get("/oop/1.1", (req, res) => {
// 	return Utils.generateQriller(
// 		res,
// 		"[1.1.2] Simplification of Algebraic Expressions Part II", "Manipulate algebraic terms and simplify each expression to their simplest form.",
// 		qriller.OOPInt,
// 		100)
// })

router.use("/presets", presetRouter)

module.exports = { // export router object and authenticated middleware
	baseURL, router
}