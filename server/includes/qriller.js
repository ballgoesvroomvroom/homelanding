const crypto = require("crypto")
const {rando, randoSequence} = require('@nastyox/rando.js');
const mem = require("./qrillerMemory.js");
const grain = require("./qrillerSolverEngine.js");

const Fraction = grain.Fraction

class Qriller {
	constructor(data) {
		/*
		 * constructs a new Qriller object with properties defined in data
		 * Qriller object represents an entire worksheet, it contains the data representing the questions and worksheets as a whole
		 * data: {
		 *	code: str, // e.g. "1.0"
		 *	title: str,
		 *	note: str
		 * }
		 */
		this.id = crypto.randomBytes(16).toString("hex")

		this.code = data.code
		this.createDateRepr = (new Date()).toLocaleDateString("en-SG", { "year": "numeric", "month": "short", "day": "numeric" })
		this.title = data.title
		this.note = data.note
		this.questions = []

		// updat refs
		this.updateRefsToMem()
	}

	createQuestions(questionClass, repeatCount, ...args) {
		// ...args use to pass into qnClass for construction
		for (let i = 0; i < repeatCount; i++) {
			this.questions.push(new questionClass(...args))
		}
	}

	serialiseQuestions() {
		/**
		 * reads this.questions and serialises it into a single string
		 * returns the string representation of this.questions
		 */
		
	}

	serialiseAnswers() {

	}

	updateRefsToMem() {
		// expose qriller instance to shared memory so API side can reference it
		mem[this.id] = this
	}
}

class Database {
	// objects to be used in word scenarios
	static people = ["John", "Emma", "Michael", "Olivia", "William", "Ava", "James", "Isabella", "Alexander", "Sophia", "Daniel", "Mia", "David", "Charlotte", "Joseph", "Amelia", "Matthew", "Harper", "Samuel", "Evelyn", "Henry", "Abigail", "Andrew", "Emily", "Gabriel", "Elizabeth", "Benjamin", "Sofia", "Christopher", "Ella", "Jackson", "Victoria", "Anthony", "Avery", "Jonathan", "Grace", "Ryan", "Chloe", "Nicholas", "Scarlett", "Christian", "Zoey", "Nathan", "Lily", "Adam", "Hannah", "Thomas", "Madison", "Joshua", "Layla", "Aaron", "Aubrey", "Ethan", "Penelope", "William", "Eleanor", "Logan", "Nora", "Isaac", "Riley", "Elijah", "Savannah", "Connor", "Brooklyn", "Owen", "Leah", "Caleb", "Zoe", "Luke", "Stella", "Isaiah", "Hazel", "Jack", "Ellie", "Jordan", "Paisley", "Jeremiah", "Audrey", "Liam", "Skylar", "Wyatt", "Violet", "Sebastian", "Claire", "Jayden", "Bella", "Julian", "Lucy", "Carter", "Anna", "Brayden", "Samantha", "Gavin", "Caroline", "Levi", "Genesis", "Austin", "Aaliyah", "Charles", "Kennedy", "Hunter", "Kylie", "Aaron", "Allison", "Jason", "Maya", "Ian", "Sarah", "Connor", "Madelyn", "Colton", "Adeline", "Dominic", "Alexa", "Kevin", "Ariana", "Evan", "Elena", "Cooper", "Gabriella", "Henry", "Naomi", "Hudson", "Alice", "Adrian", "Sadie", "Jace", "Hailey", "Dylan", "Eva", "Leo", "Emilia", "Lucas", "Autumn", "Eli", "Piper", "Max", "Nevaeh", "Nolan", "Ruby", "Miles", "Serenity", "Elias", "Aria", "Brady", "Kaylee", "Adam", "Annabelle", "Asher", "Alyssa", "Jaxon", "Taylor", "Greyson", "Brielle", "Roman", "Lillian", "Santiago", "Angelina", "Mateo", "Liliana", "Sawyer", "Ashley", "Diego", "Lauren", "Leonardo", "Gianna", "Caleb", "Peyton", "Finn", "Adalyn", "Jayce", "Arianna", "Luis", "Makayla", "Maxwell", "Addison", "Axel", "Natalie", "Nathaniel", "Mia", "Juan", "Brooke", "Bryson", "Leila", "Carlos", "Nicole"]
	static things = ["apple", "fruit", "pen", "orange", "banana", "book", "car", "dog", "cat", "chair", "table", "computer", "phone", "cup", "shirt", "shoe", "ball", "guitar", "hat", "bottle", "watch", "key", "camera", "sock", "flower", "cookie", "lamp", "bag", "bicycle", "knife", "chair", "pencil", "paper", "notebook", "umbrella", "glasses", "ring", "wallet", "headphone", "clock", "brush", "mirror", "globe", "tie", "scarf", "plate", "spoon", "fork", "knife", "pillow", "bed", "blanket", "wallet", "door", "window", "bookshelf", "candle", "oven", "refrigerator", "television", "toothbrush", "toothpaste", "soap", "towel", "shirt", "pants", "dress", "sock", "shoe", "sweater", "jacket", "coat", "belt", "hat", "gloves", "boots", "earrings", "bracelet", "necklace", "ring", "watch", "glasses", "bag", "backpack", "suitcase", "camera", "laptop", "keyboard", "mouse", "charger", "bottle", "cup", "plate", "spoon", "fork", "knife", "napkin", "tablecloth", "vase", "flower", "lamp", "candle", "painting", "sculpture", "guitar", "drum", "piano", "violin", "trumpet", "flute", "basketball", "soccer ball", "baseball", "tennis ball", "golf ball", "volleyball", "football", "helmet", "bat", "glove", "net", "brush", "comb", "mirror", "hairdryer", "soap", "shampoo", "conditioner", "toothbrush", "toothpaste", "towel", "lotion", "perfume", "wallet", "key", "phone", "tablet", "camera", "headphone", "speaker", "clock", "remote", "charger", "umbrella", "suitcase", "backpack", "map", "guidebook", "passport", "ticket", "sunglasses", "hat", "sunscreen", "water bottle", "snack", "camera", "binoculars", "journal", "pencil", "pen", "notebook", "bookmark", "calendar", "calculator", "ruler", "tape", "scissors", "glue", "stapler", "paperclip", "eraser", "highlighter", "folder", "envelope", "sticker", "postcard", "stamp", "paper"]
	static rigidbody = ["car", "bike"]
}

class Unknowns {
	// determinants
	static constants = ["a", "b", "c", "d"]
	static axis = ["i", "j", "k"]
	static determinants = ["x", "y", "z"]
	static indices = ["n", "m", "i", "j", "k", "g"]
	static greekDeterminants = ["ɑ"]
}

class Units {
	// mathematical units
	units = { // USES SI NOTATION
		a: 1, // root unit
		b: 100,
		c: 1000 // 400 root units
	}

	constructor(num) {
		this.num = num
	}

	convert(from, to) {
		if (from === to) {
			// same value, save unncessary operations
			return this.num
		}

		var a = this.units[from]
		var b = this.units[to]
		var factor = a / b

		return this.num * factor
	}
}

class BaseTenUnits extends Units {
	units = {
		"billionth": 0.000001, // 10^-3
		"millionth": 0.000001, // 10^-3
		"thousandth": 0.001, // 10^-3
		"one": 1,
		"hundred": 100, // 10^2
		"thousand": 1000, // 10^3
		"million": 1000000, // 10^6
		"billion": 1000000000, // 10^9
	}

	static unitMap = ["billionth", "millionth", "thousandth", "one", "hundred", "thousand", "million", "billion"]
}

class LengthUnit extends Units {
	units = {
		"mm": 1,
		"cm": 10,
		"m": 1000,
		"km": 1000000
	}
	static unitMap = ["mm", "cm", "m", "km"]
}

class TimeUnit extends Units {
	units = {
		"s": 1,
		"min": 60,
		"hr": 3600,
	}
	static unitMap = ["s", "min", "hr"]
}

class Mass extends Units {
	units = {
		"g": 1,
		"kg": 1000
	}
	static unitMap = ["g", "kg"]
}

class LiquidVolume extends Units {
	units = {
		"ml": 1,
		"cm3": 1,
		"l": 1000
	}
	static unitMap = ["ml", "cm3", "l"]
}

class Volume extends Units {
	units = {
		"mm3": 1,
		"cm3": 1000,
		"m3": 1000000000,
		"km3": 1e18,
	}
	static unitMap = ["mm3", "cm3", "m3", "km3"]
}

class AlgebraicEqn {
	// container class for algebraicexpr
	constructor(variables, polynomialDegree) {
		// variables: array of characters to be used as variables
		// polynomialDegree: integer, denoting degree of the polynomial generated (1 for a simple linear expression, has to be >= 1)
		this.variables = variables

		// build coefficient object
		this.coefficients = []
		for (let i = 0; i < this.variables.length; i++) {
			this.coefficients.push({
				"sum": 0,
				degree: [...Array(polynomialDegree)],
			})
		}

		// build string
		this.r = ""

		// generate 2 parenthesis section
		for (let i = 0; i < 2; i++) {
			// generate a factor for parenthesis group
			var factor = rando(1, 7) * (rando() >= .6 ? -1 : 1) // can be negative coefficient for parenthesis group

			// expression content
			var newExpr = new AlgebraicExpr(this.variables, polynomialDegree)

			// determine prefix
			var prefix = "";
			if (factor < 0) {
				prefix = "-"
			} else if (this.r.length > 0) {
				prefix = "+"
			}

			// determine coefficient
			var factorCoeff = ""
			if (Math.abs(factor) > 1) {
				factorCoeff = Math.abs(factor)
			}

			// build string
			this.r += `${prefix}${factorCoeff}(${newExpr.jumble(1, 4)})`

			// modify this.coefficients object
			for (let j = 0; j < this.variables.length; j++) {
				this.coefficients[j].sum = newExpr.coefficients[j].sum
				for (let k = 0; k < newExpr.coefficients[j].degree.length; k++) {
					this.coefficients[j].degree[k] = newExpr.coefficients[j].degree[k] * factor
				}
			}
		}
	}

	cleanRepr() {
		// returns a string representation of every variables
		var r = ""
		for (let i = 0; i < this.variables.length; i++) {
			for (let j = 0; j < this.coefficients[i].degree.length; j++) {
				// determine prefix
				var prefix = "";
				if (this.coefficients[i].degree[j] < 0) {
					prefix = "-"
				} else if (r.length > 0) {
					prefix = "+" // signs needed for second term onwards
				}

				// determine coefficient
				var coeffRepr = "";
				if (Math.abs(this.coefficients[i].degree[j]) > 1) {
					// coefficient is more than 1 (either neg or pos)
					coeffRepr = Math.abs(this.coefficients[i].degree[j])
				}

				// determine exponent
				var expo = "";
				if (j >= 1) {
					// j = 1, square term, j = 2, cubic term
					expo = `^${j + 1}`
				}

				// build string
				r += `${prefix}${coeffRepr}${this.variables[i]}${expo}`
			}
		}

		return r
	}
}

