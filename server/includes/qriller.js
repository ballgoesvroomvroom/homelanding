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
		if (a == 0) {
			return b
		}
		return BaseQuestion.gcd(b %a, a)
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
		var answer = BaseQuestion.roundOffSf(numer / denom, 3)

		this.answerObj = new BaseAnswer(true)
		this.answerObj.set(answer)
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
					var answer = BaseQuestion.roundOffSf((second -first) /first *100, 3)
					this.answerObj = new BaseAnswer(false)
					this.answerObj.set("%%0%%\%", [answer.toString()])
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
							big = small +rando(5) +(rando(9) /10)

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
					var answer = BaseQuestion.roundOffSf((second -first) /first *100, 3)
					this.answerObj = new BaseAnswer(false)
					this.answerObj.set("%%0%%\%", [answer.toString()])
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

				var answer = BaseQuestion.roundOffSf((big -small) /small *100, 3)
			} else if (determineIncrOrder === false || (determineIncrOrder == null && !increasingOrder)) {
				// decreases
				// big change to small (-ve % change)
				mode = "decreased"
				first = big
				second = small

				var answer = BaseQuestion.roundOffSf((small -big) /big *100, 3)
			}

			// set fields
			this.qnReprString = `Find the percentage ${qnMode} when %%0%% is ${mode} to %%1%%.`
			this.qnLatexEqn.push(first.toString())
			this.qnLatexEqn.push(second.toString())

			this.answerObj = new BaseAnswer(true)
			this.answerObj.set("%%0%%\%", [`${answer}`])
		}
	}
}

class TwoSimQn extends BaseQuestion {
	isAlgebraic = true
	constructor(a, toughnessDegree) {
		// supply values of a, compute value of b
		// toughnessDegree 1-3 (with 3 being the toughest)

		// form random equations with relations to a and b
	}
}

module.exports = {Qriller, FracToPerc, PercToFrac, PercChange}