const qriller = require("./qriller.js")

const DIRECTORY = {
	"TC001": {
		code: "1",
		title: "Indices",
		note: "Basic law of indices",

		subTopics: {
			'1': {
				code: "1.0",
				title: "Law of Indices Part I",
				note: "Manipulate algebraic expressions with indices in the form of\na^m * a^n = a^(m+n)\na^m / a^n = a^(m-n)",
				path: qriller.LawOfIndices
			},
			'2': {
				code: "1.1",
				title: "Law of Indices Part II",
				note: "Manipulate algebraic expressions with indices in the form of\na^0 = 1; (a^m)^n = a^(mn)\n(a*m)^b = a^b * m^b\na^(-n) = 1/a^n",
				path: qriller.LawOfIndices
			},
			'3': {
				code: "1.2",
				title: "Law of Indices Final Part",
				note: "Manipulate algebraic expressions with indices in the form of\na^m * a^n = a^(m+n)\na^m / a^n = a^(m-n)\na^0 = 1; (a^m)^n = a^(mn)\n(a*m)^b = a^b * m^b\na^(-n) = 1/a^n",
				path: qriller.LawOfIndices
			},
			'4': {
				code: "1.3",
				title: "Standard Form",
				note: "Express numbers in standard, scientific form.",
				path: qriller.StandardForm
			}
		}
	}
}

modue.exports = DIRECTORY;