class JumbleAlgebraicExpr {
	constructor(options) {
		// options: {variableStyles: char[], containsNeg: boolean, containsMultOp: boolean, argsRange: int[] size 2, trimTrilingPrefix: boolean}
		// argsRange is inclusive
		// look ahead approach
		var initialN = rando(2, 50)
		var argsNo = rando(...options.argsRange)

		var terms = ""; // build terms here
		var nextCoeff = "";
		var nextBase = null;
		var nextBaseForceConstant = false // for multiplication, prevent squares
		var nextNegBaseEncapsulateInParenthesis = false // if true, will encapsulate next negative integer with parenthesis
		for (let i = 0; i < argsNo; i++) {
			var coeff, base, op;
			if (nextCoeff) {
				// use coeff
				coeff = nextCoeff
				base = (rando() >= .85) ? nextBase : "" // empty base (division)

				// reset forced coeff values
				nextCoeff = null;
				nextBase = null;

				// next operation has to be add / subtraction
				op = 1
			} else {
				// determine operation first, if its division, need to generate a base first
				if (rando() >= 0.85) {
					// mult operation
					op = 2;

					coeff = rando(1, Math.floor(initialN / 3)) * ((options.conainsNeg && rando() >= .85) ? -1 : 1)
					base = nextBaseForceConstant ? "" : options.variableStyles[rando(0, options.variableStyles.length - 1)]

					nextBaseForceConstant = true // force constant
					nextNegBaseEncapsulateInParenthesis = true // need to wrap neg with parenthesis
				} else if (i < argsNo - 1 && rando() >= 0.85) {
					// division (ONLY if this control loop is resp for generating next term)
					op = 3

					// generate a base
					var varChoice = options.variableStyles[rando(0, options.variableStyles.length - 1)]
					nextCoeff = rando(1, initialN) * ((options.conainsNeg && rando() >= .85) ? -1 : 1)
					nextBase = varChoice
					base = varChoice

					coeff = nextCoeff * rando(1, 6) * ((options.conainsNeg && rando() >= .85) ? -1 : 1) // random factor with negative factor

					// make sure next term generated is a constant
					nextBaseForceConstant = true
					nextNegBaseEncapsulateInParenthesis = true // need to wrap neg with parenthesis
				} else {
					// op is 1, adition OR subtraction
					op = 1;
					coeff = rando(1, initialN) * ((options.conainsNeg && rando() >= .85) ? -1 : 1)
					base = nextBaseForceConstant ? "" : options.variableStyles[rando(0, options.variableStyles.length - 1)]

					nextBaseForceConstant = false // reset force constant
					nextNegBaseEncapsulateInParenthesis = false // no need to wrap neg with parenthesis, will just drop the current prefix
				}
			}

			// match op
			var prefix = "+"
			switch (op) {
				case 2:
					prefix = "*"
					break
				case 3:
					prefix = "÷"
			}

			if (nextCoeff && nextCoeff < 0) {
				prefix = ""; // remove prefix
			}

			if (base.length > 0 && Math.abs(coeff) === 1) {
				// not a constat, exactly 1, no need coeff
				coeff = coeff < 0 ? "-" : ""; // empty
			}

			// build term
			terms += `${coeff}${base}${prefix}`
		}

		// store as fields
		this.options = options
		this.terms = terms
	}

	result() {
		return this.options.trimTrilingPrefix ? this.terms.slice(0, this.terms.length - 1) : this.terms // exclude last prefix if options.trimTrilingPrefix is true
	}
}

class AlgebraicExpr {
	constructor(variables, polynomialDegree) {
		// variables: array of characters to be used as variables
		// polynomialDegree: integer, denoting degree of the polynomial generated (1 for a simple linear expression)
		this.variables = variables // this.variables will only remain read-only in this scope
		this.polynomialDegree = polynomialDegree

		// generate simplified version (coefficient sum)
		this.coefficients = []
		for (let i = 0; i < this.variables.length; i++) {
			// generate a coefficient sum
			var sum = rando(2, 199) * (rando() >= .6 ? -1 : 1) // can be a negative coefficient

			// assign a coefficient to every degree variable
			var remainingSum = sum // to be subtracted
			var degree = []

			for (let j = 0; j < this.polynomialDegree; j++) {
				if (j >= this.polynomialDegree - 1) {
					// last degree
					degree.push(remainingSum)
				} else {
					var degreeCoeffSum = rando(1, remainingSum) * (rando() >= .6 ? -1 : 1)

					degree.push(degreeCoeffSum)
					remainingSum -= degreeCoeffSum
				}
			}


			this.coefficients.push({
				"sum": sum,
				degree: degree
			})
		}
	}

	factorise() {
		this.coefficients.push({

		})
	}

	cleanRepr() {
		// returns a string representation of every variables
		var r = ""
		for (let i = 0; i < this.variables.length; i++) {
			for (let j = 0; j < this.coefficients[i].degree.length; j++) {
				// determine prefix
				var prefix = "";
				if (this.coefficients[i].degree[j] < 0) {
					prefix = "-"
				} else if (r.length > 0) {
					prefix = "+" // signs needed for second term onwards
				}

				// determine coefficient
				var coeffRepr = "";
				if (Math.abs(this.coefficients[i].degree[j]) > 1) {
					// coefficient is more than 1 (either neg or pos)
					coeffRepr = Math.abs(this.coefficients[i].degree[j])
				}

				// determine exponent value
				var expo = "";
				if (j >= 1) {
					expo = `^${j + 1}`
				}

				// build string
				r += `${prefix}${coeffRepr}${this.variables[i]}${expo}`
			}
		}

		return r
	}

	jumble(minTerms, maxTerms, multiplication) {
		// jumble the terms, returns a string representing the terms
		// minTerm: integer, minimum number of terms per variable (has to be >= minTerms)
		// maxTerm: integer, maximum number of terms per variable (has to be >= 1)
		// multiplication: boolean, if true will break up higher degree terms into multiple smaller terms via multiplication
		if (minTerms < 1) {
			minTerms = 1 // clamp value
		}

		var r = ""

		// generate terms
		var generatedTerms = [] // 1d array containing terms that have been generated
		var totalTermsCount = 0
		for (let i = 0; i < this.variables.length; i++) {
			// scramble the coefficient sum for every degree term
			for (let j = 0; j < this.coefficients[i].degree.length; j++) {
				// generate a number from 2-3 deteremined by minTerms and maxTerms
				var termCount = minTerms + rando(maxTerms - minTerms)

				// create coefficients count
				var coeffSumRemaining = this.coefficients[i].degree[j]; // will be subtracted to generate coefficients

				// generate the coefficents for every term
				var degreeTerms = []
				for (let k = 0; k < termCount; k++) {
					var coeff; // calculate coefficient for this specific term
					if (k >= termCount - 1) {
						coeff = coeffSumRemaining
					} else {
						coeff = rando(1, Math.abs(coeffSumRemaining)) * (rando() >= .6 ? -1 : 1)
					}

					// subtract from remaining
					coeffSumRemaining -= coeff

					// push it to result array
					generatedTerms.push([coeff, i, j]) // push [coefficient value, variableChoiceIdx, degreeIdx (0 for root term, 1 for square terms)]
				}
			}
		}

		// shuffle generatedTerms (Fisher-Yates shuffle)
		for (let i = generatedTerms.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1))

			// destructuring assignment
			var a = generatedTerms[j]
			generatedTerms[j] = generatedTerms[i]
			generatedTerms[i] = a
			// [generatedTerms[i], generatedTerms[j]] = [generatedTerms[j], generatedTerms[i]]
		}

		// stream terms together
		var totalTermCount = generatedTerms.length
		for (let i = 0; i < totalTermCount; i++) {
			var [coeff, variableChoice, degree] = generatedTerms.pop()

			// determine prefix
			var prefix = "";
			if (coeff < 0) {
				prefix = "-"
			} else if (i > 0) {
				prefix = "+"
			}

			// determine coeff
			var coeffRepr = ""
			if (Math.abs(coeff) > 1) {
				// coeff is more than 1
				coeffRepr = Math.abs(coeff)
			}

			// determine exponent
			var expo = "";
			if (degree >= 1) {
				expo = `^${degree + 1}`
			}

			// build string
			r += `${prefix}${coeffRepr}${this.variables[variableChoice]}${expo}`
		}

		return r
	}
}

class PolynomialExpression {
	constructor(minTerm=1, maxTerm=3, maxDegree=2, coeffRange=[-10, 10], absoluteDeg=false) {
		/*
		 * maxTerm: number, the tota number of terms can exist in the generated polynomial; values exceeding computed degree will be clamped (not possible to generate more terms than the degree + constant)
		 * maxDegree: number, the generated polynomial's max degree (inclusive)
		 * absouteDeg: boolean, if true, will not generate a random n to be the degree, but instead take the maxDegree
		 *	false: will generate n from (1-maxDegree) inclusive both ends to be the degree of the generated polynomial
		 * coeffRange: number[], inclusive start and exclusive end
		 * returns a polynomial object with randomly generated coefficients
		 */
		var deg = maxDegree
		if (absoluteDeg === false) {
			deg = BaseQuestion.randomEInt(1, maxDegree +1)
		}

		var coeffArr = Array(deg +1).fill(0)
		var totalTermsCount = BaseQuestion.randomEInt(minTerm, maxTerm)
		var currTermsCount = 0 // to be incremented
		for (let i = deg; i >= 0; i--) { // generate from the leading coefficient, since polynomial will hold the degree that has been generated (a term is guaranteed to be generated on the first iteration)
			if (currTermsCount === totalTermsCount) {
				// no more terms to generate
				break
			}

			var containTerms = Math.random() >= (currTermsCount /totalTermsCount) // at i=0, where currTermsCount === 0, a coefficient will definitely be generated; as more terms get generated, the lesser probability
			if (containTerms || (i === (totalTermsCount -currTermsCount))) {
				// there is need to start generating more terms else it would fit the termsCount
				coeffArr[i] = BaseQuestion.randomEInt(...coeffRange, true)
			}
		}

		return new Polynomial(coeffArr)
	}
}

class BaseQuestion {
	/*
	 * base class to be inherited
	 * question data fields consists of .qnReprString and .qnLatexEqn
	 * complements BaseAnswer object where it stores the answer object in .answerObj field
	 *
	 * qnReprString will contain placeholders in the format, '%%i&&' where i is a number starting from 0 without any form of zero-padding
	 * placeholders will be replaced by elements in qnLatexEqn whose index corresponds to the value i
	 */
	qnReprString = ""
	qnLatexEqn = []

	answerObj = null // to be set

	static roundOffSf(n, s) {
		var h;
		var l, a, b, c, d, e, i, j, m, f, g;
		b = n;
		c = Math.floor(n);

		// Counting the no. of digits to the left of decimal point
		// in the given no.
		for (i = 0; b >= 1; ++i) {
			b = parseInt(b / 10);
		}

		d = s - i;
		b = n;
		b = b * Math.pow(10, d);
		e = b + 0.5;
		if (e == Math.ceil(b)) {
			f = (Math.ceil(b));
			h = parseInt(f - 2);
			if (h % 2 != 0) {
				e = e - 1;
			}
		}
		j = Math.floor(e);
		m = Math.pow(10, d);
		j = j / m;

		return j
	}

	static gcd(a, b) {
		// recursive function to find greatest common divisor
		if (a == 0) {
			return b
		}
		return BaseQuestion.gcd(b % a, a)
	}

	static lcm(a, b) {
		return (a * b) / gcd(a, b)
	}

	static getDecimalPlace(float) {
		// returns a number representing the amount of decimal places float has
		var dp = 0
		while ((float * 10 ** dp) % 1 > 0.000001 && (float * 10 ** dp) % 1 < 0.999999) {
			// accept marginal error (floating point error)
			dp++ // increment decimal places
		}

		return dp
	}

	static genFloat(min, max, step) {
		// helpter function
		// step: float, step count, so answeer will usually be a multiple of step coun
		// step is usually presumed to be 0-1 and never greater than 1

		// generate int part first (assume any integers are a multiple of step)
		var baseInt = rando(Math.floor(min), Math.floor(max))

		// generate float
		var float = rando(Math.floor(1 / step) - 1) * (step)

		// clamp result
		var clamp = baseInt + (float)
		if (clamp > max) {
			clamp = max
		} else if (clamp < min) {
			clamp = min
		}

		return clamp
	}

	static getFactors(int, includeOwnFactor) {
		// includeOwnFactor: boolean, if true, will return 1 and int as part of the factors
		// returns an array containing the factors of an integer

		// uses hashmap to store factors
		var f = {}
		var divisor = includeOwnFactor ? 1 : 2 // start from 2 if excluding 1 as its own factor
		var lim = Math.floor(int / 2)
		var max = 0; // store max so can iterate through hashmap
		while (divisor < lim) {
			if (int % divisor === 0) {
				// divisor is a multiple of int, hence can be divided
				f[divisor] = true
				f[Math.floor(int / divisor)] = true // int /divisor should be an integer

				// store max
				if ((int / divisor) > max) {
					max = Math.floor(int / divisor)
				} else if (divisor > max) {
					// usually divisor is smaller than (int /divisor)
					max = divisor
				}
			}
			divisor++
		}

		// return mapped array
		var factorsArray = [];
		for (let i = 0; i <= max; i++) {
			// iterate inclusive of i
			if (f[i]) {
				factorsArray.push(i)
			}
		}

		return factorsArray
	}

	static randomInt(min, max) {
		/*
		 * generates a random number between min: int, and max: int (inclusive)
		 * does not work for min = 1, max = 2
		 */
		return Math.floor(Math.random() * (max - min - 1)) + min
	}

	static randomEInt(min, max, excludeZero=false) {
		/*
		 * excludeZero: boolean, if true will never return 0 unless min === 0
		 * returns a random number between min (inclusive) and max (exclusive)
   		 */
		if (excludeZero && min < 0) {
			// determine cardinality
			if (Math.random() >= .5) {
				// negative portion
				return BaseQuestion.randomEInt(min, 0)
			} else {
				return BaseQuestion.randomEInt(1, max)
			}
		} else {
			return Math.floor(Math.random() *(max -min)) +min
		}
	}
}

