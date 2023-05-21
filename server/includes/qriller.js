const crypto = require("crypto")
const mem = require("./qrillerMemory.js")

class Qriller {
	constructor() {
		this.id = crypto.randomBytes(16).toString("hex")

		this.title = ""
		this.code = ""
		this.note = ""
		this.questions = []
	}

	createQuestions(questionClass, repeatCount) {
		for (let i = 0; i < repeatCount; i++) {
			this.questions.push(new questionClass())
		}
	}

	updateRefsToMem() {
		// expose qriller instance to shared memory so API side can reference it
		mem[this.id] = this
	}
}

class BaseQuestion {
	question = ""
	equationList = []

	isAlgebraic = false
	answer = null

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
}

class FracToPerc extends BaseQuestion {
	isAlgebraic = false
	constructor() {
		super();

		// compute the numerator and denominator to obtain a random fraction
		var basearg = 1 +Math.floor(Math.random() *500)
		var vararg = Math.floor(Math.random() *100) // variance between args

		var numer = basearg +Math.floor(Math.random() *vararg)
		var denom = basearg +Math.floor(Math.random() *Math.abs(numer -vararg)) // guaranteed to be at least 1 with basearg

		// insert latex equation into this.equationList
		this.equationList.push(`\\frac{${numer}}{${denom}}`)

		this.answer = BaseQuestion.roundOffSf(numer / denom)
		this.question = `Convert the following %%0%% to percentage.`
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

module.exports = {Qriller, FracToPerc}