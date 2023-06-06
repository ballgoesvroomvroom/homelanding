const crypto = require("crypto")
const {rando, randoSequence} = require('@nastyox/rando.js');
const mem = require("./qrillerMemory.js")

class Qriller {
	constructor() {
		this.id = crypto.randomBytes(16).toString("hex")

		this.title = ""
		this.code = ""
		this.note = ""
		this.questions = []
	}

	createQuestions(questionClass, repeatCount, ...args) {
		// ...args use to pass into qnClass for construction
		for (let i = 0; i < repeatCount; i++) {
			this.questions.push(new questionClass(...args))
		}
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
		var factor = a /b

		return this.num *factor
	}
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
	constructor(variables) {

	}
}

class BaseQuestion {
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
		return BaseQuestion.gcd(b %a, a)
	}

	static getDecimalPlace(float) {
		// returns a number representing the amount of decimal places float has
		var dp = 0
		while ((float *10 **dp) % 1 > 0.000001 && (float *10 **dp) % 1 < 0.999999) {
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
		var float = rando(Math.floor(1 /step) -1) *(step)

		// clamp result
		var clamp = baseInt +(float)
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
		var lim = Math.floor(int /2)
		var max = 0; // store max so can iterate through hashmap
		while (divisor < lim) {
			if (int % divisor === 0) {
				// divisor is a multiple of int, hence can be divided
				f[divisor] = true
				f[Math.floor(int /divisor)] = true // int /divisor should be an integer

				// store max
				if ((int /divisor) > max) {
					max = Math.floor(int /divisor)
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
		var basearg = 1 +Math.floor(Math.random() *500)
		var vararg = Math.floor(Math.random() *100) // variance between args

		var numer = basearg +Math.floor(Math.random() *vararg)
		var denom = basearg +Math.floor(Math.random() *Math.abs(numer -vararg)) // guaranteed to be at least 1 with basearg

		// format question with equation
		this.qnReprString = `Convert the following %%0%% to percentage.`
		this.qnLatexEqn.push(`\\frac{${numer}}{${denom}}`)

		// generate answer
		var answer = parseFloat((numer /denom).toPrecision(3)) // BaseQuestion.roundOffSf(numer / denom, 3)

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
			intPart = 1 +rando(5000)
		} else if (largeNum > .85) {
			intPart = 1 +rando(900)
		} else {
			intPart = 1 +rando(100)
		}

		var precision = 10 // 1 decimal places
		var decimalPart = rando(0, 10)
		var percVal = intPart +(decimalPart /precision)

		// form the fractions
		var num = intPart *precision +decimalPart
		var den = precision *100 // 100 is to convert between percentage and fractions

		// simplify it using gcd
		var gcd = BaseQuestion.gcd(num, den)
		num = Math.floor(num /gcd)
		den = Math.floor(den /gcd)

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
					var person = Database.people[Math.floor(Math.random() *Database.people.length)]

					var speedGauge = rando(1, 5) // decision making
					var action, small, big
					var unit = "km/h"
					switch (speedGauge) {
						case 1:
							// foot
							small = rando(1, 600)
							big = small +rando(390)
							action = small < 400 ? "walks" : "runs" // determine action by walk speed (m/h)
							unit = "m/h"
							break
						case 2:
							// driving
							small = rando(5, 80) +(rando(9) /10)
							// small = rando(5, 80) +(Math.floor(rando() *10) /10) // speed up to 1 d.p.
							big = small +rando(70) +(rando(9) /10)

							action = "drives a car"
							break
						case 3:
							// cycling
							small = rando(1, 5) +(rando(19) *5) /100
							big = small +rando(30) +(rando(19) *5) /100

							action = "cycles"
							break
						case 4:
							// rides a bus
							small = rando(1, 5) +(rando(1, 9) /10)
							big = small +rando(20) +(rando(9) /10)

							action = "rides a bus which goes"
							break
						case 5:
							// swimming
							small = rando(1, 5) +(rando(19) *5) /100
							big = small +rando(8) +(rando(19) *5) /100

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
					var answer = (second -first) /first *100 //BaseQuestion.roundOffSf((second -first) /first *100, 3)
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
							small = rando(1, 20) +(rando(9) /10)
							big = small +rando(1, 20) +(rando(9) /10)

							noun = "environment"
						case 2:
							// fridge temperature
							small = rando(4, 10) +(rando(9) /10)
							big = small +rando(1, 10) +(rando(9) /10)

							noun = "fridge"
						case 3:
							// freezer
							small = rando(0, 5) +(rando(1, 9) /10) // temp up to 1 d.p. (at least 0.1)
							big = small +rando(1, 5) +(rando(9) /10)

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
					var answer = ((second -first) /first *100) // BaseQuestion.roundOffSf((second -first) /first *100, 3)
					this.answerObj = new BaseAnswer(false)
					this.answerObj.set("%%0%%\%", [`${parseFloat(answer.toPrecision(3))}`])
			}
		} else {
			var basearg = rando(1, 5000)
			var a = basearg +rando(1, 100)
			var b;

			// include negatives?
			var includeNegatives = rando() > .95
			if (includeNegatives) {
				b = -rando(1, 100 *Math.floor(basearg /5))
			} else {
				b = basearg +rando(1, 100 *Math.floor(basearg /2))
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

				var answer = (big -small) /small *100 // BaseQuestion.roundOffSf((big -small) /small *100, 3)
			} else if (determineIncrOrder === false || (determineIncrOrder == null && !increasingOrder)) {
				// decreases
				// big change to small (-ve % change)
				mode = "decreased"
				first = big
				second = small

				var answer = (small -big) /big *100 // BaseQuestion.roundOffSf((small -big) /big *100, 3)
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
				var baseUnitChoice = rando(0, LengthUnit.unitMap.length -1)
				var baseUnit = LengthUnit.unitMap[baseUnitChoice] // assume both a and b are this unit
				aVal = BaseQuestion.genFloat(5, 100, .1)
				bVal = BaseQuestion.genFloat(1, aVal, .1)

				// generate targetUnit based on adjacentUnitsConversion
				var targetUnitChoice;
				if (adjacentUnitsConversion) {
					targetUnitChoice = rando(baseUnitChoice >= 1 ? baseUnitChoice -1 : baseUnitChoice, baseUnitChoice < LengthUnit.unitMap.length -1 ? baseUnitChoice +1 : baseUnitChoice)
				} else {
					targetUnitChoice = rando(0, LengthUnit.unitMap.length -1)
				}
				var targetUnit = LengthUnit.unitMap[targetUnitChoice] // convert b to this unit

				// convert b to targetUnit
				bRepr = new LengthUnit(bVal).convert(baseUnit, targetUnit)

				// calculate percentage
				percAns = (bVal /aVal) *100

				// store fields
				aUnit = baseUnit
				bUnit = targetUnit

				break
			case 2:
				// mass

				// generate 2 mnumbers in a unit
				var baseUnitChoice = rando(0, Mass.unitMap.length -1)
				var baseUnit = Mass.unitMap[baseUnitChoice] // assume both a and b are this unit
				aVal = BaseQuestion.genFloat(5, 100, .1)
				bVal = BaseQuestion.genFloat(1, aVal, .1)

				// generate targetUnit based on adjacentUnitsConversion
				var targetUnitChoice;
				if (adjacentUnitsConversion) {
					targetUnitChoice = rando(baseUnitChoice >= 1 ? baseUnitChoice -1 : baseUnitChoice, baseUnitChoice < Mass.unitMap.length -1 ? baseUnitChoice +1 : baseUnitChoice)
				} else {
					targetUnitChoice = rando(0, Mass.unitMap.length -1)
				}
				var targetUnit = Mass.unitMap[targetUnitChoice] // convert b to this unit

				// convert b to targetUnit
				bRepr = new Mass(bVal).convert(baseUnit, targetUnit)

				// calculate percentage
				percAns = (bVal /aVal) *100

				// store fields
				aUnit = baseUnit
				bUnit = targetUnit

				break
			case 3:
				// liquid volume

				// generate 2 mnumbers in a unit
				var baseUnitChoice = rando(0, LiquidVolume.unitMap.length -1)
				var baseUnit = LiquidVolume.unitMap[baseUnitChoice] // assume both a and b are this unit
				aVal = BaseQuestion.genFloat(5, 100, .1)
				bVal = BaseQuestion.genFloat(1, aVal, .1)

				// generate targetUnit based on adjacentUnitsConversion
				var targetUnitChoice;
				if (adjacentUnitsConversion) {
					targetUnitChoice = rando(baseUnitChoice >= 1 ? baseUnitChoice -1 : baseUnitChoice, baseUnitChoice < LiquidVolume.unitMap.length -1 ? baseUnitChoice +1 : baseUnitChoice)
				} else {
					targetUnitChoice = rando(0, LiquidVolume.unitMap.length -1)
				}
				var targetUnit = LiquidVolume.unitMap[targetUnitChoice] // convert b to this unit

				// convert b to targetUnit
				bRepr = new LiquidVolume(bVal).convert(baseUnit, targetUnit)

				// calculate percentage
				percAns = (bVal /aVal) *100

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
		var relnum = percVal /100 *num

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
		var answer = percVal /100 *num
		var isExact = ((answer /num) - (percVal /100)) < .00001 // determine if its exact (support for marginal error)
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
			answer = (100 +percVal) /100 *num
		} else {
			answer = (100 -percVal) /100 *num           
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

class SimplifyAlgebraic extends BaseQuestion {
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
			var termsLength = 1 +rando(1, 3)
			var termsCoeffFactor = rando(2, 6) // to multiple all coeffs by a range of factor
			for (let j = 0; j < termsLength; j++) {
				var coeff = rando(1, 12) *rando(termsCoeffFactor -1, termsCoeffFactor +1)
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

module.exports = {Qriller, FracToPerc, PercToFrac, PercChange, ExpressUnitPerc, ReversePerc, RelativePerc, RelativePercManipulation, SimplifyAlgebraic}