class BaseAnswer {
	constructor(isRawNumber) {
		this.isAlgebraic = !isRawNumber

		this.ansReprString = ""
		this.ansLatexEqn = !isRawNumber ? [] : null // only exists if answer object is not a raw number
	}

	set(answer, latexEqn) {
		if (this.isAlgebraic && latexEqn == null) {
			console.warn("[WARN]: answer object is algebraic yet raw answer provided,", answer)
		} else if (this.isAlgebraic && latexEqn) {
			this.ansLatexEqn = [...latexEqn] // shallow copy so new reference
		}

		this.ansReprString = answer.toString()
	}
}

class FracToPerc extends BaseQuestion {
	constructor() {
		super();

		// compute the numerator and denominator to obtain a random fraction
		var basearg = 1 + Math.floor(Math.random() * 500)
		var vararg = Math.floor(Math.random() * 100) // variance between args

		var numer = basearg + Math.floor(Math.random() * vararg)
		var denom = basearg + Math.floor(Math.random() * Math.abs(numer - vararg)) // guaranteed to be at least 1 with basearg

		// format question with equation
		this.qnReprString = `Convert the following %%0%% to percentage.`
		this.qnLatexEqn.push(`\\frac{${numer}}{${denom}}`)

		// generate answer
		var answer = parseFloat((numer / denom).toPrecision(3)) // BaseQuestion.roundOffSf(numer / denom, 3)

		this.answerObj = new BaseAnswer(true)
		this.answerObj.set(`${answer}`)
	}
}

class PercToFrac extends BaseQuestion {
	constructor() {
		super();

		// compute a random number
		var largeNum = rando()
		var intPart;
		if (largeNum > .95) {
			intPart = 1 + rando(5000)
		} else if (largeNum > .85) {
			intPart = 1 + rando(900)
		} else {
			intPart = 1 + rando(100)
		}

		var precision = 10 // 1 decimal places
		var decimalPart = rando(0, 10)
		var percVal = intPart + (decimalPart / precision)

		// form the fractions
		var num = intPart * precision + decimalPart
		var den = precision * 100 // 100 is to convert between percentage and fractions

		// simplify it using gcd
		var gcd = BaseQuestion.gcd(num, den)
		num = Math.floor(num / gcd)
		den = Math.floor(den / gcd)

		// set fields
		this.qnReprString = `Convert the following %%0%% to a fraction.`
		this.qnLatexEqn.push(`${percVal.toFixed(1)}\\%`)
		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [`\\frac{${num}}{${den}}`])
	}
}

class PercChange extends BaseQuestion {
	// answer is rounded off to 3 significant figures
	constructor(wordContext, determineIncrOrder) {
		// wordContext: boolean, if true will generate scenarios instead 
		// determineIncrOrder: boolean, if true will generate percentage increase qns, if false, will generate decreasing, else if null, will generate percentage change
		super();

		// choose scenario
		if (wordContext) {
			var scenario = rando(1, 2)
			switch (scenario) {
				case 1:
					// speed
					var person = Database.people[Math.floor(Math.random() * Database.people.length)]

					var speedGauge = rando(1, 5) // decision making
					var action, small, big
					var unit = "km/h"
					switch (speedGauge) {
						case 1:
							// foot
							small = rando(1, 600)
							big = small + rando(390)
							action = small < 400 ? "walks" : "runs" // determine action by walk speed (m/h)
							unit = "m/h"
							break
						case 2:
							// driving
							small = rando(5, 80) + (rando(9) / 10)
							// small = rando(5, 80) +(Math.floor(rando() *10) /10) // speed up to 1 d.p.
							big = small + rando(70) + (rando(9) / 10)

							action = "drives a car"
							break
						case 3:
							// cycling
							small = rando(1, 5) + (rando(19) * 5) / 100
							big = small + rando(30) + (rando(19) * 5) / 100

							action = "cycles"
							break
						case 4:
							// rides a bus
							small = rando(1, 5) + (rando(1, 9) / 10)
							big = small + rando(20) + (rando(9) / 10)

							action = "rides a bus which goes"
							break
						case 5:
							// swimming
							small = rando(1, 5) + (rando(19) * 5) / 100
							big = small + rando(8) + (rando(19) * 5) / 100

							action = "swims"
					}

					// form question
					var incr = rando() >= .6
					var mode, qnMode, first, second;
					if (determineIncrOrder) {
						qnMode = "increase"
					} else if (determineIncrOrder === false) {
						// decreasing qn
						qnMode = "decrease"
					} else {
						// null
						qnMode = "change"
					}

					if (determineIncrOrder === true || (determineIncrOrder == null && incr)) {
						// increases
						mode = "increases"
						first = small
						second = big
					} else if (determineIncrOrder === false || (determineIncrOrder == null && !incr)) {
						// decreases
						mode = "decreases"
						first = big
						second = small
					}

					// set fields
					this.qnReprString = `${person} ${action} at a speed of %%0%% and later it ${mode} to %%1%%. Find the percentage ${qnMode}.`
					this.qnLatexEqn.push(`${first.toFixed(2)} ${unit}`)
					this.qnLatexEqn.push(`${second.toFixed(2)} ${unit}`)

					// answer
					var answer = (second - first) / first * 100 //BaseQuestion.roundOffSf((second -first) /first *100, 3)
					this.answerObj = new BaseAnswer(false)
					this.answerObj.set("%%0%%\%", [`${parseFloat(answer.toPrecision(3))}`])
					break
				case 2:
					// temperature change

					var tempGauge = rando(1, 3)
					var noun, small, big
					switch (tempGauge) {
						case 1:
							// outside temperature
							small = rando(1, 20) + (rando(9) / 10)
							big = small + rando(1, 20) + (rando(9) / 10)

							noun = "environment"
						case 2:
							// fridge temperature
							small = rando(4, 10) + (rando(9) / 10)
							big = small + rando(1, 10) + (rando(9) / 10)

							noun = "fridge"
						case 3:
							// freezer
							small = rando(0, 5) + (rando(1, 9) / 10) // temp up to 1 d.p. (at least 0.1)
							big = small + rando(1, 5) + (rando(9) / 10)

							noun = "freezer"
					}

					// form qn
					var incr = rando() >= .6
					var mode, qnMode, first, second;
					if (determineIncrOrder) {
						qnMode = "increase"
					} else if (determineIncrOrder === false) {
						// decreasing qn
						qnMode = "decrease"
					} else {
						// null
						qnMode = "change"
					}

					if (determineIncrOrder === true || (determineIncrOrder == null && incr)) {
						// increases
						mode = "increases"
						first = small
						second = big
					} else if (determineIncrOrder === false || (determineIncrOrder == null && !incr)) {
						// decreases
						mode = "decreases"
						first = big
						second = small
					}

					// set fields
					this.qnReprString = `The temperature of the ${noun} ${mode} from %%0%%°C to %%1%%°C. Find the percentage ${qnMode}.`
					this.qnLatexEqn.push(first.toFixed(2))
					this.qnLatexEqn.push(second.toFixed(2))

					// answer
					var answer = ((second - first) / first * 100) // BaseQuestion.roundOffSf((second -first) /first *100, 3)
					this.answerObj = new BaseAnswer(false)
					this.answerObj.set("%%0%%\%", [`${parseFloat(answer.toPrecision(3))}`])
			}
		} else {
			var basearg = rando(1, 5000)
			var a = basearg + rando(1, 100)
			var b;

			// include negatives?
			var includeNegatives = rando() > .95
			if (includeNegatives) {
				b = -rando(1, 100 * Math.floor(basearg / 5))
			} else {
				b = basearg + rando(1, 100 * Math.floor(basearg / 2))
			}

			// determine qn context mode (whether phrase is 'percentage change', 'percentage increase' or 'percentage decrease')
			var qnMode = "change"; // when determineIncrOrder is null
			if (determineIncrOrder) {
				qnMode = "increase"
			} else if (determineIncrOrder === false) {
				// decreasing qn
				qnMode = "decrease"
			}

			// determine whether format question as increasing or decreasing
			var increasingOrder = rando() >= .6
			var small = a < b ? a : b
			var big = a > b ? a : b
			var first, second;

			if (determineIncrOrder === true || (determineIncrOrder == null && increasingOrder)) {
				// increases
				// small change to big (+ve % change)
				mode = "increased"
				first = small
				second = big

				var answer = (big - small) / small * 100 // BaseQuestion.roundOffSf((big -small) /small *100, 3)
			} else if (determineIncrOrder === false || (determineIncrOrder == null && !increasingOrder)) {
				// decreases
				// big change to small (-ve % change)
				mode = "decreased"
				first = big
				second = small

				var answer = (small - big) / big * 100 // BaseQuestion.roundOffSf((small -big) /big *100, 3)
			}

			// set fields
			this.qnReprString = `Find the percentage ${qnMode} when %%0%% is ${mode} to %%1%%.`
			this.qnLatexEqn.push(first.toString())
			this.qnLatexEqn.push(second.toString())

			this.answerObj = new BaseAnswer(false)
			this.answerObj.set("%%0%%\%", [`${parseFloat(answer.toPrecision(3))}`])
		}
	}
}

class ExpressUnitPerc extends BaseQuestion {
	// express a km2 as a percentage of b km2
	constructor(adjacentUnitsConversion) {
		// adjacentUnitsConversion: boolean, if true, will only use adjacent units
		super();

		// choose units to use
		var unitsChoice = rando(1, 3)
		var bRepr; // unit form
		var aVal, bVal, percAns;
		var aUnit, bUnit
		switch (unitsChoice) {
			case 1:
				// length

				// generate 2 mnumbers in a unit
				var baseUnitChoice = rando(0, LengthUnit.unitMap.length - 1)
				var baseUnit = LengthUnit.unitMap[baseUnitChoice] // assume both a and b are this unit
				aVal = BaseQuestion.genFloat(5, 100, .1)
				bVal = BaseQuestion.genFloat(1, aVal, .1)

				// generate targetUnit based on adjacentUnitsConversion
				var targetUnitChoice;
				if (adjacentUnitsConversion) {
					targetUnitChoice = rando(baseUnitChoice >= 1 ? baseUnitChoice - 1 : baseUnitChoice, baseUnitChoice < LengthUnit.unitMap.length - 1 ? baseUnitChoice + 1 : baseUnitChoice)
				} else {
					targetUnitChoice = rando(0, LengthUnit.unitMap.length - 1)
				}
				var targetUnit = LengthUnit.unitMap[targetUnitChoice] // convert b to this unit

				// convert b to targetUnit
				bRepr = new LengthUnit(bVal).convert(baseUnit, targetUnit)

				// calculate percentage
				percAns = (bVal / aVal) * 100

				// store fields
				aUnit = baseUnit
				bUnit = targetUnit

				break
			case 2:
				// mass

				// generate 2 mnumbers in a unit
				var baseUnitChoice = rando(0, Mass.unitMap.length - 1)
				var baseUnit = Mass.unitMap[baseUnitChoice] // assume both a and b are this unit
				aVal = BaseQuestion.genFloat(5, 100, .1)
				bVal = BaseQuestion.genFloat(1, aVal, .1)

				// generate targetUnit based on adjacentUnitsConversion
				var targetUnitChoice;
				if (adjacentUnitsConversion) {
					targetUnitChoice = rando(baseUnitChoice >= 1 ? baseUnitChoice - 1 : baseUnitChoice, baseUnitChoice < Mass.unitMap.length - 1 ? baseUnitChoice + 1 : baseUnitChoice)
				} else {
					targetUnitChoice = rando(0, Mass.unitMap.length - 1)
				}
				var targetUnit = Mass.unitMap[targetUnitChoice] // convert b to this unit

				// convert b to targetUnit
				bRepr = new Mass(bVal).convert(baseUnit, targetUnit)

				// calculate percentage
				percAns = (bVal / aVal) * 100

				// store fields
				aUnit = baseUnit
				bUnit = targetUnit

				break
			case 3:
				// liquid volume

				// generate 2 mnumbers in a unit
				var baseUnitChoice = rando(0, LiquidVolume.unitMap.length - 1)
				var baseUnit = LiquidVolume.unitMap[baseUnitChoice] // assume both a and b are this unit
				aVal = BaseQuestion.genFloat(5, 100, .1)
				bVal = BaseQuestion.genFloat(1, aVal, .1)

				// generate targetUnit based on adjacentUnitsConversion
				var targetUnitChoice;
				if (adjacentUnitsConversion) {
					targetUnitChoice = rando(baseUnitChoice >= 1 ? baseUnitChoice - 1 : baseUnitChoice, baseUnitChoice < LiquidVolume.unitMap.length - 1 ? baseUnitChoice + 1 : baseUnitChoice)
				} else {
					targetUnitChoice = rando(0, LiquidVolume.unitMap.length - 1)
				}
				var targetUnit = LiquidVolume.unitMap[targetUnitChoice] // convert b to this unit

				// convert b to targetUnit
				bRepr = new LiquidVolume(bVal).convert(baseUnit, targetUnit)

				// calculate percentage
				percAns = (bVal / aVal) * 100

				// store fields
				aUnit = baseUnit
				bUnit = targetUnit

				break
		}

		// round off answer to 3sf if not fixed (determine by if it has >= 13 dp)
		var n = BaseQuestion.getDecimalPlace(percAns);
		if (n >= 13) {
			// round off to 3 dp
			percAns = parseFloat(percAns.toPrecision(3))
		} else {
			// exact answer (trim off any precision point floating error)
			percAns = percAns.toFixed(n)
		}

		// parse values
		aVal = aVal.toFixed(BaseQuestion.getDecimalPlace(aVal))
		bVal = bVal.toFixed(BaseQuestion.getDecimalPlace(bVal))
		bRepr = bRepr.toFixed(BaseQuestion.getDecimalPlace(bRepr))

		// set fields
		this.qnReprString = `Express %%0%% as a percentage of %%1%%`
		this.qnLatexEqn.push(`${bRepr}${bUnit}`)
		this.qnLatexEqn.push(`${aVal}${aUnit}`)
		this.answerObj = new BaseAnswer(false)
		this.answerObj.set(`Convert %%0%%${bUnit} to ${aUnit}\nThus, %%1%%`, [`${bRepr}`, `\\frac{${bVal}${aUnit}}{${aVal}${aUnit}} \\times 100 = ${percAns}\\%`])
	}
}

