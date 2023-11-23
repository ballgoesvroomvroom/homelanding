const crypto = require("crypto")
const {rando, randoSequence} = require('@nastyox/rando.js');
const seedrandom = require("seedrandom");
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

		// seeded rng
		this.rngseed = crypto.randomBytes(32).toString("hex");
		this.rng = seedrandom(this.rngseed);

		// updat refs
		this.updateRefsToMem()
	}

	createQuestions(questionClass, repeatCount, ...args) {
		// ...args use to pass into qnClass for construction
		for (let i = 0; i < repeatCount; i++) {
			this.questions.push(new questionClass(this.rng, ...args))
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

	static randomInt(rng, min, max) {
		/**
		 * rng: seeded Math.random() drop in
		 * generates a random number between min: int, and max: int (inclusive)
		 * does not work for min = 1, max = 2
		 */
		return Math.floor(rng() * (max - min - 1)) + min
	}

	static randomEInt(rng, min, max, excludeZero=false) {
		/**
		 * rng: seeded Math.random() drop in
		 * excludeZero: boolean, if true will never return 0 unless min === 0
		 * returns a random number between min (inclusive) and max (exclusive)
   		 */
		if (excludeZero && min < 0) {
			// determine cardinality
			if (rng() >= .5) {
				// negative portion
				return BaseQuestion.randomEInt(rng, min, 0)
			} else {
				return BaseQuestion.randomEInt(rng, 1, max)
			}
		} else {
			return Math.floor(rng() *(max -min)) +min
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
	static segment_t(rng, baseArr) {
		/*
		* generate segments (t variant) to be chained in the final question
		* rng: seeded Math.random() drop in
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
			var count = BaseQuestion.randomInt(rng, 1, baseArr.length)

			for (let j = 0; j < count; j++) {
				var n = BaseQuestion.randomInt(rng, 0, baseArr.length - 1)
				if (baseArr[n] in singleHandTerms) {

				} else {
					singleHandTerms.push(n) // work with the indices first to ensure sorted order of bases
				}
			}

			singleHandTerms.sort((a, b) => {
				return a - b
			})

			singleHandTerms.push(BaseQuestion.randomInt(rng, 1, 9)) // last index representing the constant coefficient
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
				var exp = BaseQuestion.randomInt(rng, 2, 13) // exponent value
				r += `${baseArr[terms[i][j]]}^\{${exp}}`
			}

			if (i !== 1) {
				// append an operation suffix
				if (rng() >= .5) {
					r += "\\times "
				} else {
					r += "\\div "
				}
			}
		}

		return r
	}

	static segment_k(rng) {
		/**
		 * rng: seeded Math.random() drop in
		 * generate segments (k variant) to be chained in the final question
		 * NOTE: if containsAdditionOfBases is false, cannot chain, thus assumes it allows addition operation
		 * returns a string representing the segment
		 */

		// generation states
		var isNumericBases = rng() >= 0.5
		var isNumericIndices = rng() >= 0.5
		var isSameBase = rng() >= 0.05
		var isBloatedBase = isSameBase && (rng() >= 0.5)
		var isDualBloatedBase = isBloatedBase && (rng() >= 0.5) // both numbers are bloated
		var isSameIndices = !isSameBase // if not same base, has to be same indices

		var containsConstant = (isSameBase && !isBloatedBase) && rng() >= 0.2
		var isNumericConstant = containsConstant && rng() >= .5
		var isDualConstant = containsConstant && rng() >= .8
		var isConstantOnLHS = !isDualConstant && rng() >= .5 // on RHS otherwise
		var toInclMultOp = containsConstant && isNumericBases && isNumericConstant // to include when both are numbers (will always be false when containsConstant is false)

		var allowsAddition = isBloatedBase && (rng() >= 0.5)
		var isAdditionOp = allowsAddition && (rng() >= 0.5)
		var isMultOp = !allowsAddition && (rng() >= 0.5) // otherwise division mod

		var bases = []
		var indices = [] // corresponds to the indices in bases
		if (isNumericBases) {
			bases.push(Math.floor(rng() * 14) + 2)

			if (isBloatedBase) {
				bases[0] = BaseQuestion.randomInt(rng, 2, 5)
				bases.push(bases[0] ** BaseQuestion.randomInt(rng, 2, 7 - bases[0]))

				if (isDualBloatedBase) {
					bases[0] **= BaseQuestion.randomInt(rng, 2, 7 - bases[0])
				}
			} else if (isSameBase) {
				bases.push(bases[0])
			} else {
				bases.push(Math.floor(rng() * 14) + 2)
			}
		} else {
			// algebraic base
			bases.push(Unknowns.constants[Math.floor(rng() * Unknowns.constants.length)])

			if (!isSameBase) {
				bases.push(Unknowns.constants[Math.floor(rng() * Unknowns.constants.length)])
			} else {
				bases.push(bases[0])
			}
		}

		// determine indices
		if (isNumericIndices) {
			indices.push(Math.floor(rng() * 70) + 2)

			if (isSameIndices) {
				indices.push(indices[0])
			} else {
				indices.push(Math.floor(rng() * 70) + 2)
			}
		} else {
			indices.push(Unknowns.indices[Math.floor(rng() * Unknowns.indices.length)])

			if (isSameIndices) {
				indices.push(indices[0])
			} else {
				indices.push(Unknowns.indices[Math.floor(rng() * Unknowns.indices.length)])
			}
		}

		// determine constants
		var constants = ["", ""]
		var leftMultOp = (toInclMultOp && (isDualConstant | isConstantOnLHS)) ? "\\times " : ""
		var rightMultOp = (toInclMultOp && (isDualConstant | !isConstantOnLHS)) ? "\\times " : ""
		if (containsConstant) {
			var c
			if (isNumericConstant) {
				c = BaseQuestion.randomInt(rng, 2, 9)

				if (isDualConstant) {
					// generate another constant
					constants[0] = c
					constants[1] = BaseQuestion.randomInt(rng, 2, 9)
				}
			} else {
				c = Unknowns.constants[Math.floor(rng() * Unknowns.constants.length)]

				if (isDualConstant) {
					// generate another constant
					constants[0] = c
					constants[1] = Unknowns.constants[Math.floor(rng() * Unknowns.constants.length)]
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

	constructor(rng) {
		/**
		 * rng: seeded Math.random() drop in supplied from Qriller object
		 */
		super();
		var segment
		if (rng() >= .5) {
			var selection = [
				Unknowns.determinants,
				["v", "w", "s", "p"],
				["m", "n", "o", "p"],
				["i", "j", "k", "g"],
			]
			segment = LawOfIndices.segment_t(rng, selection[BaseQuestion.randomInt(rng, 0, selection.length)])
		} else {
			segment = LawOfIndices.segment_k(rng)
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