class ReversePerc extends BaseQuestion {
	constructor() {
		// take a look at https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test#Example to generate factors
		super();

		// calculate base number first
		var num = BaseQuestion.genFloat(1, 399, 1)

		// calculate percentage value
		var percVal = BaseQuestion.genFloat(0.1, 100, .1)
		var relnum = percVal / 100 * num

		// // calculate the relative number then determine percentage
		// var numFactors = BaseQuestion.getFactors(num, false) // get sorted array of factors (excluding 1 and itself)
		// if (numFactors.indexOf(3)) {
		// 	numFactors.pop(numFactors.indexOf(3))
		// 	numFactors.pop(numFactors.indexOf(Math.floor(num /3)))
		// }

		// var percVal, relnum;
		// if (numFactors.length === 0) {
		// 	// prime factor, start from generating a percentage that is a multiple of 2
		// 	percVal = BaseQuestion.genFloat(0, 100, 2)
		// 	relnum = percVal /100 *num
		// } else {
		// 	// generate a percentage value in steps of 10 (used to generate a relnum based on factors)
		// 	var relperc = BaseQuestion.genFloat(.25, 1, .25)

		// 	// get 2 random adjacent factors to be used as a relnum
		// 	var idx = Math.floor(Math.random() *numFactors.length)
		// 	var a, b;
		// 	a = numFactors[idx]
		// 	if (idx == numFactors.length -1) {
		// 		// at end of factor array
		// 		b = num // 100%
		// 	} else {
		// 		b = numFactors[idx +1]
		// 	}

		// 	// use relperc to get the final relnum
		// 	relnum = a +(b -a) *(relperc) // relperc used on difference between adjacent factors
		// 	percVal = relnum /num *100
		// }

		// set fields
		this.qnReprString = `%%0%% of a number is %%1%%\nCalculate the number.`
		this.qnLatexEqn.push(`${percVal.toFixed(BaseQuestion.getDecimalPlace(percVal))}\\%`)
		this.qnLatexEqn.push(`${relnum.toFixed(BaseQuestion.getDecimalPlace(relnum))}`)
		this.answerObj = new BaseAnswer(true)
		this.answerObj.set(num)
	}
}

class RelativePerc extends BaseQuestion {
	constructor() {
		super();

		// calculate percentage value
		var percVal = BaseQuestion.genFloat(0, 100, 0.2)
		var num = BaseQuestion.genFloat(1, 1000, 0.1)

		// calculate answer and parse it accordingly (may have floating point, so round off to 3sf unless answer is exact)
		var answer = percVal / 100 * num
		var isExact = ((answer / num) - (percVal / 100)) < .00001 // determine if its exact (support for marginal error)
		if (!isExact) {
			// not exact, round off to 3 significant figures
			answer = parseFloat(answer.toPrecision(3))
		} else {
			// exact, convert to string, trim off trailing float
			var n = BaseQuestion.getDecimalPlace(answer)
			answer = answer.toFixed(n) // might have trailing bits (floating point error)
		}

		// set fields
		this.qnReprString = `Calculate %%0%% of %%1%%`
		this.qnLatexEqn.push(`${percVal.toFixed(1)}\\%`)
		this.qnLatexEqn.push(`${num.toFixed(1)}`)
		this.answerObj = new BaseAnswer(true)
		this.answerObj.set(`${answer}`)
	}
}

class RelativePercManipulation extends BaseQuestion {
	constructor(increasingQn) {
		// increasingQn: boolean, if true, will generate increasing questions, if false, will generate decreasing questions
		super();

		// generate a percentage value and a number (question preference 0-1999)
		var percVal = BaseQuestion.genFloat(0, 100, 0.2)
		var num = BaseQuestion.genFloat(1, 1999, 1)

		// calculate answer bsed on increasingQn
		var answer;
		var mode = "Increase"
		if (increasingQn) {
			answer = (100 + percVal) / 100 * num
		} else {
			answer = (100 - percVal) / 100 * num
			mode = "Decrease"
		}

		// round off generated numbers
		percVal = percVal.toFixed(BaseQuestion.getDecimalPlace(percVal))
		num = num.toFixed(BaseQuestion.getDecimalPlace(num))

		// round off answer (if not exact, >= 13 decimal places)
		var n = BaseQuestion.getDecimalPlace(answer)
		if (n >= 13) {
			// round off to 3 sf
			answer = parseFloat(answer.toPrecision(3))
		} else {
			// exact answer (trim off any precision point floating error)
			answer = answer.toFixed(n)
		}

		// set fields
		this.qnReprString = `${mode} %%0%% by %%1%%`
		this.qnLatexEqn.push(`${num}`)
		this.qnLatexEqn.push(`${percVal}\\%`)
		this.answerObj = new BaseAnswer(true)
		this.answerObj.set(`${answer}`)
	}
}

class FutureAlgebra extends BaseQuestion {
	constructor(difficultyLevel) {
		super();

		var paramsOptions = {
			variableStyles: [["x", "y"], ["a", "b"]][rando(0, 1)],
			containsNeg: false,
			containsMultOp: false,
			argsRange: [1, 4],
			trimTrilingPrefix: true,
		}

		var eqn = "";
		switch (difficultyLevel) {
			case 1:
			// only addition and subtraction, pos ints only, no parenthesis
			// use options as is
			case 2:
				// only addition and subtraction, with neg int, no parenthesis
				paramsOptions.containsNeg = true
			case 3:
				// all 4 arithemtic ops with negative numbers, no parenthesis
				paramsOptions.containsNeg = true
				paramsOptions.containsMultOp = true
			case -1:
				// catch block

				// generate terms
				eqn = new JumbleAlgebraicExpr(paramsOptions).result()
				break
			case 4:
				// all 4 arithemtic ops with negative numbers, with parenthesis
				// generate either a min 2 times
				paramsOptions.containsNeg = true
				paramsOptions.containsMultOp = true
				paramsOptions.trimTrilingPrefix = false

				var terms = rando(2, 3)
				var parenthesisPointer = rando(1, terms)
				for (let i = 0; i < terms; i++) {
					if (i === parenthesisPointer) {
						// right after parenthesis, add a plus postfix (has continuing elements) (ONCE ONLY)
						eqn += "+";
					}

					if (i === parenthesisPointer - 1) {
						// create parenthesis
						paramsOptions.trimTrilingPrefix = true // trim trailing prefix
						paramsOptions.argsRange[1] = 3
						console.log("PARAMS", paramsOptions)

						// generate factor
						var factor = rando(0, 9) * (rando() >= .85 ? -1 : 1)
						var factorPrefix = ""
						if (factor === -1) {
							factorPrefix = "-"
						}

						// factor representative
						if (Math.abs(factor) === 1) {
							factor = ""
						}

						eqn += `${factorPrefix}${rando(1, 9)}(${new JumbleAlgebraicExpr(paramsOptions).result()})`
					} else {
						paramsOptions.trimTrilingPrefix = i === (terms - 1) // only trim if its the last term
						paramsOptions.argsRange[1] = 4
						eqn += `${new JumbleAlgebraicExpr(paramsOptions).result()}`
					}
				}
		}

		console.log("GENERATED", eqn)

		// generate answer
		var answer = new algEngine.AlgebraicParser(eqn)
		answer.tokenise().clean()
		answer.simplify()

		var answerRepr = answer.buildRepr(); // build once

		// set fields
		this.qnReprString = "Simplify %%0%%"
		this.qnLatexEqn.push(eqn)
		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [answerRepr])
	}
}

class ModernAlgebra extends BaseQuestion {
	constructor() {
		super();

		// determine variable styles
		var varStyleChoice = rando(1, 2)
		var variables
		switch (varStyleChoice) {
			case 1:
				// x and y
				variables = ["x", "y"]
			case 2:
				variables = ["a", "b"]
		}

		var eqn = new AlgebraicEqn(variables, 3)

		// set fields
		this.qnReprString = "Simplify %%0%%"
		this.qnLatexEqn.push(eqn.r)
		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [eqn.cleanRepr()])
	}
}

class SimplifyAlgebraic extends BaseQuestion {
	constructor(difficultyLevel) {
		// difficultLevel: number, 1 - 3 inclusive
		// 1 for raw arithmetic
		// 2 for slighty longer expressions and with multiplication
		// 3 to include single level parenthesis
		super();

		// determine variable styles
		var variableStyle = [["x", "y"], ["a", "b"]][rando(0, 1)]

		var termsLength = rando(3, 4) + (difficultyLevel === 2 ? rando(1, 2) : 0)
		var coeffUpperBound = 20 + (difficultyLevel >= 2 ? 30 : 0)
		if (difficultyLevel === 3) {
			coeffUpperBound = 15 // parenthesis already acts as a tough option
		}
		var qnStr = ""
		var containsParenthesisAlready = false
		for (let i = 0; i < termsLength; i++) {
			// generate parenthesis if valid
			if ((difficultyLevel >= 3 && i === termsLength - 1 && !containsParenthesisAlready) || (!containsParenthesisAlready && difficultyLevel >= 3 && rando() >= .8)) {
				// parenthesis
				containsParenthesisAlready = true

				let factor = rando(1, 6)
				if (rando() >= .8) {
					factor *= -1
				}

				let prefix = "";
				if (factor < 0) {
					prefix = "-"
				} else if (qnStr.length > 0) {
					prefix = "+"
				}

				if (Math.abs(factor) === 1) {
					factor = "" // no need to show
				} else {
					factor = Math.abs(factor) // trim out oepration
				}

				var pgContentStr = ""
				var pgContentTermLen = rando(1, 2)
				for (let i = 0; i < pgContentTermLen; i++) {
					// generate a coefficient
					let coeff = rando(1, coeffUpperBound)

					let isNegChance = rando()
					if (isNegChance >= .8) {
						coeff *= -1
					}

					// prefix
					let prefix = "";
					if (coeff < 0) {
						prefix = "-"
					} else if (pgContentStr.length > 0) {
						prefix = "+"
					}

					// cast coeff to string
					if (Math.abs(coeff) === 1) {
						coeff = ""; // no need for coeff
					} else {
						coeff = Math.abs(coeff); // no need to show sign
					}

					// variable style choice
					let variableChoice = variableStyle[rando(0, 1)]

					pgContentStr += `${prefix}${coeff}${variableChoice}`
				}

				qnStr += `${prefix}${factor}(${pgContentStr})`
				continue;
			}

			// generate a coefficient instead
			let coeff = rando(1, coeffUpperBound)

			let isNegChance = rando()
			if ((difficultyLevel === 1 && isNegChance >= 0.9) || (difficultyLevel >= 2 && isNegChance >= 0.8)) {
				// more possiblities of negative numbers for tougher difficulty
				coeff *= -1
			}

			// prefix
			let prefix = "";
			if (coeff < 0) {
				prefix = "-"
			} else if (qnStr.length > 0) {
				if (difficultyLevel >= 2) {

				}
				prefix = "+"
			}

			// cast coeff to string
			if (Math.abs(coeff) === 1) {
				coeff = ""; // no need for coeff
			} else {
				coeff = Math.abs(coeff); // no need to show sign, trim out operation prefix
			}

			// variable style choice
			let variableChoice = variableStyle[rando(0, 1)]

			qnStr += `${prefix}${coeff}${variableChoice}`
		}

		var answer = new algEngine.AlgebraicParser(qnStr)
		answer.tokenise().clean()
		answer.simplify()

		var answerRepr = answer.buildRepr(); // build once

		// set fields
		this.qnReprString = "Simplify %%0%%"
		this.qnLatexEqn.push(qnStr)
		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [answerRepr])
	}
}

class SimplifyAlgebraicLegacy extends BaseQuestion {
	constructor(parenthesis) {
		// double variable equation generation
		// includeParenthesis: boolean, if true, will include qns to test on order of operations, if false, no terms will be added
		super();

		// determine variable styles
		var varStyleChoice = rando(1, 2)
		var variables
		switch (varStyleChoice) {
			case 1:
				// x and y
				variables = ["x", "y"]
			case 2:
				variables = ["a", "b"]
		}

		// generate a list of coefficients for each variable, and generate answer at the same time
		var factors = []
		var totalFactors = 0
		var answer = ""
		for (let i = 0; i < 2; i++) {
			var termFactors = [] // to store all the coefficients for this term, and to be pushed into factors
			var termSum = 0
			var termsLength = 1 + rando(1, 3)
			var termsCoeffFactor = rando(2, 6) // to multiple all coeffs by a range of factor
			for (let j = 0; j < termsLength; j++) {
				var coeff = rando(1, 12) * rando(termsCoeffFactor - 1, termsCoeffFactor + 1)
				var isNeg = rando(0, 1)
				if (isNeg === 1) {
					// coeff is negative
					coeff *= -1
				}

				// add to sum
				termSum += coeff

				if (termSum === 0) {
					// make sure sum is at least > 0 or < 0
					termSum += coeff // add it to sum again
					coeff *= 2 // multiply AFTER, since value was used above
				}

				// push to factors (final)
				termFactors.push(coeff)
			}

			// push coefficients data
			factors.push(termFactors)
			totalFactors += termsLength

			// generate answer
			var coefficient = termSum

			// format prefix
			var prefix = "";
			if (coefficient < 0) {
				prefix = "-"
			} else if (coefficient > 0 && i > 0) {
				prefix = "+"
			}

			// parse coefficient
			if (Math.abs(coefficient) === 1) {
				coefficient = "" // either 1 or negative 1, no need to show coeff value
			} else {
				coefficient = Math.abs(coefficient)
			}

			// concat answer
			answer += `${prefix}${coefficient}${variables[i]}`
		}

		// spread them out
		var q = ""
		for (let i = 0; i < totalFactors; i++) {
			// determine to use either x or y
			var variableChoice = rando(0, 1)
			if (factors[variableChoice].length === 0) {
				// no more, switch to the other one
				variableChoice = 1 - variableChoice
			}


			// format prefix
			var coeff = factors[variableChoice].pop()
			var prefix = "";
			if (coeff < 0) {
				prefix = "-"
			} else if (coeff > 0 && i > 0) {
				prefix = "+"
			}

			// format coefficient
			if (Math.abs(coeff) === 1) {
				// no need to write coefficient
				coeff = ""
			} else {
				// remove operation that preceeds it, negative operation is already captured
				coeff = Math.abs(coeff)
			}

			// concat question string
			q += `${prefix}${coeff}${variables[variableChoice]} ` // add a trailing space for the next operation
		}
		// trim out trailing space
		q = q.slice(0, -1)

		// set fields
		this.qnReprString = "Simplify %%0%%"
		this.qnLatexEqn.push(q)
		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [answer])
	}
}

class TwoSimQn extends BaseQuestion {
	constructor(a, toughnessDegree) {
		// supply values of a, compute value of b
		// toughnessDegree 1-3 (with 3 being the toughest)

		// form random equations with relations to a and b\
	}
}

class Inequalities extends BaseQuestion {
	constructor(difficultyLevel) {

	}
}


// order of operations
class OOPInt extends BaseQuestion {
	static generateSequence(upperTermValueLim, maxTerms) {
		// generate from the back
		var result = ""; // stream terms into here to build results
		var nextTerm = null;
		for (let i = maxTerms - 1; i >= 0; i--) {
			var base;
			var negFactor = (rando() >= .85) ? -1 : 1
			if (nextTerm) {
				base = nextTerm; // already generated this term

				nextTerm = null; // reset
			} else {
				base = rando(1, upperTermValueLim) * negFactor
			}

			// calculate operation if still generating next term (direction: rtl)
			var op = "";
			if (i > 0) {
				if (rando() >= .85) {
					// multiplication
					op = "×"

					// wrap base in parenthesis
					if (base < 0) {
						base = `(${base})`
					}
				} else if (rando() >= .85) {
					// division (also generate a nex term, so remains as whole numbers)
					op = "÷"

					// wrap base in parenthesis
					if (base < 0) {
						base = `(${base})`
					}

					// force next term so it is a whole number
					nextTerm = base * rando(1, 2 + Math.floor(upperTermValueLim - base))
				} else {
					// addition
					op = base > 0 ? "+" : "";
				}
			}

			result = `${op}${base}` + result
		}

		return result;
	}

	constructor() {
		super();

		var scenario = rando(1, 4)
		var qn;
		switch (scenario) {
			case 1:
				// no parenthesis
				qn = OOPInt.generateSequence(20, rando(3, 6))
				break
			case 2:
				// with parenthesis at the ends
				var factor = rando(1, 9)
				if (factor === 1) {
					factor = ""
				}

				var joint = rando() >= .5 ? "+" : "-";
				qn = `${factor}(${OOPInt.generateSequence(20, rando(2, 4))})${joint}${OOPInt.generateSequence(20, rando(2, 5))}`
				break
			case 3:
				// with parenthesis at the front
				var factor = rando(1, 9)
				if (factor === 1) {
					factor = ""
				}

				var joint = rando() >= .8 ? "+" : "-";
				qn = `(${OOPInt.generateSequence(20, rando(2, 4))})${joint}${factor}(${OOPInt.generateSequence(20, rando(2, 4))})`
				break
			case 4:
				// with parenthesis at the center
				var factor = rando(1, 9)
				if (factor === 1) {
					factor = ""
				}

				var joint1 = rando() >= .5 ? "+" : "-";
				var joint2 = rando() >= .5 ? "+" : "-";
				qn = `${OOPInt.generateSequence(20, rando(2, 4))}${joint1}${factor}(${OOPInt.generateSequence(20, rando(2, 4))})${joint2}${OOPInt.generateSequence(20, rando(2, 4))}`
		}

		// generate answer
		var answer = new algEngine.AlgebraicParser(qn)
		answer.tokenise().clean()
		answer.simplify()

		var answerRepr = answer.buildRepr(); // build once

		// set fields
		this.qnReprString = "Simplify %%0%%"
		this.qnLatexEqn.push(qn)
		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [answer])
	}
}

class Polynomial {
	constructor(coeffArr) {
		/*
		 * constructs a polynomial object such that f(x) = sum(ai * xi) where i = 0 to deg(f)
		 * coeffArr represents the coefficient of the term with the 0th index representing the constant
		 * coeffArr accepts Fraction objects to represent rational numbers
		 */
		this.coefficients = coeffArr
	}

	bloat(factor, strictlyIntegers = true) {
		/*
		 * returns a string representation of the polynomial in its non-standard form
		 * that is to introduce more terms to jumble it up
		 * factor: float from 0-1 (inclusive), will introduce more terms the bigger the factor is
		 * strictlyIntegers: boolean, if true, will only generate integer coefficients, otherwise will consider rationals with Fraction instances
		 *	default value: true (iff all coefficients in this.coefficients are integers, otherwise false)
		 * e.g. f(x) = 3x^2 + 3x - 5 will return '2x^2 - 4 + x^2 - 2x + 5x - 1'
		 */

		strictlyIntegers = strictlyIntegers && this.coefficients.every(r => r % 1 === 0)

		// build a new coefficient array, but instead, each element is now an array itself consisting of the new terms to be spread out
		var unpackedCoeffArr = []
		var totalTerms = 0; // to be incremented
		for (let i = 0; i < this.coefficients.length; i++) {
			var sum = [] // represents the jumbled up coefficients for this term with power i, sum of this array should equate this.coefficients[i]
			var targetCoeff = this.coefficients[i]
			var termsCount = BaseQuestion.randomInt(2, 3 + Math.floor(2 * factor))
			for (let j = 0; j < termsCount; j++) {
				var r = BaseQuestion.randomInt(2, 19) * (Math.random() >= .5 ? -1 : 1)
				if (!strictlyIntegers && Math.random() >= .6) {
					// can generate a denominator to make it irratonal
					var denominator = BaseQuestion.randomInt(1, 9)
					r = new Fraction(r, denominator)
				}

				sum.push(r)
			}

			// balance it out to ensure sum matches
			if (strictlyIntegers) {
				// no fraction objects
				var deficit = targetCoeff - sum.reduce((a, b) => a + b, 0) // sum
				var equalSplit = Math.floor(deficit / termsCount)
				for (let j = 0; j < termsCount; j++) {
					sum[j] += equalSplit
				}

				sum[termsCount - 1] += (deficit - (equalSplit * termsCount)) // add the modulo to the last term

				// check for zero terms and push into main array
				unpackedCoeffArr.push(sum.filter(r => r != 0))
			} else {
				// dealing with fraction objects
				var summation = sum.reduce((a, b) => { // sum
					if (a instanceof Fraction && b instanceof Fraction) {
						// working with fractions
						return a.add(b)
					} else if (b instanceof Fraction) {
						// previous value is a constant, say 0 (initial value)
						return b.addConstant(a)
					} else if (a instanceof Fraction) {
						// previous value is a fraction, whereas value now is a constant
						return a.addConstant(b)
					} else if (typeof a === "number" && typeof b === "number") {
						return new Fraction(a + b, 1)
					}
				}, 0)

				var deficit = targetCoeff
				if (!(targetCoeff instanceof Fraction)) {
					// number
					deficit = summation.minusFromConstant(targetCoeff)
				} else {
					// targetCoeff is another fraction
					deficit = targetCoeff.sub(summation)
				}

				// deficit should be a fraction instance by now
				var equalSplit = deficit.divByConstant(termsCount) // should be used up since all are rationals
				for (let j = 0; j < termsCount; j++) {
					if (sum[j] instanceof Fraction) {
						// fraction object already
						sum[j] = sum[j].add(equalSplit)
					} else {
						// number
						sum[j] = equalSplit.addConstant(sum[j])
					}
				}

				// by now, all the elements in sum should be fraction objects
				// check for zero terms and push into main array
				unpackedCoeffArr.push(sum.filter(r => r.a !== 0)) // numerator === 0 (means zero term)
			}

			// increment tally counter
			totalTerms += unpackedCoeffArr[i].length
		}

		// use unpackedCoeffArr to build a jumbled representation of the polynomial equation
		var repr = "" // final representation
		for (let i = 0; i < totalTerms; i++) {
			var n = Math.floor(Math.random() * unpackedCoeffArr.length) // random integer between 0 - unpackedCoeffArr.length (inclusive start, exclusive end)
			while (unpackedCoeffArr[n].length === 0) {
				// pick a random number representing the power of the term
				n = Math.floor(Math.random() * unpackedCoeffArr.length)
			}

			var coeff = unpackedCoeffArr[n].pop() // get the latest term, coeff should never be zero since filtered out
			var base = ""
			if (n >= 1) {
				base = "x"
			}
			if (n >= 2) {
				base += `^\{${n}}`
			}

			if (coeff instanceof Fraction) {
				var prefix = "", numerator = Math.abs(coeff.a)
				if (coeff.a < 0) {
					// move minus sign to prefix
					prefix = "-"
				} else if (repr.length > 0) {
					prefix = "+" // otherwise, empty prefix
				}
				if (n >= 1 && numerator[numerator.length - 1] === "1") {
					// omit coefficient if it is 1 (does not apply for constants)
					numerator = ""
				}

				if (coeff.b === 1) {
					// omit out fraction
					repr += `${prefix}${numerator}${base}`
				} else {
					// has numerator and denominator portion
					repr += `${prefix}\\frac{${numerator}${base}}{${coeff.b}}`
				}
			} else {
				// normal number
				var prefix = (coeff > 0 && repr.length > 0) ? "+" : "" // negative prefix will be contained in coeff value
				if (n >= 1 && Math.abs(coeff) === 1) {
					// can omit coefficient
					prefix = coeff < 0 ? "-" : prefix // but include negative signs
					coeff = ""
				}

				repr += `${prefix}${coeff}${base}`
			}
		}

		return repr
	}

	buildRepr() {
		/*
			 * returns the representation in standard form here
		   */
		var deg = this.coefficients.length - 1
		var repr = ""
		for (let i = deg; i >= 0; i--) {
			if (this.coefficients[i] === 0) {
				// empty for this term, skip
				continue
			}

			var prefix = (i < deg && this.coefficients[i] > 0) ? "+" : ""
			var coeff = (i > 0 && Math.abs(this.coefficients[i]) === 1) ? "" : this.coefficients[i]
			var base = (i > 0 ? "x" : "") + (i >= 2 ? `^{${i}}` : "")

			repr += `${prefix}${coeff}${base}`
		}

		return repr
	}
}

class LawOfIndices extends BaseQuestion {
	static segment_t(baseArr) {
		/*
		* generate segments (t variant) to be chained in the final question
		* baseArr: array containing the single characters to be used as bases (.length property to be at least 1)
		* NOTE: if containsAdditionOfBases is false, cannot chain, thus assumes it allows addition operation
		* this variant only allows multiplication and division operations, oftentimes with more than 1 bases chained together
		* returns a string representing the segment
		* sample output: 3xy^\{4} * 9y^\{2}
		*/

		// generate two terms, each consisting of at least 1 of the bases in basesArr
		// each for LHS and RHS
		var terms = []
		for (let i = 0; i < 2; i++) {
			var singleHandTerms = []
			var count = BaseQuestion.randomInt(1, baseArr.length)

			for (let j = 0; j < count; j++) {
				var n = BaseQuestion.randomInt(0, baseArr.length - 1)
				if (baseArr[n] in singleHandTerms) {

				} else {
					singleHandTerms.push(n) // work with the indices first to ensure sorted order of bases
				}
			}

			singleHandTerms.sort((a, b) => {
				return a - b
			})

			singleHandTerms.push(BaseQuestion.randomInt(1, 9)) // last index representing the constant coefficient
			terms.push(singleHandTerms);
		}

		var r = "" // final representation string
		for (let i = 0; i < 2; i++) {
			var coeff = terms[i][terms[i].length - 1] // last element representing the constant coefficient
			if (coeff > 1) {
				// omit coefficient of 1
				r += coeff
			}

			for (let j = 0; j < terms[i].length - 1; j++) { // exclude the last element
				var exp = BaseQuestion.randomInt(2, 13) // exponent value
				r += `${baseArr[terms[i][j]]}^\{${exp}}`
			}

			if (i !== 1) {
				// append an operation suffix
				if (Math.random() >= .5) {
					r += "\\times "
				} else {
					r += "\\div "
				}
			}
		}

		return r
	}

	static segment_k() {
		/*
		 * generate segments (k variant) to be chained in the final question
		 * NOTE: if containsAdditionOfBases is false, cannot chain, thus assumes it allows addition operation
		 * returns a string representing the segment
		 */

		// generation states
		var isNumericBases = Math.random() >= 0.5
		var isNumericIndices = Math.random() >= 0.5
		var isSameBase = Math.random() >= 0.05
		var isBloatedBase = isSameBase && (Math.random() >= 0.5)
		var isDualBloatedBase = isBloatedBase && (Math.random() >= 0.5) // both numbers are bloated
		var isSameIndices = !isSameBase // if not same base, has to be same indices

		var containsConstant = (isSameBase && !isBloatedBase) && Math.random() >= 0.2
		var isNumericConstant = containsConstant && Math.random() >= .5
		var isDualConstant = containsConstant && Math.random() >= .8
		var isConstantOnLHS = !isDualConstant && Math.random() >= .5 // on RHS otherwise
		var toInclMultOp = containsConstant && isNumericBases && isNumericConstant // to include when both are numbers (will always be false when containsConstant is false)

		var allowsAddition = isBloatedBase && (Math.random() >= 0.5)
		var isAdditionOp = allowsAddition && (Math.random() >= 0.5)
		var isMultOp = !allowsAddition && (Math.random() >= 0.5) // otherwise division mod

		var bases = []
		var indices = [] // corresponds to the indices in bases
		if (isNumericBases) {
			bases.push(Math.floor(Math.random() * 14) + 2)

			if (isBloatedBase) {
				bases[0] = BaseQuestion.randomInt(2, 5)
				bases.push(bases[0] ** BaseQuestion.randomInt(2, 7 - bases[0]))

				if (isDualBloatedBase) {
					bases[0] **= BaseQuestion.randomInt(2, 7 - bases[0])
				}
			} else if (isSameBase) {
				bases.push(bases[0])
			} else {
				bases.push(Math.floor(Math.random() * 14) + 2)
			}
		} else {
			// algebraic base
			bases.push(Unknowns.constants[Math.floor(Math.random() * Unknowns.constants.length)])

			if (!isSameBase) {
				bases.push(Unknowns.constants[Math.floor(Math.random() * Unknowns.constants.length)])
			} else {
				bases.push(bases[0])
			}
		}

		// determine indices
		if (isNumericIndices) {
			indices.push(Math.floor(Math.random() * 70) + 2)

			if (isSameIndices) {
				indices.push(indices[0])
			} else {
				indices.push(Math.floor(Math.random() * 70) + 2)
			}
		} else {
			indices.push(Unknowns.indices[Math.floor(Math.random() * Unknowns.indices.length)])

			if (isSameIndices) {
				indices.push(indices[0])
			} else {
				indices.push(Unknowns.indices[Math.floor(Math.random() * Unknowns.indices.length)])
			}
		}

		// determine constants
		var constants = ["", ""]
		var leftMultOp = (toInclMultOp && (isDualConstant | isConstantOnLHS)) ? "\\times " : ""
		var rightMultOp = (toInclMultOp && (isDualConstant | !isConstantOnLHS)) ? "\\times " : ""
		if (containsConstant) {
			var c
			if (isNumericConstant) {
				c = BaseQuestion.randomInt(2, 9)

				if (isDualConstant) {
					// generate another constant
					constants[0] = c
					constants[1] = BaseQuestion.randomInt(2, 9)
				}
			} else {
				c = Unknowns.constants[Math.floor(Math.random() * Unknowns.constants.length)]

				if (isDualConstant) {
					// generate another constant
					constants[0] = c
					constants[1] = Unknowns.constants[Math.floor(Math.random() * Unknowns.constants.length)]
				}
			}

			if (!isDualConstant) {
				// exists on either sides
				constants[isConstantOnLHS ? 0 : 1] = c
			}
		}

		// determine operation
		var op = "\\div"
		if (isAdditionOp) {
			op = "+"
		} else if (isMultOp) {
			op = "\\times"
		}

		// return in string
		if (isNumericBases && !isNumericConstant) {
			// 2^j*d
			// bases goes first before constants
			return `${bases[0]}^\{${indices[0]}}${leftMultOp}${constants[0]}${op} ${bases[1]}^\{${indices[1]}}${rightMultOp}${constants[1]}`
		} else {
			return `${constants[0]}${leftMultOp}${bases[0]}^\{${indices[0]}}${op} ${constants[1]}${rightMultOp}${bases[1]}^\{${indices[1]}}`
		}
	}

	constructor() {
		super();
		var segment
		if (Math.random() >= .5) {
			var selection = [
				Unknowns.determinants,
				["v", "w", "s", "p"],
				["m", "n", "o", "p"],
				["i", "j", "k", "g"],
			]
			segment = LawOfIndices.segment_t(selection[BaseQuestion.randomInt(0, selection.length)])
		} else {
			segment = LawOfIndices.segment_k()
		}

		this.qnReprString = "Express %%0%% in positive index form."
		this.qnLatexEqn = [segment]
	}
}

class StandardForm extends BaseQuestion {
	static segment_num(small) {
		/*
		 * generates a number with random digits (with the possibility of it being a floating point number)
		 * small: boolean, if true, will generate digits within 4-6 digits, otherwise 6-13 digits
		 * returns the final string
		 */
		var isLeadingZeroes = Math.random() >= .7 // e.g. 0.00473
		var isWholeInteger = !isLeadingZeroes && Math.random() >= .5

		var base = ""

		// generate the individual digits for the base
		if (isLeadingZeroes) {
			// count zero places first
			var leadingCount = BaseQuestion.randomInt(1, 6)
			base = `0.${"0".repeat(leadingCount - 1)}`
		}

		var digitCount = small ? BaseQuestion.randomInt(4, 6) : BaseQuestion.randomInt(6, 13)
		var hasDecimal = isLeadingZeroes // already has a decimal if there are leading zeroes
		for (let i = 0; i < digitCount; i++) {
			var min = (isLeadingZeroes || i >= 1) ? 0 : 1 // start from 0 iff has leading zeroes or is the second digit to be generated
			base += BaseQuestion.randomInt(min, 9)

			if (!isWholeInteger && !hasDecimal && i >= 1 && i < digitCount - 1 && Math.random() >= .6) {
				// is not a whole integer, and does not yet have a decimal place, not first/last digit in generation
				// therefore, insert a decimal
				base += "."
				hasDecimal = true
			}
		}

		return base
	}

	constructor() {
		super()

		var isComputationNeeded = Math.random() >= .8
		var isPartiallyCompleted = isComputationNeeded && Math.random() >= .6 // e.g. 44.05x10^5
		var isInUnits = !isComputationNeeded && Math.random() >= .7 // e.g. 129 Billion in standard form

		var digit = StandardForm.segment_num(isComputationNeeded || isInUnits) // random semi-large number (either integer or floating point)
		var unit = "";
		if (isComputationNeeded) {
			if (isPartiallyCompleted) {
				// append a x10^n behind
				var n = BaseQuestion.randomInt(1, 14) * (Math.random() >= .7 ? -1 : 1) // set polarity
				digit += `\{\\times}10^\{${n}}`
			} else {
				// generate another number and choose mode of operation
				var n = StandardForm.segment_num(isComputationNeeded)
				var op = "\\times "
				if (Math.random() >= .5) {
					op = "\\div "
				}

				digit += `${op}${n}`
			}
		} else if (isInUnits) {
			var rn = BaseQuestion.randomInt(0, BaseTenUnits.unitMap.length - 1) // random index
			unit = BaseTenUnits.unitMap[rn]
			if (rn >= 4 && parseInt(digit[0]) > 1) {
				// add one 's' suffix at the end if unit 10^n, where n is positive AND leading number is > 1
				unit += "s"
			} else if (unit === "one") {
				unit = ""; // omit one
			}
		}

		this.qnReprString = `Express %%0%% ${unit} in standard form.`
		this.qnLatexEqn = [digit]
	}
}

class FactorisingPolynomial extends BaseQuestion {
	static segment_r() {
		/*
		 * generates and returns a polynomial with roots a and b (also known as the root form variant, hence segment_r)
		 * starts by generating in the form (ax-b)(cx-d)
		 * returns [string representation of the polynomial, factored answer]
		 */
		var lhsHasCoefficient = Math.random() >= 0.7
		var rhsHasCoefficient = Math.random() >= 0.7
		var lhsIsNegativeCoeff = lhsHasCoefficient && Math.random() >= 0.7
		var rhsIsNegativeCoeff = rhsHasCoefficient && Math.random() >= 0.7

		var isLHSRootNegative = Math.random() >= 0.5
		var isRHSRootNegative = Math.random() >= 0.5

		var a = 1, c = 1
		if (lhsHasCoefficient) {
			a = BaseQuestion.randomInt(2, 9) * (lhsIsNegativeCoeff ? -1 : 1)
		}
		if (rhsHasCoefficient) {
			c = BaseQuestion.randomInt(2, 9) * (rhsIsNegativeCoeff ? -1 : 1)
		}

		var b = 1, d = 1
		b = BaseQuestion.randomInt(1, 9) * (isLHSRootNegative ? -1 : 1)
		d = BaseQuestion.randomInt(1, 9) * (isRHSRootNegative ? -1 : 1)

		// expand out this polynomial and simplify
		// in the form f(x) = (a*c)x^2 + (-da -bc)x + bd
		var lTerm = "", xTerm = "", constantTerm = ""
		var lcoeff = a * c, xTermCoeff = -d * a - b * c, constant = b * d
		if (Math.abs(lcoeff) === 1) {
			// can omit
			lTerm = "x^2"
		} else {
			// will never be 0 since polynomial is of degree 2
			lTerm = `${lcoeff}x^2`
		}
		if (xTermCoeff === 0) {
			// no term
			xTerm = ""
		} else if (Math.abs(xTermCoeff) === 1) {
			// can omit coeff
			xTerm = xTermCoeff < 0 ? "-" : "+"
			xTerm += "x"
		} else if (xTermCoeff > 0) {
			// include add sign
			xTerm = `+${xTermCoeff}x`
		} else {
			// negative sign is attached
			xTerm = `${xTermCoeff}x`
		}
		if (constant === 0) {
			// omit

		} else {
			constantTerm = constant

			if (constant > 0) {
				// include add sign
				constantTerm = `+${constant}`
			}
		}
		var repr = `${lTerm}${xTerm}${constantTerm}` // question string

		// see if we can factor out (a and b) and (c and d)
		var lhsFactor = 1, rhsFactor = 1
		if (a !== -1 && a !== 1 && b !== -1 && b !== 1) {
			// both are numbers that are not 1
			var lhsFactor = BaseQuestion.gcd(Math.abs(a), Math.abs(b))
			if (lhsFactor !== 1) {
				a = a / lhsFactor // should remain as a n integer since lhsFactor is an int that is a factor of both a and b
				b = b / lhsFactor
			}
		}
		if (c !== -1 && c !== 1 && d !== -1 && d !== 1) {
			// both are numbers that are not 1
			rhsFactor = BaseQuestion.gcd(Math.abs(c), Math.abs(d))
			if (rhsFactor !== 1) {
				c = c / rhsFactor // should remain as a n integer since rhsFactor is an int that is a factor of both c and d
				d = d / rhsFactor
			}
		}

		// write out factored answer
		// converts a, b, c, d from integers to their string representations with value of 1 being omitted
		// determine whether it has repeated roots
		var isRepeatedRoots = a === c && b === d
		var factor = lhsFactor * rhsFactor
		var factorTerm = ""
		if (Math.abs(factor) === 1) {
			// omit digit
			factorTerm = factor < 0 ? "-" : ""
		} else {
			factorTerm = factor
		}
		if (Math.abs(a) === 1) {
			a = a < 0 ? "-" : ""
		}
		if (Math.abs(c) === 1) {
			c = c < 0 ? "-" : ""
		}
		if (b < 0) {
			// is already negative, change the sign to a positive
			b = `+${b * -1}` // remove negative sign
		} else if (b === 0) {
			// omit
			b = ""
		} else if (b > 0) {
			// include minus sign since in root form is (x-b)
			b = `-${b}`
		}
		if (d < 0) {
			// is already negative, change the sign to a positive
			d = `+${d * -1}` // remove negative sign
		} else if (d === 0) {
			// omit
			d = ""
		} else if (d > 0) {
			// include minus sign since in root form is (x-d)
			d = `-${d}`
		}

		var answer = "";
		if (isRepeatedRoots) {
			answer = `${factorTerm}(${a}x${b})^\{2}`
		} else {
			answer = `${factorTerm}(${a}x${b})(${c}x${d})`
		}
		return [repr, answer]
	}

	static segment_l() {
		/*
		 * generates a linear expression to be factored (e.g. 18x - 135)
		 * returns [string representation of the polynomial, factored answer]
		 */

		// generation states
		var isFactorNeg = Math.random() >= .5
		var isCoeffNeg = Math.random() >= .5
		var isConstantNeg = !isCoeffNeg && Math.random() >= .5 // only one term can be negative

		// generate the factor first (e.g. n(ax + b), referring to n)
		var n = BaseQuestion.randomEInt(2, 13) *(isFactorNeg ? -1 : 1) // up to 12

		// generate the two numbers, a and b (e.g. n(ax + b))
		var a = BaseQuestion.randomEInt(1, 21) *(isCoeffNeg ? -1 : 1)
		var b = BaseQuestion.randomEInt(1, 21) *(isConstantNeg ? -1 : 1)

		// can build question representation at this point
		var coeff = a *n, constant = b *n
		if (Math.abs(coeff) === 1) {
			coeff = coeff < 0 ? "-" : "" // omit coefficient
		}
		if (constant === 0) {
			constant = "" // omit constant
		} else if (constant > 0) {
			// prepend "+" operator
			constant = `+${constant}`
		}
		var qnRepr = `${coeff}x${constant}`

		// finalise n, compute gcd of a and b
		var gcd = BaseQuestion.gcd(Math.abs(a), Math.abs(b))
		if (gcd !== 1) {
			n *= gcd

			a /= gcd
			b /= gcd
		}

		// buid answer representation
		var ansCoeff = a, ansConstant = b
		if (Math.abs(ansCoeff) === 1) {
			ansCoeff = ansCoeff < 0 ? "-" : "" // omit coefficient
		}
		if (ansConstant === 0) {
			ansConstant = "" // omit constant
		} else if (constant > 0) {
			// prepend "+" operator
			ansConstant = `+${ansConstant}`
		}
		var ansRepr = `${n}(${ansCoeff}x${ansConstant})`

		return [qnRepr, ansRepr]
	}

	constructor() {
		super();
		var qn, ans
		if (Math.random() >= .5) {
			[qn, ans] = FactorisingPolynomial.segment_r()
		} else {
			[qn, ans] = FactorisingPolynomial.segment_l()
		}

		this.qnReprString = `Factor out %%0%% completely.`
		this.qnLatexEqn = [qn]
	}
}

class LinearEquation extends BaseQuestion {
	static segment_n() {
		/*
		 * generates a linear expression in the form ax + b
		 * returns the string representation along with the gradient of this equation
		 */
		var isCoeffNeg = Math.random() >= .7
		var isConstantNeg = Math.random() >= .7
		var containsThirdTerm = Math.random() >= .6
		var isThirdTermAlgebraic = containsThirdTerm && Math.random() >= .5
		var isThirdTermNeg = containsThirdTerm && Math.random() >= .6
		var a = BaseQuestion.randomInt(1, 13) * (isCoeffNeg ? -1 : 1)
		var b = BaseQuestion.randomInt(1, 19) * (isConstantNeg ? -1 : 1)

		// build third term for variety
		var thirdTerm = ""
		var thirdTermCoeff = 1
		if (containsThirdTerm) {
			thirdTerm = isThirdTermNeg ? "-" : "+"
			thirdTermCoeff = BaseQuestion.randomInt(1, 19)
			if (thirdTermCoeff === 1) {
				thirdTerm += isThirdTermAlgebraic ? "x" : "1"
			} else {
				thirdTerm += `${thirdTermCoeff}${isThirdTermAlgebraic ? "x" : ""}`
			}
		}

		// determine gradient of this line
		var gradient = a * (thirdTermCoeff * (isThirdTermNeg ? -1 : 1))

		// build representative string
		if (Math.abs(a) === 1) {
			a = a < 0 ? "-" : ""
		}
		if (!isConstantNeg) {
			b = `+${b}`
		}
		var repr = `${a}x${b}${thirdTerm}`

		return [repr, gradient]
	}

	static segment_f(scenario = null) {
		/*
		 * generates a linear equation with fractions as coefficients
				 * if scenario is supplied as an argument, will use it instead of randomising it
		 */
		var scenario = scenario == null ? Math.floor(Math.random() + 0.5) + 1 : scenario // returns either 1 or 2
		switch (scenario) {
			case 1:
				// simply denominator the both sides
				var isInvalidEqn = true
				while (isInvalidEqn) {
					var [lhs, lgrad] = LinearEquation.segment_n()
					var [rhs, rgrad] = LinearEquation.segment_n()

					isInvalidEqn = lgrad === rgrad // same gradient will never have intersections, hence no solutions
				}

				var lhsFactorIsNeg = Math.random() >= .8
				var rhsFactorIsNeg = Math.random() >= .8
				var lhsFactor = BaseQuestion.randomInt(1, 9)
				var rhsFactor = BaseQuestion.randomInt(1, 9)

				if (lgrad * (lhsFactor * (lhsFactorIsNeg ? -1 : 1)) === (rgrad * (rhsFactor * (rhsFactorIsNeg ? -1 : 1)))) {
					// both reesulting gradients will be the same, hence solutions
					// add one to left hand side factor
					lhsFactor += 1
				}

				var lhsTerm = lhsFactorIsNeg ? "-" : ""
				var rhsTerm = rhsFactorIsNeg ? "-" : ""
				if (Math.abs(lhsFactor) !== 1) {
					lhsTerm += `\\frac{${lhs}}{${lhsFactor}}`
				} else if (lhsFactor === -1) {
					lhsTerm += `(${lhs})`
				} else {
					lhsTerm = lhs
				}
				if (Math.abs(rhsFactor) !== 1) {
					rhsTerm += `\\frac{${rhs}}{${rhsFactor}}`
				} else if (lhsFactor === -1) {
					rhsTerm += `(${rhs})`
				} else {
					rhsTerm = rhs
				}

				return `${lhsTerm}=${rhsTerm}`
			case 2:
				// single terms over constant denominators
				var sides = []
				var gradients = []
				var prevTermCount = 0;
				for (let i = 0; i < 2; i++) {
					var termCount = BaseQuestion.randomInt(1, 3)
					termCount += prevTermCount // ensure no single terms on both sides
					prevTermCount = termCount

					var gradient = 0 // calculate gradient here, ensure both sides do not have the same gradient

					var hasVariable = false // will be set to true when an algebraic numerator has been generated
					var repr = "" // to build representation here
					for (let j = 0; j < termCount; j++) {
						var isNumeratorAlgebraic = (Math.random() >= .3 || (!hasVariable && j === termCount - 1))
						var isNegativeCoeff = Math.random() >= .6
						var coeff = BaseQuestion.randomInt(1, 9)
						var denominator = BaseQuestion.randomInt(1, 9)

						// calculate gradient if its an algebraic term
						if (isNumeratorAlgebraic) {
							gradient += (coeff / denominator) * (isNegativeCoeff ? -1 : 1)
						}

						// build fraction representation
						var numerator = ""
						if (isNumeratorAlgebraic && coeff === 1) {
							// can omit the coeff
							numerator = "x"
						} else if (!isNumeratorAlgebraic) {
							numerator = coeff
						} else {
							// is algebraic with coefficient more than 1
							numerator = `${coeff}x`
						}

						// build representation
						var prefix = (!isNegativeCoeff && j > 0) ? "+" : "-"
						if (denominator === 1) {
							// no fractions
							repr += `${prefix}${numerator}`
						} else {
							// wrap it in fractions
							repr += `${prefix}\\frac{${numerator}}{${denominator}}`
						}

						if (isNumeratorAlgebraic) {
							// set state
							hasVariable = true
						}
					}

					sides.push(repr)
					if (gradients.length >= 1 && gradients[gradients.length - 1] === gradient) {
						// same gradient, regenerate it
						return LinearEquation.segment_f(2) // force scenario 2
					}
				}

				return sides.join("=")
		}
	}

	constructor() {
		super();

		var isInvalidEqn = true
		while (isInvalidEqn) {
			var scenario = Math.floor(Math.random() + 0.5) + 1 // returns either 1 or 2
			switch (scenario) {
				case 1:
					var sides = []
					var gradients = [] // compare gradients of both sides, if it is the same, both lines will never intersect and hence have no solution
					for (let i = 0; i < 2; i++) {
						var [hs, grad] = LinearEquation.segment_n()
						if (Math.random() >= .5) {
							// contains a factor
							var lhsFactor = BaseQuestion.randomInt(2, 6) * (Math.random() >= .7 ? -1 : 1)
							sides.push(`${lhsFactor}(${hs})`)
							gradients.push(grad * lhsFactor)
						} else {
							sides.push(`${hs}`)
							gradients.push(grad)
						}
					}

					// compare gradients
					isInvalidEqn = grad[0] === grad[1]

					this.qnReprString = `%%0%%`
					this.qnLatexEqn = [sides.join("=")]
					break
				case 2:
					this.qnReprString = `%%0%%`
					this.qnLatexEqn = [LinearEquation.segment_f()]

					isInvalidEqn = false // .segment_f() handles validating the equation at its own local scope
			}
		}
	}
}

class SimultaneousEquation extends BaseQuestion {
	static segment_b() {
		/*
		 * generates a segment where y + D1 = bx + c + D2, where D can be a constant or a determinant
		 * generation is bloated, i.e. starts from y = bx + c to y + D = bx + c + D2 (possible third term in RHS)
		 * returns the final gradient of the equation
		 */
		var isDAlgebraic = Math.random() >= .5
		var isDNegative = Math.random() >= .5

		var dCoeff = BaseQuestion.randomInt(1, 13)
		var [n, grad] = LinearEquation.segment_n()

		// calculate new gradient
		if (isDAlgebraic) {
			// to flip sign
			grad += dCoeff * (isDNegative ? 1 : -1) // if D is negative, when adding to gradient, make it positive since y-D = bx + c is y = (b+D) + c
		}

		if (grad === 0) {
			// regenerate
			return SimultaneousEquation.segment_b()
		}

		// build representation
		var prefix = isDNegative ? "-" : "+"
		var dTerm = isDAlgebraic ? "x" : dCoeff
		if (isDAlgebraic && dCoeff > 1) {
			// add in coefficient prefix (can omit when coefficient is 1)
			dTerm = `${dCoeff}x`
		}
		var repr = `y${prefix}${dTerm} = ${n}`

		return [repr, grad]
	}
	constructor() {
		super();

		var [a, agrad] = SimultaneousEquation.segment_b()
		while (true) {
			var [b, bgrad] = SimultaneousEquation.segment_b()
			if (agrad !== bgrad) {
				break
			}
		}

		this.qnReprString = "\n%%0%%\n%%1%%"
		this.qnLatexEqn = [a, b]
	}
}

class QuadraticRootsByFactorisation extends BaseQuestion {
	constructor() {
		super();

		var [qnRepr, ans] = FactorisingPolynomial.segment_r()

		this.qnReprString = "%%0%%"
		this.qnLatexEqn = [qnRepr]
	}
}

class QuadraticRootsByFormula extends BaseQuestion {
	constructor() {
		super();

		var [qnRepr, ans] = FactorisingPolynomial.segment_r()

		this.qnReprString = "%%0%%"
		this.qnLatexEqn = [qnRepr]
	}
}

class QuadraticRootsBySquare extends BaseQuestion {
	constructor() {
		super();

		var [qnRepr, ans] = FactorisingPolynomial.segment_r()

		this.qnReprString = "%%0%%"
		this.qnLatexEqn = [qnRepr]
	}
}

class QuadraticRootsWithFractions extends BaseQuestion {
	// involves fractions whose denominator is a linear term and its denominator is also a linear term
	static segment_d(numeratorMaxDeg=1, denominatorOnlyConstant=false) {
		/*
		 * generates a polynomial for the numerator
		 * generates either a constant or another polynomial for the denominator, or not at all (return value of 1 in the last case)
		 * numerator's polynomial's max degree is determined by numeratorMaxDeg
		 * denominator's polynomial (if any) max degree is 1 always
		 * denominatorOnlyConstant: boolean, true if the generated fraction's denominator can only be a denominator
		 * returns [numerator object, denominator object], object: Polynomial|number
		 */
		var poly = new PolynomialExpression(1, 3, numeratorMaxDeg, [-13, 22], false)

		if (denominatorOnlyConstant === false && Math.random() >= .5) {
			// another polynomial as denominator
			var dPoly = new PolynomialExpression(1, 2, 1, [-13, 21], true)
			return [poly, dPoly]
		} else {
			// constant as denominator
			return [poly, BaseQuestion.randomEInt(-10, 10, true)]
		}
	}

	constructor() {
		super();

		// params
		var lhsNumerMaxDeg = BaseQuestion.randomEInt(1, 3) // returns either 1 or 2 (since exclusive end)
		var rhsDenomConstantOnly = lhsNumerMaxDeg === 2 // entire equation when expanded out cannot exceed degree 2

		// generate both sides of the equation
		var a = QuadraticRootsWithFractions.segment_d(lhsNumerMaxDeg)

		var rhsNumerMaxDeg = 1 // if a's denominator is a polynomial
		if (typeof a[1] === "number") {
			rhsNumerMaxDeg = 2
		}
		var b = QuadraticRootsWithFractions.segment_d(rhsNumerMaxDeg, rhsDenomConstantOnly)

		// build the representations
		var aRepr = "", bRepr = ""
		if (typeof a[1] === "number" && Math.abs(a[1]) === 1) {
			// denominator is 1
			if (a[1] < 0) {
				// denominator === -1
				aRepr = `-(${a[0].buildRepr()})`
			} else {
				// denominator === 1
				aRepr = a[0].buildRepr()
			}
		} else {
			// denominator is either a polynomial or has a constant denominator that is not 1 or -1
			if (typeof a[1] === "number") {
				// constant as denominator
				if (a[1] < 0) {
					// append negative sign at the front
					aRepr = `-\\frac{${a[0].buildRepr()}}{${Math.abs(a[1])}}`
				} else {
					aRepr = `\\frac{${a[0].buildRepr()}}{${a[1]}}`
				}
			} else {
				// polynomial as denominator
				aRepr = `\\frac{${a[0].buildRepr()}}{${a[1].buildRepr()}}`
			}
		}
		if (typeof b[1] === "number" && Math.abs(b[1]) === 1) {
			// denominator is 1
			if (b[1] < 0) {
				// denominator === -1
				bRepr = `-(${b[0].buildRepr()})`
			} else {
				// denominator === 1
				bRepr = b[0].buildRepr()
			}
		} else {
			// denominator is either a polynomial or has a constant denominator that is not 1 or -1
			if (typeof b[1] === "number") {
				// constant as denominator
				if (b[1] < 0) {
					// append negative sign at the front
					bRepr = `-\\frac{${b[0].buildRepr()}}{${Math.abs(b[1])}}`
				} else {
					bRepr = `\\frac{${b[0].buildRepr()}}{${b[1]}}`
				}
			} else {
				// polynomial as denominator
				bRepr = `\\frac{${b[0].buildRepr()}}{${b[1].buildRepr()}}`
			}
		}

		this.qnReprString = "%%0%%"
		this.qnLatexEqn = [`${aRepr}=${bRepr}`]
	}
}

class DifferentiatingPolynomialPowerRule extends BaseQuestion {
	static segment_c(maxDegree = 8) {
		/*
		 * uses the Polynomial class to construct a polynomial object and then bloats it
		 * returns [bloated polynomial in string form, answer in string form too]
		 */

		// generate a random number representing the degree
		var n = BaseQuestion.randomInt(2, 8)
		var coeffArr = Array(n).fill(0) // build the coeffficient array
		for (let i = 0; i < n; i++) {
			var containsTermOfThisPower = Math.random() >= .1 // will ignore this term if false
			var coeffIsNeg = containsTermOfThisPower && Math.random() >= .5

			if (containsTermOfThisPower) {
				coeffArr[i] = BaseQuestion.randomInt(2, 29) * (coeffIsNeg ? -1 : 1)
			}
		}

		// construct the polynomial object and bloat it for the question string
		var qnRepr = new Polynomial(coeffArr).bloat(1 - n / 8, true) // bloat less if degree is higher (max 8)

		// construct the polynomial object (grain) to generate the answer
		var ansRepr = new grain.Polynomial(coeffArr).derivative().buildRepr()

		return [qnRepr, ansRepr]
	}
	constructor() {
		super();

		var [qnRepr, ans] = DifferentiatingPolynomialPowerRule.segment_c()

		this.qnReprString = "%%0%%\n%%1%%"
		this.qnLatexEqn = [qnRepr, ans]

		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [ans])
	}
}

class DifferentiatingPolynomialProductRule extends BaseQuestion {
	static segment_p(maxDegree=8) {
		/*
  		 * returns a polynomial segment
		 */
		var n = BaseQuestion.randomEInt(2, maxDegree)
		var coeffArr = Array(n +1).fill(0)

		coeffArr[n] = BaseQuestion.randomEInt(1, 21) *(Math.random() >= .5 ? -1 : 1)
		var maxTerms = BaseQuestion.randomEInt(2, 4)
		for (let i = 1; i < maxTerms; i++) { // start from i = 1 since leading coefficient (term with highest power) has already been determined
			var deg = BaseQuestion.randomEInt(0, n) // will never be n
			coeffArr[deg] += BaseQuestion.randomEInt(1, 21) *(Math.random() >= .5 ? -1 : 1)
		}

		return new Polynomial(coeffArr)
	}

	static segment_c(maxDegree=8) {
		/*
		 * chains two polynomial returned by segment_p() to obtain their product
		 * returns [chained polynomial (with parentheses) in string form, answer in string form too]
		 */
		var a = DifferentiatingPolynomialProductRule.segment_p(maxDegree)
		var b = DifferentiatingPolynomialProductRule.segment_p(maxDegree)

		var qnRepr = `(${a.buildRepr()})(${b.buildRepr()})`
		var ansRepr = new grain.Polynomial(a.coefficients).dProductRule(new grain.Polynomial(b.coefficients)).buildRepr()

		return [qnRepr, ansRepr]
	}

	constructor() {
		super();

		var [qnRepr, ansRepr] = DifferentiatingPolynomialProductRule.segment_c()

		this.qnReprString = "%%0%%\n%%1%%"
		this.qnLatexEqn = [qnRepr, ansRepr]

		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [ansRepr])
	}
}

class DifferentiatingPolynomialQuotientRule extends BaseQuestion {
	static segment_c(maxDegree=8) {
		/*
		 * chains two polynomial returned by segment_p() to obtain their product
		 * returns [chained polynomial (with fractions in latex) as a string, answer representation in string too]
		 */
		var a = DifferentiatingPolynomialProductRule.segment_p(maxDegree)
		var b = DifferentiatingPolynomialProductRule.segment_p(maxDegree)

		var qnRepr = `\\frac{${a.buildRepr()}}{${b.buildRepr()}}`

		var denom = new grain.Polynomial(b.coefficients)
		var qRule = new grain.Polynomial(a.coefficients).dQuotientRule(denom)
		var ansRepr = `\\frac{${qRule[0].buildRepr()}}{${denom.buildRepr()}^{2}}`

		return [qnRepr, ansRepr]
	}

	constructor() {
		super();

		var [qnRepr, ansRepr] = DifferentiatingPolynomialQuotientRule.segment_c()

		this.qnReprString = "%%0%%\n%%1%%"
		this.qnLatexEqn = [qnRepr, ansRepr]

		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [ansRepr])
	}
}

class DifferentiatingPolynomialChainRule extends BaseQuestion {
	static segment_c(maxDegree=8) {
		/*
		 * chains raise polynomial returned by segment_p() to obtain their product
		 * returns [chained polynomial (with fractions in latex) as a string, answer representation in string too]
		 */
		var a = DifferentiatingPolynomialProductRule.segment_p(maxDegree) // (a)^n; represents a

		var n = BaseQuestion.randomEInt(2, 10) // up to 9 (inclusive); represents n in (a)^n
		var coeffArr = Array(n +1).fill(0)
		coeffArr[n] = 1 // x^n

		var b = new Polynomial(coeffArr)

		var qnRepr = `{(${a.buildRepr()})}^{${n}}`
		var ansRepr = new grain.Polynomial(b.coefficients).dChainRule(new grain.Polynomial(a.coefficients), false) // h(x) = a(b(x)), order matters

		return [qnRepr, ansRepr]
	}

	constructor() {
		super();

		var [qnRepr, ansRepr] = DifferentiatingPolynomialChainRule.segment_c()

		this.qnReprString = "%%0%%\n%%1%%"
		this.qnLatexEqn = [qnRepr, ansRepr]

		this.answerObj = new BaseAnswer(false)
		this.answerObj.set("%%0%%", [ansRepr])
	}
}

module.exports = {
	Qriller,
	FracToPerc,
	PercToFrac,
	PercChange,
	ExpressUnitPerc,
	ReversePerc,
	RelativePerc,
	RelativePercManipulation,
	FutureAlgebra,
	SimplifyAlgebraic,
	ModernAlgebra,

	Polynomial,
	Fraction,

	LawOfIndices,
	StandardForm,
	FactorisingPolynomial,
	LinearEquation,
	SimultaneousEquation,
	QuadraticRootsByFactorisation,
	QuadraticRootsByFormula,
	QuadraticRootsBySquare,
	QuadraticRootsWithFractions,
	DifferentiatingPolynomialPowerRule,
	DifferentiatingPolynomialProductRule,
	DifferentiatingPolynomialQuotientRule,
	DifferentiatingPolynomialChainRule
}