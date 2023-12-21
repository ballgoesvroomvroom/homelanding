class EuclidTools {
	static gcd(a, b) {
		// returns the gcd between two numbers under the ring Z
		if (a % 1 != 0 || b % 1 != 0) {
			// not integers
			return 1
		}

		while (b != 0) {
			var t = b
			b = a % b
			a = t
		}
		return a
	}

	static lcm(a, b) {
		/*
		 * returns the lcm between two numbers under the ring Z
		 */
		return (a *b) /EuclidTools.gcd(a, b)
	}

	static buildSieve(n) {
		// builds the sieve of eratosthenes up to n (exclusive)
		var sieve = Array(n -1).fill(True)
		for (let i = 2; i < n; i++) {
			if (sieve[i] === false) {
				// composite number, skip
				continue
			}

			for (let j = 2; j < n; j++) {
				sieve[i *j] = false
			}
		}

		return sieve
	}

	static sieveOfEratosthenes(n) {
		// generate a prime number immediately after n
		// follows Bertrand's postulate where there exists a prime, between n and 2n
		// implements the sieve of eratosthenes
		var sieve = Array(2*n +2).fill(True)
		for (let i = 2; i < 2*n; i++) {
			if (sieve[i] === false) {
				// composite number, skip
				continue
			} else if (i > n) {
				return i // prime number
			}

			for (let j = 2; j < 2*n; j++) {
				sieve[i *j] = false
			}
		}
	}
}

class Matrix {
	constructor(row, column, emptyValue) {
		// emptyValue: str|int, value used to populate the matrix's cells
		this.data = []
		for (let i = 0; i < column; i++) {
			this.data.push(Array(row).fill(emptyValue)) // fill it with undefined
		}
	}

	getDeterminant(m=this.data) {
		// returns the determinant of matrix m (has to be of n*n size, square)
		if (m.length !== m[0].length) {
			// not a square matrix
			return
		}

		if (m.length === 2) {
			// simply return calculated value
			return m[0][0] *m[1][1] -m[0][1] *m[1][0]
		}

		var toggle = true;
		var determinant = 0;
		for (let i = 0; i < m[0].length; i++) {
			// form new matrix to calculate determinant
			var factor = m[0][i]; // factor
			var dm = []
			for (let j = 1; j < m.length; j++) {
				// iterate the rows first
				var drow = []
				for (let k = 0; k < m[0].length; k++) {
					// iterate columns
					if (k === i) {
						continue; // do not add this column
					}

					drow.push(m[j][k])
				}

				dm.push(drow)
			}

			determinant += factor *this.getDeterminant(dm) *(toggle ? -1 : 1)
			toggle = !toggle; // toggle value
		}

		return determinant;
	}
}

class Fraction {
	static gcd(a, b) {
		/*
		 * returns the gcd of fraction a and b
		 * https://math.stackexchange.com/a/199905/1197933
		 */

		// both fractions have to be simplified where gcd(numerator, denominator) === 1
		a = a.simplify()
		b = b.simplify()

		return new Fraction(EuclidTools.gcd(a.a, b.a), EuclidTools.lcm(a.b, b.b))
	}

	constructor(a=0, b=1) {
		/*
		 * constructs a fraction representative object where,
		 * a is the numerator,
		 * b is the denominator
		 * where both are integers
		 */
		this.a = a
		this.b = b
		this.val = a / b

		if (this.a < 0 && this.b < 0) {
			// change their polarity to positive
			this.a *= -1
			this.b *= -1
		} else if (this.a > 0 && this.b < 0) {
			// change numerator to take positive
			this.a *= -1
			this.b *= -1
		}
	}

	simplify() {
		/*
		 * simplifies the numerator and denominator in place
		 */
		var prim = EuclidTools.gcd(Math.abs(this.a), Math.abs(this.b))

		this.a = this.a / prim
		this.b = this.b / prim // this.val should remain the same

		return this // for chaining
	}

	minusFromConstant(c) {
		/*
		 * c: number, representing the constant to be minus in the form C - fraction
		 */
		return new Fraction((c *this.b) -(this.a), this.b) // for chaining
	}

	minusBeforeConstant(c) {
		/*
		 * self explanatory name
		 * c: constant to substract from this fraction, in the form, fraction - C
		 */

		return new Fraction(this.a -(c *this.b), this.b)
	}

	addConstant(c) {
		/*
		 * c: number, constant to add to fraction in the form, fraction + C or C + fraction
		 */
		return new Fraction(this.a +(c *this.b), this.b)
	}

	multByConstant(c) {
		/*
		 * c: number, constant to be multiplied this fraction by, in the form, fraction *c
		 */
		return new Fraction(this.a *c, this.b)
	}

	divByConstant(c) {
		/*
		 * c: number, constant to divide this fraction by, in the form, fraction /c
		 */
		return new Fraction(this.a, this.b *c)
	}

	add(frac) {
		/*
		 * frac: Fraction Object
		 * adds another fraction object and returns a new fraction object where
		 * the sum of both fractions
		 */

		var a = this.a * frac.b + frac.a * this.b
		var b = this.b * frac.b

		return new Fraction(a, b).simplify()
	}

	sub(frac) {
		/*
		 * frac: Fraction Object
		 * subtracts another fraction object and returns a new fraction object where
		 * the difference of both fractions, i.e. this - frac = return value
		 */

		var a = this.a * frac.b - frac.a * this.b
		var b = this.b * frac.b

		return new Fraction(a, b).simplify()
	}

	mult(frac) {
		/*
		 * frac: Fraction Object
		 * multiplies another fraction object and returns a new fraction object where
		 * the product of both fractions
		 */
		return new Fraction(this.a * frac.a, this.b * frac.b).simplify()
	}

	div(frac) {
		/*
		 * frac: Fraction Object
		 * divides another fraction object and returns a new fraction object where
		 * the result of both fractions, i.e. this / fraction = return value
		 */
		return new Fraction(this.a * frac.b, this.b * frac.a).simplify()
	}

	power(c) {
		/*
		 * raises the fraction to power of c
		 */
		return new Fraction(this.a **c, this.b **c)
	}

	repr() {
		/*
		 * returns a string where it represents the fraction object within latex's syntax
		 */
		if (this.b === 1) {
			return `${this.a}`
		} else {
			var prefix = ""

			if (this.a < 0) {
				prefix = "-"
			}

			return `${prefix}\\frac{${Math.abs(this.a)}}{${this.b}}` // this.b will never be negative
		}
	}

	toString() {
		return this.repr()
	}
}

class Surd {
	constructor(a, root) {
		/*
		 * constructs a surd object with nth-root of root
		 * a: number|Fraction, represents the base
		 * root: number, represents the nth-root of a
		 */
		this.a = a
		this.n = root

		this.value = 0
		if (typeof this.a === "number") {
			this.val = a **(1 /n)
		} else if (this.a instanceof Fraction) {
			this.val = a.val **(1 /n)
		} else if (this.a instanceof Polynomial) {
			// no definition yet, remain as 0
		}
	}

	toValue() {
		return this.val
	}

	repr() {
		if (this.n === 2) {
			return `\\sqrt{${a}}`
		} else {
			return `\\sqrt[${n}]{${a}}`
		}
	}
}

class Exact {
	/*
	 * to wrap expressions in exact form with Surd instances and Fraction instances
	 * contains its own AST tree structure
	 */
	static TreeObject(a, type) {
		/*
		 * a: number|string|Fraction|Surd, raw value to be stored in the node, either operand or operation
		 * type: 1|2, 1 for operand, 2 for operation
		 */
		return [a, type]
	}
	constructor(a) {
		/*
		 * a: number|Fraction|Surd, instance to start off the expression with
		 * operations will be chained behind a
		 */
		this.tree = [[], [], []] // 0th index stores the value of the root, 1th and 2nd index stores the leaf nodes
		this.treeCurrentPath = [] // 1 for left descend, 2 for right descend

		this.tree[0] = Exact.TreeObject(a, 1)
		this.val = 0 // compute the value
		if (typeof a === "number") {
			this.val = a
		} else if (a instanceof Fraction) {
			this.val = a.val
		} else if (a instanceof Surd) {
			this.val = a.val
		}
	}

	get currentNode() {
		var selection = this.tree
		for (let i = 0; i < this.treeCurrentPath.length; i++) {
			selection = selection[this.treeCurrentPath[i]]
		}

		return selection
	}

	valueOf() {
		return this.val
	}

	add(a) {
		/*
		 * a: number|Fraction|Surd|Exact
		 */
		var currentNode = this.currentNode // cache result to prevent unnecessary loops
		if (currentNode[0][1] === 1) {
			// is a leaf node, change it to an operand
			currentNode[1][0] = currentNode[0]
			currentNode[0] = Exact.TreeObject("+", 2)
		} else {
			console.warn(`[warn]: unimplemented, currentNode is of type ${currentNode[0][1]}`)
		}

		if (a instanceof Exact) {
			currentNode[2] = a.tree // any modifications onward to a outside of this function will reflect here
		} else {
			currentNode[2] = a
		}

		return this // for chaining
	}

	sub(a) {
		/*
		 * a: number|Fraction|Surd|Exact
		 */
		var currentNode = this.currentNode // cache result to prevent unnecessary loops
		if (currentNode[0][1] === 1) {
			// is a leaf node, change it to an operand
			currentNode[1][0] = currentNode[0]
			currentNode[0] = Exact.TreeObject("-", 2)
		} else {
			console.warn(`[warn]: unimplemented, currentNode is of type ${currentNode[0][1]}`)
		}

		if (a instanceof Exact) {
			currentNode[2] = a.tree // any modifications onward to a outside of this function will reflect here
		} else {
			currentNode[2] = a
		}

		return this // for chaining
	}

	div(a) {
		/*
		 * divides the entire Exact by a
		 * a: number|Fraction|Surd|Exact
		 */
		var opNode = Exact.TreeObject("/", 2)
		var newTree = [opNode, this.tree]

		if (a instanceof Exact) {
			newTree.push(a.tree)
			this.val = this.val /a.val
		} else {
			newTree.push(a)

			if (typeof a === "number") {
				this.val = this.val /a
			} else {
				// either Fraction or Surd
				this.val = this.val /a.val
			}
		}

		this.tree = newTree

		return this // for chaining
	}
}

class Polynomial {
	/* domains enum */
	static domain = {
		'ZZ': 1, // integers
		'RR': 2 // real numbers
	}

	constructor(coefficients, domain=Polynomial.domain.RR) {
		/*
		 * generate a polynomial object based on coefficients: arr
		 * coefficients[0] represents the constant whereas the last element of coefficients represents the leading coefficient (i.e. coefficient of the highest power)
		 * coefficients: (number|Fraction)[], can be either numbers or fractions
		 */
		this.domain = domain

		this.isUnivariate = true
		this.indeterminant = "x"

		this.coefficients = coefficients
		this.degree = this.coefficients.length -1

		// convert this.coefficients
		this._normaliseInDomain()

		// special properties
		var triggered = false
		for (let r of this.coefficients) {
			if (this.domain === Polynomial.domain.ZZ) {
				if (r !== 0) {
					triggered = !triggered
					if (triggered === false) {
						break // triggered twice, there exists two terms in this polynomial object
					}
				}
			} else if (this.domain === Polynomial.domain.RR) {
				if (r.val !== 0) {
					triggered = !triggered
					if (triggered === false) {
						break // triggered twice, there exists two terms in this polynomial object
					}
				}
			}
		}
		this.isMonoTerm = triggered // triggered will only take the value of true once when it encounters a non-zero coefficient, otherwise will default back to false on the second hit
	}

	_normaliseInDomain() {
		/*
		 * reads this.domain
		 * if this polynomial exists in the domain.ZZ (integers), the elements will be rounded down
		 * elseif this polynomial exists in the domain.RR (real numbers), the elements will be converted to the fraction object
		 */
		if (this.domain === Polynomial.domain.ZZ) {
			// integers, round down everything
			this.coefficients = this.coefficients.map(r => {
				if (r instanceof Fraction) {
					return Math.floor(r.a /r.b)
				} else {
					return Math.floor(r)
				}
			})
		} else if (this.domain === Polynomial.domain.RR) {
			// real numbers, convert all elements to instances of the fraction object
			// unable to convert existing float to their rational counterparts (i.e. fractions)
			this.coefficients = this.coefficients.map(r => {
				if (r instanceof Fraction) {
					return r
				} else {
					return new Fraction(Math.floor(r))
				}
			})
		}
	}

	getAdditionIdentity() {
		// returns 0 depending on the domain
		if (this.domain === Polynomial.domain.ZZ) {
			return 0
		} else if (this.domain === Polynomial.domain.RR) {
			return new Fraction(0)
		}
	}

	update(coefficients) {
		// updates the coefficients stored in this.coefficients, namely by overwriting the variable
		// also recalculates the degree again

		this.coefficients = coefficients
		this.degree = this.coefficients.length -1

		// conver this.coefficients
		this._normaliseInDomain()

		return this // to chain
	}

	sylvesterMatrix(Poly) {
		// generates a sylvester matrix from this and Poly object
		// let f be this
		// let g be poly
		var n = this.degree
		var m = Poly.degree

		var space = m +n
		var matrix = new Matrix(space, space, 0) // square matrix

		// iterate over f first
		for (let i = 0; i < m; i++) {
			for (let d = 0; d <= n; d++) {
				matrix.data[i][i +d] = this.coefficients[n -d]
			}
		}

		// iterate over g now
		for (let j = 0; j < n; j++) {
			for (let d = 0; d <= m; d++) {
				matrix.data[j +m][j +d] = Poly.coefficients[m -d]
			}
		}

		return matrix
	}

	supremumNorm() {
		// returns the supremum norm (maximum norm)
		// ||f||infinity

		// >>> f = 3x^2+5x−2
		// 5

		return Math.max(this.coefficients.map(c => Math.abs(c instanceof Fraction ? c.val : c)))
	}

	isEmpty(useMultiplicativeIdentity=false) {
		// useMultiplicativeIdentity: boolean, when true, uses the multiplicative identity in the ring/field
		// else false, uses the additive identity
		// returns true when polynomial object is empty
		// else returns false
		return Math.max(this.coefficients.map(c => Math.abs(c))) === (useMultiplicativeIdentity ? 1 : 0)
	}

	addPoly(Poly) {
		// f = a0 + a1x + a2x2 + a3x3...
		// g = b0 + b1x + b2x2 + b3x3
		// returns a new polynomial object such that,
		// r = (a0+b0) + (a1+b1)x + (a2+b2)x2
		// with f being this, g being Poly
		var h = Math.max(this.degree, Poly.degree)
		var coefficients = Array(h +1).fill(0)
		for (let i = 0; i <= h; i++) {
			var a = coefficients[i]
			if (i <= this.degree) {
				a = this.coefficients[i]
			}

			var b = coefficients[i]
			if (i <= Poly.degree) {
				b = Poly.coefficients[i]
			}

			if (this.domain === Polynomial.domain.ZZ) {
				coefficients[i] = a +b
			} else if (this.domain === Polynomial.domain.RR) {
				// fraction instances
				coefficients[i] = a.add(b)
			}
		}

		// remove redundant higher powers
		if (coefficients[h] === 0) {
			for (let j = h; j >= 0; j--) {
				if ((this.domain === Polynomial.domain.ZZ && coefficients[j] === 0) || (this.domain === Polynomial.domain.RR && coefficients[j].a === 0)) {
					coefficients.pop() // remove
				} else {
					// no more, is the highest term
					break
				}
			}
		}

		return new Polynomial(coefficients, this.domain)
	}

	subtractPoly(Poly) {
		// f = a0 + a1x + a2x2 + a3x3...
		// g = b0 + b1x + b2x2 + b3x3
		// returns a new polynomial object such that,
		// r = (a0-b0) + (a1-b1)x + (a2-b2)x2
		// with f being this, g being Poly
		var h = Math.max(this.degree, Poly.degree)
		var coefficients = Array(h +1).fill(0)
		for (let i = 0; i <= h; i++) {
			var a = coefficients[i]
			if (i <= this.degree) {
				a = this.coefficients[i]
			}

			var b = coefficients[i]
			if (i <= Poly.degree) {
				b = Poly.coefficients[i]
			}

			if (this.domain === Polynomial.domain.ZZ) {
				coefficients[i] = a -b
			} else if (this.domain === Polynomial.domain.RR) {
				// fraction instances
				coefficients[i] = a.sub(b)
			}
		}

		// remove redundant higher powers
		if (coefficients[h] === 0) {
			for (let j = h; j >= 0; j--) {
				if ((this.domain === Polynomial.domain.ZZ && coefficients[j] === 0) || (this.domain === Polynomial.domain.RR && coefficients[j].a === 0)) {
					coefficients.pop() // remove
				} else {
					// no more, is the highest term
					break
				}
			}
		}

		return new Polynomial(coefficients, this.domain)
	}

	multiplyConstant(constant) {
		// f = a0 + a1x + a2x2 + a3x3...
		// returns a new polynomial object such that
		// q = (a0*constant) + (a1*constant)x + (a2*constant)x2 + (a3*constant)x3
		var ret = new Polynomial(
			this.coefficients.map(c => {
				if (this.domain === Polynomial.domain.ZZ) {
					return c *constant
				} else if (this.domain === Polynomial.domain.RR) {
					return constant.multByConstant(c)
				}
			}),
			this.domain
		)

		console.log(constant, `* ${this.buildRepr()}`)
		console.log("=", ret.buildRepr())
		return ret
	}

	multiplyPoly(Poly, cfOnly=false) {
		// f = a0 + a1x + a2x2 + a3x3...
		// g = b0 + b1x + b2x2 + b3x3
		// returns a new polynomial object such that,
		// q = d0 + d1x + d2x2 + d3x3...,
		// where di = Σ(n=0, i)[a_n *b_(i-n)]
		// if cfOnly is true, returns the coeffArr only, instead of a new polynomial object
		console.log(`${this.buildRepr()} * ${Poly.buildRepr()}`)
		if (Poly.degree === 0) {
			// treat it as a constant
			return this.multiplyConstant(Poly.coefficients[0])
		}
		var deg = this.degree +Poly.degree // highest degree
		var coefficients = Array(deg +1).fill(this.getAdditionIdentity())

		for (let i = 0; i < deg; i++) {
		// generate the coefficient for the i-th term
			coefficients[i] = this.getAdditionIdentity() // initialise value
			for (let j = 0; j <= i; j++) {
				var a = this.coefficients[j]
				if (a == null) {
					a = this.getAdditionIdentity() // there does not exist a term with power (j) in this
				}

				var b = Poly.coefficients[i -j]
				if (b == null) {
					b = this.getAdditionIdentity() // there does not exist a term with power (i -j) in Poly
				}

				if (this.domain === Polynomial.domain.ZZ) {
					coefficients[i] += a *b
				} else if (this.domain === Polynomial.domain.RR) {
					coefficients[i] = coefficients[i].add(a.mult(b))
				}
			}
		}

		// generate coefficient for the highest term by taking the product of both leading coefficients
		if (this.domain === Polynomial.domain.ZZ) {
			coefficients[deg] = this.coefficients[this.degree] *Poly.coefficients[Poly.degree]
		} else if (this.domain === Polynomial.domain.RR) {
			coefficients[deg] = this.coefficients[this.degree].mult(Poly.coefficients[Poly.degree])
		}
		console.log("=", new Polynomial(coefficients).buildRepr())

		if (cfOnly) {
			return coefficients
		}

		return new Polynomial(coefficients, this.domain)
	}

	lc() {
		// returns the leading coefficient of this polynomial
		// i.e. coefficient of the highest degree
		// >>> 3x^3 + 2x^2 + 10x + 30
		// 3
		return this.coefficients[this.degree]
	}

	euclidDivision(Poly, cfOnly=false) {
		// divides this (f) by Poly (g), i.e. f/g
		// returns [quo, rem]
		// when cfOnly is true, returns the coefficient array only
		var g = Poly
		var r = this // initial reminder
		var qcf = [] // stores the coefficients of the quotient, with 0th index representing the constant term, and 2nd index representing the coefficient for the square term, etc
		console.log(`${this.buildRepr()}/${Poly.buildRepr()}`)
		while (r.degree >= g.degree) {
			var lcd = r.lc() /g.lc() // leading coefficient divisor
			var deg = r.degree -g.degree

			// store coefficient to qcf
			qcf[deg] = lcd

			// construct new factor to multiply g (divisor) by
			var factor = Array(deg +1).fill(0)
			factor[deg] = lcd

			// compute new remainder
			r = r.subtractPoly(g.multiplyPoly(new Polynomial(factor)))
		}

		console.log(`=${new Polynomial(qcf).buildRepr()}${Poly.buildRepr()} + ${r.buildRepr()}`)
		if (cfOnly) {
			return [qcf, r.coefficients]
		} else {
			return [new Polynomial(qcf, this.domain), r]
		}
	}

	modPoly(Poly, cfOnly=false) {
		// returns this mod f, where f is a polynomial of random degree (Poly)
		// when cfOnly is true, returns the coefficient array only
		console.log(this.buildRepr(), "mod", Poly.buildRepr(), "cfOnly", cfOnly)
		if (this.degree < Poly.degree) {
			var cf = this.coefficients.map(cf => cf) // shallow map
			console.log(`= ${this.buildRepr()} mod ${Poly.buildRepr()}`)
			if (cfOnly) {
				return cf
			}

			return new Polynomial(cf)
		}

		var [_, r] = this.euclidDivision(Poly, cfOnly)
		console.log(`= ${r} mod ${Poly.buildRepr()}`)
		return r
	}

	prem(Poly) {
		// returns the pseudo remainder of f and g
		// f = this
		// g = Poly

		// create a new polynomial object to store lc(g)^(deg(f) -deg(g) +1)
		// to be multiplied into f
		var factor = Array(this.degree -Poly.degree +1).fill(0)
		factor[this.degree -Poly.degree +1] = Poly.lc()

		var [_, rem] = (this.multiplyPoly(new Polynomial(factor))).euclidDivision(Poly)
		return rem
	}

	prs_gcd(Poly) {
		// returns the greatest common divisor between f and g
		// f = this
		// g = Poly
		// implements subresultant pseudo-remainder sequence
		var f = this
		var g = Poly
		var r = [f, g] // sequences

		var i = 1
		var B = []
		var P = []
		while (!r[i].isEmpty(false)) {
			var d = r[i -1].degree -r[i].degree
			var y = r[i].lc()

			if (i === 1) {
				B.push((-1)**(r[0].degree -r[1].degree +1))
				P.push(-1)
			} else {
				// i >= 2
				P.push(((-r[i -1].lc())**(r[i -2].degree -r[i -1].degree))/(P[i -2] **((r[i-2].degree -r[i -1].degree)-1)))
				B.push((-1)*(P[i -2]*(P[i -1])**(d)))
			}

			var [quo, rem] = r[i -1].multiplyConstant(y**(d+1)).euclidDivision(r[i])
			console.log("BIG STEP, B", B, JSON.stringify(rem.coefficients))
			r.push(rem.multiplyConstant(1 /B[i -1]))
			console.log("POST MULT", r[i +1].coefficients)

			i++; // increment
		}

		// prim(ab) = prim(a) *prim(b) : Gauss's lemma
		// gcd(prim(a), prim(b)) = prim(gcd(a, b))
		return r[r.length -2].primitive() // last element is a zero polynomial
	}

	content() {
		// returns the content of the polynomial
		// i.e. gcd of all the coefficients
		// >>> 3x^2 + 9x + 9, 9x^2 + 27
		// 3

		// special case, only exists a constant term
		if (this.degree === 0) {
			return this.coefficients[0]
		}

		var gcd
		if (this.domain === Polynomial.domain.ZZ) {
			gcd = EuclidTools.gcd(this.coefficients[0], this.coefficients[1])
			for (let i = 2; i <= this.degree; i++) {
				gcd = EuclidTools.gcd(gcd, this.coefficients[i])
			}
		} else if (this.domain === Polynomial.domain.RR) {
			gcd = Fraction.gcd(this.coefficients[0], this.coefficients[1])
			console.log("STEP 1", gcd)
			for (let i = 2; i <= this.degree; i++) {
				gcd = Fraction.gcd(gcd, this.coefficients[i])
			}
		}

		return gcd
	}

	primitive(precalculatedContent=null) {
		// returns the primitive part of the polynomial
		// >>> 3x^2 + 6x + 9
		// x^2 + 2x + 3

		// special case, only exists a constant term
		if (this.degree === 0) {
			return new Polynomial(this.coefficients) // return copy
		}

		// find gcd of all the coefficients (degree >= 1)
		var gcd = precalculatedContent
		if (precalculatedContent == null) {
			gcd = this.content();
			console.log("GCD CALC RETURNED", gcd)
		}

		if ((this.domain === Polynomial.domain.ZZ && gcd !== 1) || (this.domain === Polynomial.domain.RR && gcd.val !== 1)) {
			// there exists a primitive part of 'this' polynomial
			console.log("GCD FOUND", gcd, precalculatedContent, this.coefficients)
			if (this.domain === Polynomial.domain.ZZ) {
				return this.multiplyConstant(1 /gcd)
			} else if (this.domain === Polynomial.domain.RR) {
				return this.multiplyConstant(new Fraction(gcd.b, gcd.a)) // flip the gcd (rational expressed in a fraction object)
			}
		} else {
			return new Polynomial(this.coefficients.map(c => c)) // return itself (copy)
		}
	}

	yun_sqf() {
		// returns the square free part of the polynomial
		// implements Yun's algorithm with D. Musser modifications
		// >>> x^3 - 5x^2 + 8x - 4 (equiv to (x-1)(x-2)^2)
		// x^2 - 3x + 1 (equiv to (x-1)(x-2))
		//
		// explanation:
		// x^3 - 5x^2 + 8x - 4 = (x-1)(x-2)^2
		// x^2 - 3x + 1 = (x-1)(x-2)
		var g = [this.prs_gcd(this.derivative())]
		if (g[0].isEmpty(true)) {
			// g = gcd(f, f') == 1
			// f is squarefree if it is not divisible by the square of any non-constant polynomial over F
			return new Polynomial(f.coefficients)
		}

		var h = [this.euclidDivision(g[0])[0]] // store the quotient part
		var i = 0 // zero-based index
		while (!g[i].isEmpty(true)) {
			h.push(g[i].prs_gcd(h[i]))
			g.push(g[i].euclidDivision(h[i +1])[0]) // quotient only
			console.log("STEP", g, i)
			i++
		}

		return h
	}

	_factorise() {
		// carries from Yun's algorithm from square free part
		var sqf = this.yun_sqf()
		console.log("SQUARE FREE OUTPUT", sqf)
		var m = [] // monic polynomials to be computed

		for (let i = 1; i < sqf.length; i++) {
			m.push(sqf[i -1].euclidDivision(sqf[i])[0]) // quotient with no remainder
		}

		m.push(sqf[sqf.length -1]) // last element divided by the empty polynomial 1

		return m
	}

	plug(v) {
		/*
		 * returns the value of f(v), where f is a polynomial
		 */
		if (this.domain === Polynomial.domain.RR && !(v instanceof Fraction)) {
			// v has to be a fraction
			v = new Fraction(v)
		}

		var sum = this.coefficients[0] // return value (initialise with constant term)
		for (let i = 1; i <= this.degree; i++) {
			if (this.domain === Polynomial.domain.ZZ) {
				sum += this.coefficients[i] *(v **i) // coefficient*v^i
			} else if (this.domain === Polynomial.domain.RR) {
				sum = sum.add(this.coefficients[i].mult(v.power(i)))
			}
		}

		return sum
	}

	square(cfOnly=false) {
		// returns f(x)^2 where f is a polynomial stored in 'this'
		// if cfOnly is true, returns the coeffArr only, instead of a new polynomial object
		console.log(`${this.buildRepr()}^2`)

		return this.multiplyPoly(this, cfOnly) // multiply by itself
	}

	repModPoly(deg) {
		// returns x^deg mod f, where f is a polynomial stored in 'this'
		// calculate square mod f
		var skeleton = new Polynomial([0, 1]) // to call .update(coeffArr) when coefficients have changed; to be used for operation methods
		var m = skeleton.modPoly(this, true) // x mod f, true to return coeffArr only

		var l = Math.floor(Math.log2(deg)) +1 // amount of bits required to store degree from base 10 to base 2
		console.log("STEP", m, l, skeleton)
		for (let i = 0; i < l -1; i++) {
			// (l -i -1) should never reach zero as it approaches zero (integer domain)
			// otherwise there would be an additional square operation (i.e. target is 110001 base 2, we would get 1100010 base 2)
			var b = deg & (1 << (l -i -2)) // bit stored at i-th position, starting from left-most bit
			console.log(`b: ${b}, ${deg} & ${1 << (l -i -2)}, ${l-i-2}`)

			// square the previous modulo first
			console.log("\n\nPRE SQUARING", skeleton.coefficients)
			m = skeleton.update(m).square().modPoly(this, true)
			console.log("POST SQUARING", m)

			if (b !== 0) {
				// bit was a 1 (b will be 2^(l -i -1))
				// multiply by x (degree 1), original term
				// therefore, raise degree by 1
				m.push(m[m.length -1]) // push leading coefficient one degree up
				if (this.domain === Polynomial.domain.ZZ) {
					m[m.length -2] = 0 // reset the previous leading coefficient to 0
				} else if (this.domain === Polynomial.domain.RR) {
					m[m.length -2] = new Fraction(0)
				}

				// calculate modulo
				console.log("\n\nRAISING DEGREE")
				m = skeleton.update(m).modPoly(this, true)
				console.log("POLY MOD RETURNS", m)
				skeleton.update(m)
			}
		}

		return m
	}

	ddFactorisation() {
		// factors polynomial with the distinct degree factorisation algorithm
		// with repeated squaring implemented for the calculate x^M mod f

	}

	roots() {
		/*
		 * finds the roots up to the third power
		 * when this polynomial has coefficients in the ZZ domain, no exact representation will be returned
		 * when this polynomial has coefficients in the RR domain, exact representations will be returned, i.e. values will be wrapped in Exact instances which wraps Surd instances
		 */
		if (this.degree === 2) {
			var a = this.coefficients[2]
			var b = this.coefficients[1]
			var c = this.coefficients[0]
			if (this.domain === Polynomial.domain.ZZ) {
				var discriminant = (b **2) -(4 *a *c)

				if (discriminant >= 0) {
					discriminant = Math.sqrt(discriminant)
					return [(-b-discriminant) /(2 *a), (-b+discriminant) /(2 *a)]
				}
			} else if (this.domain === Polynomial.domain.RR) {
				var discriminant = (b.power(2)).sub(a.mult(c).multByConstant(4))

				if (discriminant.val >= 0) {
					discriminant = new Surd(discriminant, 2) // discriminant: Fraction -> Surd

					var leftRoot = new Exact(b.multByConstant(-1))
					leftRoot.sub(discriminant).div(a.multByConstant(2))

					var rightRoot = new Exact(b.multByConstant(-1))
					rightRoot.add(discriminant).div(a.multByConstant(2))

					return [leftRoot, rightRoot]
				}
			}
		} else if (this.degree === 3) {
			return
		}
	}

	simpleFactorisation() {
		// factors polynomial up to degree 3
		// implements rational root theorem
		if (this.degree <= 1) {
			// constant or linear term
			// factor primitive part
			return [[this.content()], this.primitive()]
		} else if (this.degree === 2) {
			// find both roots, factor in the form (x-a)(x-b), where a and b are roots
			// take into account when leading coeff is not 0
		}
	}

	revert() {
		// returns a new Polynomial that is of reverted form
		// f -> f*
		// >>> 5x^3 + 3x^2 + 10x + 6
		// 6x^3 + 10x^2 + 3x + 5
		return new Polynomial(this.coefficients.toReversed())
	}

	// gcd(Poly) {
	// 	// returns the greatest common divisor between this and Poly object
	// 	// using the modular GCD algorithm
	// 	// f: this, g: Poly
	// 	var n = Math.max(this.degree, Poly.degree)

	// 	var lcf = this.coefficients[this.degree]
	// 	var lcg = Poly.coefficients[Poly.degree]
	// 	var b
	// 	var A, B
	// 	if (this.domain === Polynomial.domain.ZZ) {
	// 		b = EuclidTools.gcd(lcf, lcg)

	// 		A = Math.max(this.supremumNorm, Poly.supremumNorm)
	// 		B = ((n + 1)**(1/2)) *(2**n) *(A*b)
	// 	} else if (this.domain === Polynomial.domain.RR) {
	// 		b = Fraction.gcd(lcf, lcg)

	// 		var sn1 = this.supremumNorm, sn2 = Poly.supremumNorm
	// 		A = sn1 ? sn1 > sn2 // fraction objects
	// 		B = A.mult(b).multByConstant(((n + 1)**(1/2)) *(2**n))
	// 	}

	// 	// choose a random prime
	// 	var lowerLim = 2*B
	// 	var upperLim = 4*B
	// 	var sieve = EuclidTools.buildSieve(4*B +1) // build a sieve for reference
	// 	for (let i = 2*B; i <= 4*B; i++) {
	// 		if (sieve[i] === true) {
	// 			// is a prime
	// 			var p = i
	// 		}
	// 	}
	// 	var p = EuclidTools.sieveOfEratosthenes(2*B)
	// }

	derivative() {
		// returns the derivative of this polynomial
		// >>> 3x^2 + 12x + 5
		// 6x + 12
		var coefficients = []
		for (let i = 0; i < this.degree; i++) {
			// construct a new coefficient array
			if (this.domain === Polynomial.domain.ZZ) {
				coefficients.push(this.coefficients[i +1] *(i +1))
			} else if (this.domain === Polynomial.domain.RR) {
				coefficients.push(this.coefficients[i +1].multByConstant(i +1))
			}
		}

		return new Polynomial(coefficients)
	}

	raiseToPower(i) {
		// raises this to power i
		// i.e. returns f(x)^i
		// uses repeated squaring to minimise squaring operations
		var l = Math.floor(Math.log2(i)) +1
		var g = this

		for (let j = 0; j < l -1; j++) {
			g = g.square()
			if ((i & (1 << (l -j -2))) !== 0) {
				// has a bit, multiply by itself
				g = g.multiplyPoly(this)
			}
		}

		console.log(`\n .: ${this.buildRepr()}^${i}\n= ${g.buildRepr()}`)
		return g
	}

	substitute(Poly) {
		// substitutes determinant in this for Poly
		// i.e. function decomposition
		// h = f o g
		// returns h, where f = this, g = Poly
		var h = new Polynomial(Array(this.degree *Poly.degree +2).fill(0))
		h.coefficients[0] = this.coefficients[0]

		// skip the constant
		for (let i = 1; i <= this.degree; i++) {
			if (this.coefficients[i] == 0 || (this.domain === Polynomial.domain.RR && this.coefficients[i].val === 0)) {
				// nothing to substitute in here, big optimisation instead of having to calculate the square of Poly for every iteration of degree this
				continue;
			}

			// use repeated squaring to raise g to the power of i
			var p = Poly.raiseToPower(i)

			for (let j = 0; j <= p.degree; j++) {
				if (this.domain === Polynomial.domain.ZZ && Poly.domain === Polynomial.domain.ZZ) {
					// both exists in ZZ
					h.coefficients[j] += this.coefficients[i] *p.coefficients[j] // multiply by coefficient of term in f (this)
				} else if (this.domain === Polynomial.domain.RR || Poly.domain === Polynomial.domain.RR) {
					// either exists in RR
					var actor = this.domain === Polynomial.domain.RR ? this.coefficients[i] : p.coefficients[j]
					var extra = this.domain === Polynomial.domain.ZZ ? this.coefficients[i] : p.coefficients[j]
					if (this.domain === Polynomial.domain.RR && Poly.domain === Polynomial.domain.RR) {
						// both exists in RR
						console.log("NIHAO", i, j, h.coefficients, this.buildRepr(), this.degree, p.buildRepr(), p.degree, Poly.buildRepr(), Poly.degree)
						h.coefficients[j] = h.coefficients[j].add(this.coefficients[i].mult(p.coefficients[j]))
					} else {
						h.coefficients[j] = h.coefficients[j].add(actor.multByConstant(extra))
					}
				}
			}
		}

		return h
	}

	dChainRule(Poly, returnExpandedForm=true) {
		// differentiates h(x) = this(Poly(x)) with respect to x
		// h = f o g
		// h'(x) = f'(g(x))*g'(x)
		// returnExpandedForm: boolean, will return fully expanded form if returnExpandedForm is true
		console.log("[CHAINING]:", this.buildRepr(), Poly.buildRepr())
		if (returnExpandedForm) {
			return this.derivative().substitute(Poly).multiplyPoly(Poly.derivative())
		} else {
			// return in the form f'(g(x))*g'(x), without expanding

			if (this.isMonoTerm) {
				// only consists of one term, e.g. x^4
				return `${this.degree}${Poly.buildRepr()}^{${this.degree -1}}${Poly.derivative().buildRepr()}`
			}

			var fPrime = this.derivative().substitute(Poly)
			var gPrime = Poly.derivative()

			// factor out the content
			var content = 1
			// var content = fPrime.content()
			// if (content !== 1) {
			// 	fPrime = fPrime.primitive(content) // supply the content value to prevent redundant calculations
			// }

			// var gPrimeContent = gPrime.content()
			// if (gPrimeContent !== 1) {
			// 	content *= gPrimeContent
			// 	gPrime = Poly.primitive(gPrimeContent)	
			// }

			if (content === 1) {
				// no factorisation
				return `${fPrime.buildRepr()}${gPrime.buildRepr()}`
			} else {
				return `${content}${fPrime.buildRepr()}${gPrime.buildRepr()}`
			}
		}
	}

	dProductRule(Poly) {
		// differentiates h(x) = this(x)*Poly(x) with respect to x
		// h = f * g
		// h'(x) = f(x)*g'(x) + g(x)*f'(x)
		return this.multiplyPoly(Poly.derivative()).addPoly(Poly.multiplyPoly(this.derivative()))
	}

	dQuotientRule(Poly) {
		// differentiates h(x) = this(x) /Poly(x) with respect to x
		// h(x) = this(x) /Poly(x)
		// h'(x) = (g(x)*f'(x) - f(x)*g'(x)) /(g(x)^2)

		return [Poly.multiplyPoly(this.derivative()).subtractPoly(this.multiplyPoly(Poly.derivative())), Poly.square()]
	}

	buildRepr() {
		// returns the standardised form of the polynomial in a string format
		// >>> new Polynomial([3, -2, 4])
		// 4x^2 - 2x^2 + 3
		var r = "("
		for (let i = this.degree; i >= 0; i--) {
			var coeff = this.coefficients[i]

			var prefix = "", coeffRepr = ""

			if (this.domain === Polynomial.domain.ZZ) {
				// integers only
				if (coeff === 0) {
					// empty term

					continue
				}

				if (i >= 1 && coeff === 1) {
					// can omit coefficient
					coeffRepr = ""
				} else if (i >= 1 && coeff === -1) {
					// can also omit
					coeffRepr = "-"
				}

				if (r.length >= 2 && coeff > 0) {
					prefix = "+"
				}

				r += `${prefix}${coeffRepr}`
			} else if (this.domain === Polynomial.domain.RR) {
				// coefficients are fractions object
				if (coeff.a === 0) {
					// empty term

					continue
				}

				coeffRepr = coeff.repr() // fraction object
				if (r.length >= 2 && coeffRepr[0] !== "-") { // r.length >= 2 to be true only when there are already terms since there is one character during initialisation of r, i.e. '('
					// coefficient object, prefix to take plus sign
					prefix = "+"
				}

				if (i >= 1 && Math.abs(coeff.val) === 1) {
					// omit coefficient
					coeffRepr = coeff.val < 0 ? "-" : ""
				}

				r += `${prefix}${coeffRepr}`
			}

			if (i >= 1) {
				r += `${this.indeterminant}`
			}
			if (i >= 2) {
				r += `^{${i}}` // exponent
			}
		}

		return r +")"
	}
}

class ASTTree {
	constructor() {
		// node structure: []
		// where index 0: array containing type and value of node
		// index 1: stores the reference to the left leaf node
		// index 2: stores the reference to the right leaf node
		this.globalId = 0 // gives each node a 'port' number (refer to this._newNode() definition on usage)

		this.tree = this._newNode(); // template
		this.currentNode = this.tree
		this.treeCurrentPath = []; // absolute path from root (value of 0 represents descended to left leaf, where as value of 1 means right leave node)

		this.operations = new ASTTreeOperations(this)
	}

	_newNode(parentNode=null) {
		var parentIdentifier = 0; // root identifier, think of node identifiers as port numbers where each node has 2 port numbers, one for in and another for out
		// identifiers are stored in the data portion of the node, occupying the 0 and 1st index, 0 representing the parent port number and 1st representing the node's own connection number
		// the node's own connection number will be referenced as its leaves' parent identifier (0th index of leaf nodes)
		if (parentNode != null) {
			parentIdentifier = parentNode[0][1]
		}

		console.log("GIVEN IDENTIFIERS", parentNode, parentIdentifier, this.globalId)
		return [[parentIdentifier, this.globalId++]]; // index 0: array containing type (index 0) and value (index 1)
	}

	_bondNodes(parentNode, a, b) {
		// a: left node (either leaf or branch)
		// b: right node (either leaf or branch)
		// changes the first port number of leaf nodes to match the id of parentNode (last port number)
		// will NOT affect children's relation with descendents
		a[0][0] = parentNode[0][1];
		if (b != null) {
			b[0][0] = parentNode[0][1];
		} 
	}

	_getCurrentNode() {
		// returns the node based off from this.treeCurrentPath
		var selection = this.tree
		for (let i = 0; i < this.treeCurrentPath.length; i++) {
			selection = selection[1 +this.treeCurrentPath[i]];
		}

		return selection
	}

	_getCurrentParentNode() {
		// probablity of caching: equality comparison between cached path directory and current path directory
		var selection = this.tree
		for (let i = 0; i < this.treeCurrentPath.length -1; i++) {
			selection = selection[1 +this.treeCurrentPath[i]]
		}

		console.log("PARENT NODE", selection)
		return selection
	}

	ascendNode() {
		// moves up the hierarchy
		if (this.treeCurrentPath.length >= 1) {
			this.treeCurrentPath.pop()
			this.currentNode = this._getCurrentNode()
		} else {
			console.log("CANNOT ASCEND, AT THE ROOT")
		}
	}

	addLeftNode(setToCurrent=false) {
		var node = this._newNode(this._getCurrentParentNode()); // create a new node
		this.currentNode[1] = node

		if (setToCurrent) {
			this.currentNode = node
			this.treeCurrentPath.push(0) // 0 to represent left leave node
		}

		return node;
	}

	addRightNode(setToCurrent=false) {
		var node = this._newNode(this._getCurrentParentNode()); // create a new node
		this.currentNode[2] = node

		if (setToCurrent) {
			this.currentNode = node
			this.treeCurrentPath.push(1) // 1 to represent right leave node
		}

		return node;
	}
}

class ASTTreeOperations {
	constructor(astTree) {
		this.tree = astTree // stores the tree object here
	}

	raiseNodeToPower(leafNode, powerNode) {
		// leafNode: leaf node to raise power to
		// powerNode: a node (either leaf or branch) to raise leafNode to
		// raises leafNode to power
		// [WARNING]: will directly modifiy the leafNode to an exponent operation

		// instantiate the base node (x^2, base referring to 'x')
		var baseNode = this.tree._newNode(leafNode)
		baseNode[0][2] = leafNode[0][2]; // value of node
		baseNode[0][3] = leafNode[0][3]; // type of node

		// overwrite leaf node to take the exponent operation
		leafNode[0][2] = "^";
		leafNode[0][3] = 2

		// attach new children to leaf node (perform overwrite, let any existing children be collected by GC)
		leafNode[1] = baseNode
		leafNode[2] = powerNode

		// repair parent-child hierarchy (bond)
		this.tree._bondNodes(leafNode, powerNode)
	}

	isAlgebraicTerm(branch) {
		// returns true if branch is represents an algebraic term, which contains a coefficient, also returns the base and coefficient
		// return false if branch does not represent an algebraic term
		// algebraic term: 2 <- * -> x (represents 2x)
		// root node has to be an multiplication operator
		// either branches must contain a number (coeff) and the other containing the algebraic base
		// operand nodes have no leaves (hence branch structure should be relatively simple)
		if (branch[0][3] !== 2 && branch[0][2] !== "*") {
			// branch is not a multiplication operation node
			return false
		} else if (branch.length !== 3) {
			// has no operands, should not occur as operation node MUST have 2 leaf nodes
			return false
		}

		console.log("[TESTING]:", branch)
		if (branch[1][0][3] === 0 && branch[2][0][3] === 1) {
			return true
		} else if (branch[2][0][3] === 0 && branch[1][0][3] === 1) {
			return true
		}

		return false
	}

	eqComparison(a, b, strict=false) {
		// compares node branches a & b, returns true if they are identical of types and structure
		// if strict is true, will compare number values too, else would just simply ensure type matches
		// postorder traversal

		var eqSub;
		if (a.length === 3 && b.length === 3) {
			// both have children

			// left branch first
			var eqLeft = this.eqComparison(a[1], b[1], strict)

			if (eqLeft) {
				// right branch
				eqSub = this.eqComparison(a[2], b[2], strict)
			} else {
				return false
			}
		} else if (a.length !== b.length) {
			// unsimilar structure
			return false
		} else if (a.length === 1 && b.length === 1) {
			// just operand nodes, compare similarity, no recursion to go deeper (no leaf nodes lol)
			if (strict) {
				return a[0][2] === b[0][2]
			} else {
				// numbers (just need to match type), algebraic variables need to match content
				return a[0][3] === b[0][3] && (a[0][3] === 0 || a[0][2] === b[0][2])
			}
			return ((a[0][3] === b[0][3]) && (a[0][3] === 0 || (a[0][2] === b[0][2])))
		} else {
			// no more branches to go
		}

		if (eqSub) {
			if (a[0][3] === b[0][3]) {
				if ((a[0][3] >= 1) || strict) {
					// variable (1) and operations (2) OR compare numbers too
					if (a[0][2] != b[0][2]) {
						// not the same base
						return false
					} else {
						return true
					}
				} else {
					// numbers, not strict
					return true
				}
			}
		} else {
			return false
		}
	}

	consistsOfConstants(node) {
		// returns true if the entire branch (subtree) contains of only constants and no algebraic bases
		// will ignore operation nodes, hence only looks at the leaf nodes
		// post-order traversal method
		if (node.length === 3) {
			var lPure = this.consistsOfConstants(node[1])
			if (!lPure) {
				// false value returned
				return false
			} else {
				// go right branch
				return this.consistsOfConstants(node[1])
			}
		} else {
			// is a leaf node, inspect node type
			return node[0][3] !== 1
		}
	}

	getCommonFactor(a, b) {
		// returns the common factor between branch a and b
	}

	lawOfIndices(exponentOpNode, baseNode) {
		// on multiplication of same bases, addition of exponents
		var exponentNode = exponentOpNode[2] // right leaf

		// creete a new exponent node with addition where left branch will represent the current exponent node, and right will represent the new base node
		// i.e. x^(3x + 1)
		var node = this.tree._newNode()
		node[0][2] = "+" // set value
		node[0][3] = 2 // set type

		// create new branches
		node[1] = exponentNode
		node[2] = baseNode

		// overwrite exponentNode
		exponentOpNode[2] = node
	}

	chainAddition(opNode, leftOperandNode) {
		// opNode: operation node WITH 2 children
		// leftOperandNode: node containing factor to merge into opNode's branch
		// will look for the same term within opNode's branch and merge it in
		// [WARNING]: will directly modify the opNode's branch
		// returns true when same term is fond
		// returns false if no same terms found => no nodes affected within branch
		// both opNode and leftOperandNode should be direct siblings of a multiplication binary operation node on the base call (recursive function)
		// addition: assosciative, commutative
		var a = opNode[1]; // opNode (operation node) SHOULD have 2 children
		var b = opNode[2]

		if (leftOperandNode[0][3] === 0) {
			// factor is a number, just find a children that is a number
			if (a[0][3] === 0 || b[0][3] === 0) {
				// found matching (should not be both are matching since it would have been simplified since post-order traversal goes through the leaf nodes first)
				var affectedNode = a[0][3] === 0 ? a : b
				affectedNode[0][2] += leftOperandNode[0][2]; // directly apply
				return true
			}
		} else if (leftOperandNode[0][3] === 1) {
			// should only have these 2 cases
			if (a[0][3] === 1 && a[0][2] === leftOperandNode[0][2]) {
				// same base, change this node to a multiplication node
				a[0][2] = "*" // value
				a[0][3] = 2 // type

				var coeffNode = this.tree._newNode()
				coeffNode[0][2] = 2 // value
				coeffNode[0][3] = 0 // type

				var baseNode = this.tree._newNode()
				baseNode[0][2] = leftOperandNode[0][2] // value
				baseNode[0][3] = 1 // type

				a[1] = coeffNode
				a[2] = baseNode

				return true
			} else if (b[0][3] === 1 && b[0][2] === leftOperandNode[0][2]) {
				// same base, change this node to a multiplication node
				b[0][2] = "*" // value
				b[0][3] = 2 // type

				var coeffNode = this.tree._newNode()
				coeffNode[0][2] = 2 // value
				coeffNode[0][3] = 0 // type

				var baseNode = this.tree._newNode()
				baseNode[0][2] = leftOperandNode[0][2] // value
				baseNode[0][3] = 1 // type

				b[1] = coeffNode
				b[2] = baseNode

				return true
			}
		}

		// no return values yet
		console.log("[NEGATIVE]:", leftOperandNode, a, b, this.isAlgebraicTerm(a))
		if (a[0][3] === 2 && a[0][2] === "+") {
			// chain chainMultiplication
			return this.chainMultiplication(a, leftOperandNode);
		} else if (b[0][3] === 2 && b[0][2] === "+") {
			return this.chainMultiplication(b, leftOperandNode);
		} else if (leftOperandNode[0][3] === 1 && this.isAlgebraicTerm(a)) {
			// base with coefficient (a is guaranteed to have a coefficient node (type 0) and a base node (type 1))
			if (a[1][0][3] === 1 && a[1][0][2] === leftOperandNode[0][2]) {
				// same base, get coefficient
				a[2][0][2] += 1 // add 1 to coefficient
				return true
			} else if (a[2][0][3] === 1 && a[2][0][2] === leftOperandNode[0][2]) {
				// right branch is the base
				a[1][0][2] += 1 // left branch is the coefficient
				return true
			}
		} else if (leftOperandNode[0][3] === 1 && this.isAlgebraicTerm(b)) {
			// base with coefficient
			console.log("MASSIVE HIT")
			if (b[1][0][3] === 1 && b[1][0][2] === leftOperandNode[0][2]) {
				// same base, get coefficient
				b[2][0][2] += 1 // add 1 to coefficient
				return true
			} else if (b[2][0][3] === 1 && b[2][0][2] === leftOperandNode[0][2]) {
				// right branch is the base
				b[1][0][2] += 1 // left branch is the coefficient
				return true
			}
		} else {
			// no more chaining
			return false
		}
	}

	iter(branch, cbFn) {
		// iterates through each operand
		if (branch.length === 3) {
			// call left side first
			this.iter(branch[1], cbFn)
			this.iter(branch[2], cbFn)
		}

		// post-order traversal
		cbFn(branch)
	}

	multiplyNode(branch, node) {
		// will factor in node into branch
		// will modify branch directly
		// node should be a simple operand node, not a multiplication node
		// branch and node should only be direct siblings at MOST, never ancestors/descendents or parent/child 
		// returns true if managed to factor in node
		console.log("HIT", branch)
		console.log("NODE", node)
		if (branch.length !== 3) {
			return false
		} else if (branch[0][3] === 2 && branch[0][2] === "^") {
			// exponent operation, see if base matches
			console.log("EXPONENT")
			if (branch[1][0][3] === node[0][3]) {
				// compare exponent base
				if (branch[1][0][2] === node[0][2]) {
					// same branch algebraic base
					var addNode = this.tree._newNode()
					addNode[0][2] = 1 // value
					addNode[0][3] = 0 // type
					this.lawOfIndices(branch, addNode)
					return true
				} else if (this.eqComparison(branch[1], node)) {
					// equal, increment exponent portion
					var addNode = this.tree._newNode()
					addNode[0][2] = 1 // value
					addNode[0][3] = 0 // type
					this.lawOfIndices(branch, addNode)
					return true
				}
			}

			if (node[0][3] === 2 && node[0][2] === "^") {
				// we are looking for more exponents, do not give up
				console.log("DONT GIVE UP")
			} else {
				// give up, no more recursion on exponent nodes since node is a simple node
				return false
			}
		}

		// iterate through children
		console.log("CHILDREN")
		for (let i = 1; i < 3; i++) {
			console.log("BRANCH[I]", branch[i])
			if (node[0][3] === 2 && node[0][2] === "^") {
				// look for similar bases (base part of the exponents)
				console.log("EXPONENT BASE", node[1], branch[i], this.eqComparison(node[1], branch[i]))
				if (this.eqComparison(node[1], branch[i])) {
					// convert branch to an exponent
					console.log("CREATING EXPONENTS")
					var expOpNode = this.tree._newNode()
					expOpNode[0][2] = "^" // value
					expOpNode[0][3] = 2 // type

					expOpNode[1] = node[1] // base part
					expOpNode[2] = node[2] // exponent part

					// add 1 to exponent part
					var addNode = this.tree._newNode()
					addNode[0][2] = 1 // value
					addNode[0][3] = 0 // type
					this.lawOfIndices(expOpNode, addNode)

					// modify branch (i.e. factor node into branch)
					branch[i][0] = expOpNode[0]
					branch[i][1] = expOpNode[1]
					branch[i][2] = expOpNode[2]

					console.log("FINAL", branch[i], branch[i][2])

					return true
				} else {
					// don't return yet, got one more iteration to try
				}
			} else if (branch[i][0][3] === 0 || branch[i][0][3] === 1) {
				// branch leaf node is a number/algebraic base
				if (node[0][3] <= 1 && node[0][3] === branch[i][0][3]) {
					// same node type (numbers/algebraic value)
					if (node[0][3] === 0) {
						// numbers
						branch[i][0][2] *= node[0][2] // rewrite value, type remains the same
						return true
					} else if (node[0][3] === 1 && node[0][2] === branch[i][0][2]) {
						// same algebraic value
						// raise it to a power
						if (branch[0][3] === 2 && branch[0][2] === "^") {
							// already has a power
							var addNode = this.tree._newNode()
							addNode[0][2] = 1 // value
							addNode[0][3] = 0 // type
							this.lawOfIndices(branch, addNode)

							return true
						}

						// simple value
						branch[i][0][3] = 2 // type
						branch[i][0][2] = "^" // value

						branch[i][1] = this.tree._newNode()
						branch[i][2] = this.tree._newNode()

						// exponent node
						branch[i][1][0][2] = node[0][2] // write base
						branch[i][1][0][3] = 1 // type

						// coefficient node
						branch[i][2][0][2] = 2 // value
						branch[i][2][0][3] = 0

						return true
					}
				}
			}
		}

		// didnt find a matching operand, look at possibilities of leaf nodes being operations
		var a = branch[1]
		var b = branch[2]
		var lSuccess = false;
		if (a[0][3] === 2 && a[0][2] === "*") {
			lSuccess = this.multiplyNode(a, node)
		} else if (a[0][3] === 2 && a[0][2] === "^" && node[0][3] != "^") {
			lSuccess = this.multiplyNode(a, node)
		}

		if (lSuccess) {
			return true // found, factored in
		} else {
			// continue on right branch
			if (b[0][3] === 2 && b[0][2] === "*") {
				return this.multiplyNode(b, node)
			} else if (b[0][3] === 2 && b[0][2] === "^" && node[0][3] != "^") {
				return this.multiplyNode(b, node)
			}
		}
	}

	_copyNode(node) {
		// returns a copy of the node
		var r = this.tree._newNode()
		r[0][2] = node[0][2]
		r[0][3] = node[0][3]

		if (node.length === 3) {
			r[1] = node[1]
			r[2] = node[2]
		}

		return r
	}

	addNode(branch, node) {
		// will factor in node into branch
		// will modify branch directly
		// node should be a simple operand node, not a multiplication node
		// branch and node should only be direct siblings at MOST, never ancestors/descendents or parent/child 
		// returns true if managed to factor in node
		console.log("A HIT", branch)
		console.log("NODE", node)
		if (branch.length !== 3) {
			return false
		}

		// iterate through children
		console.log("CHILDREN")
		for (let i = 1; i < 3; i++) {
			console.log("BRANCH[I]", branch[i])
			if (branch[i][0][3] === 2 && branch[i][0][2] === "^" && node[0][3] === 2 && node[0][2] === "^") {
				// look for similar bases (base part of the exponents)
				console.log("EXPONENT BASE", node[1], branch[i], this.eqComparison(node[1], branch[i]))
				if (this.eqComparison(node, branch[i])) {
					// both are exponent nodes, multiply them by 2
					console.log("CREATING MULTIPLICATION")
					var multOpNode = this.tree._newNode()
					multOpNode[0][2] = "*" // value
					multOpNode[0][3] = 2 // type

					var twoNode = this.tree._newNode()
					twoNode[0][2] = 2 // value
					twoNode[0][3] = 0 // type

					multOpNode[1] = node // the entire exponent
					multOpNode[2] = twoNode // multiplied by 2

					// modify branch (i.e. factor node into branch)
					branch[i][0] = multOpNode[0]
					branch[i][1] = multOpNode[1]
					branch[i][2] = multOpNode[2]

					console.log("FINAL", branch[i], branch[i][2])

					return true
				} else {
					// don't return yet, got one more iteration to try
				}
			} else if (branch[i][0][3] === 0 || branch[i][0][3] === 1) {
				// branch leaf node is a number/algebraic base
				if (node[0][3] <= 1 && node[0][3] === branch[i][0][3]) {
					// same node type (numbers/algebraic value)
					if (node[0][3] === 0) {
						// numbers
						branch[i][0][2] += node[0][2] // rewrite value, type remains the same
						return true
					} else if (node[0][3] === 1 && node[0][2] === branch[i][0][2]) {
						// same algebraic value
						// multiply it by 2
						if (branch[0][3] === 2 && branch[0][2] === "*") {
							// already has a coefficient
							var coeffNode = branch[3 -i] // alternate branch
							if (coeffNode[0][3] === 0) {
								coeffNode[0][2] += 1 // simply add one
							} else {
								// change it to an addition node
								var additionOpNode = this.tree._newNode()
								additionOpNode[0][2] = "+" // value
								additionOpNode[0][3] = 2 // type

								var additionNode = this.tree._newNode()
								additionNode[0][2] = 1 // value
								additionNode[0][3] = 0 // type

								var newCoeff = this.tree._copyNode(coeffNode)

								coeffNode[0] = additionOpNode[0]
								coeffNode[1] = newCoeff
								coeffNode[2] = additionNode
							}

							return true
						}

						// simple value, multiply by 2
						branch[i][0][3] = 2 // type
						branch[i][0][2] = "*" // value

						branch[i][1] = this.tree._newNode()
						branch[i][2] = node

						// coefficient node
						branch[i][1][0][2] = 2 // value
						branch[i][1][0][3] = 0 // type

						return true
					}
				}
			}
		}

		// didnt find a matching operand, look at possibilities of leaf nodes being operations
		var a = branch[1]
		var b = branch[2]
		var lSuccess = false;
		if (a[0][3] === 2 && a[0][2] === "+") {
			lSuccess = this.addNode(a, node)
		} else if (a[0][3] === 2 && a[0][2] === "^" && node[0][2] === 2 && node[0][3] === "^") {
			lSuccess = this.addNode(a, node)
		}

		if (lSuccess) {
			return true // found, factored in
		} else {
			// continue on right branch
			if (b[0][3] === 2 && b[0][2] === "*") {
				return this.addNode(b, node)
			} else if (b[0][3] === 2 && b[0][2] === "^" && node[0][2] === 2 && node[0][3] === "^") {
				return this.addNode(b, node)
			}
		}
	}

	deepAddition(node) {
		// addition logic
		// node is an operation node
		// tree is iterated in a post-order traversal method

		// both a and b are leaf nodes of the addition operation node
		// shift b branch over to a, find common factors if possible
		var a = node[1]
		var b = node[2]

		if (a[0][3] === 0 && b[0][3] === 0) {
			// both are numbers
			node[0][2] = a[0][2] +b[0][2] // write value
			node[0][3] = 0 // rewrite type

			// remove references to a and b
			node.pop()
			node.pop()
		} else if ((a[0][3] === 2 && a[0][2] === "+" && b[0][3] <= 1) ||
			(b[0][3] === 2 && b[0][2] === "+" && a[0][3] <= 1)) {
			// one operation, one operand
			var operationNode = a[0][3] === 2 ? a : b
			var operandNode = a[0][3] === 2 ? b : a

			var success = this.addNode(operationNode, operandNode)
			if (success) {
				// operand is a redundant node now
				node[0] = operationNode[0]
				node[1] = operationNode[1]
				node[2] = operationNode[2]
			}
		} else if (a[0][3] === 2 && a[0][2] === "^" && b[0][3] === 2 && b[0][2] === "^") {
			// both are exponents, compare the same bases
			if (this.eqComparison(a, b)) {
				// can merge, change them a multiply node
				node[0][2] = "*" // value
				node[0][3] = 2 // type

				// right branch can remain the same, change left branch to a multiplication node of 2
				node[1] = this.tree._newNode()
				node[1][0][2] = 2 // value
				node[1][0][3] = 0 // type
			}
		} else if ((a[0][3] === 2 && a[0][3] === "*") || (b[0][3] === 2 && b[0][3] === "*")) {
			// theres a multiplication node present
			// constant coefficient throws off the equality comparisons
		}
	}

	deepMultiply(node) {
		// multiply logic
		// node is an operation node

		// both a and b are leaf nodes of a multiplication node
		// shift b branch over to a, find common factors if possible
		var a = node[1]
		var b = node[2]
		if ((a[0][3] === 0) && (b[0][3] === 0)) {
			// both are numbers
			node[0][2] = a[0][2] *b[0][2]
			node[0][3] = 0 // type

			// remove references to a and b
			node.pop()
			node.pop()
		} else if (a[0][3] === 1 && b[0][3] === 1 && a[0][2] === b[0][2]) {
			// same bases, can raise to exponents
			node[0][2] = "^" // rewrite value, type remains the same

			// change b to a value of 2 and number type (x*x = x^2)
			b[0][2] = 2 // value
			b[0][3] = 0 // type
		} else if ((a[0][3] === 2 && a[0][2] === "*" && b[0][3] <= 1) ||
			(b[0][3] === 2 && b[0][2] === "*" && a[0][3] <= 1)) {
			// one operand, one multiplication operation
			var operationNode = a[0][3] === 2 ? a : b
			var operandNode = a[0][3] === 2 ? b : a

			var success = this.multiplyNode(operationNode, operandNode)
			if (success) {
				node[0] = operationNode[0]
				node[1] = operationNodez[1]
				node[2] = operationNode[2]
			}
		} else if ((a[0][3] === 2 && a[0][2] === "^" && b[0][3] <= 1) ||
			(b[0][3] === 2 && b[0][2] === "^" && a[0][3] <= 1)) {
			// one operand, one exponent operation
			var operationNode = a[0][3] === 2 ? a : b
			var operandNode = a[0][3] === 2 ? b : a

			var success = this.multiplyNode(operationNode, operandNode)
			console.log("exp MASSIVE HIT", success)
			if (success) {
				node[0] = operationNode[0]
				node[1] = operationNode[1]
				node[2] = operationNode[2]
			}
		} else if (a[0][3] === 2 && a[0][2] === "*" && b[0][3] === 2 && b[0][2] === "*") {
			// both are multiplication operations
			// move b branch into a
			console.log("BOTH ARE APPLICATIONS")
			this.iter(b, childrenNode => {
				console.log("roller", childrenNode)
				if (childrenNode.length === 3) {
					// is an operation (contains two operands - leaf nodes)
					if (childrenNode[0][3] === 2 && childrenNode[0][2] === "*") {
						// is a multiplication, can chain
						if (childrenNode[1][0][3] <= 1 || (childrenNode[1][0][3] === 2 && childrenNode[1][0][2] === "^")) {
							// operand (number OR algebraic base, NOT AN OPERATION)
							var success = this.multiplyNode(a, childrenNode[1])
							console.log("FACTORING IN", success, 1)
							if (!success) {
								// factor in childrenNode[1] manually
								var newNode = this.tree._newNode()
								newNode[0][2] = "*" // value
								newNode[0][3] = 2 // type

								newNode[1] = a
								newNode[2] = childrenNode[1]
								node[1] = newNode // replace left branch
							}
						}
						if (childrenNode[2][0][3] <= 1 || (childrenNode[2][0][3] === 2 && childrenNode[2][0][2] === "^")) {
							var success = this.multiplyNode(a, childrenNode[2])
							console.log("FACTORING IN", success, 2)
							if (!success) {
								// factor in childrenNode[2] manually
								var newNode = this.tree._newNode()
								newNode[0][2] = "*" // value
								newNode[0][3] = 2 // type

								newNode[1] = a
								newNode[2] = childrenNode[2]
								node[2] = newNode // replace right branch
							}
						} else if (childrenNode[2][0][3] === 2 && childrenNode[2][0][2] === "^") {
							var success = this.multiplyNode(a, childrenNode[2]) // works with exponents nodes too
							console.log("E FACTORING IN", success, 2)
							if (!success) {
								// factor in childrenNode[2] manually
							}
						}
					}
				}
			})

			// discard b branch
			node[0] = a[0]
			node[1] = a[1]
			node[2] = a[2]
		} else if (a[0][3] === 2 && a[0][2] === "+" && b[0][3] === 2 && b[0][2] === "+") {
			// both are additions

		} else {
			console.log("UNCAPTURED?", a, b)
		}
	}
}

class TokenStreamer {
	constructor() {
		this.contents = []

		this.currentTokenType = null
		this.currentTokenValue = null
	}

	hasToken() {
		// returns whether there is current tokens being built
		return this.currentTokenType != null
	}

	set type(type) {
		this.currentTokenType = type
	}

	get type() {
		return this.currentTokenType
	}

	set value(val) {
		// concatenate to current value
		if (this.currentTokenValue == null) {
			this.currentTokenValue = val
		} else {
			this.currentTokenValue += val
		}
	}

	get value() {
		return this.currentTokenValue
	}

	next() {
		// move on to the next token
		if (this.currentTokenType != null && this.currentTokenValue) {
			if (this.currentTokenType === 0) {
				// number
				this.currentTokenValue = parseFloat(this.currentTokenValue);
			}

			// stream
			this.contents.push([this.currentTokenType, this.currentTokenValue]);

			// reset references
			this.currentTokenType = null
			this.currentTokenValue = null
		}
	}
}

class AlgebraicExpr {
	static operations = ["+", "*", "-", "/", "^"]
	static functionDeclaration = ["sin", "cos", "tan", "asin", "acos", "atan", "ln", "lg"]
	static coefficientValueRegex = /[.\d]/
	static polynomialDeterminantRegex = /[a-zA-Z]/

	constructor(raw) {
		this.raw = raw // store the raw representation here
	}

	tokenise() {
		this.tokens = new TokenStreamer()

		for (let i = 0; i < this.raw.length; i++) {
			if (this.raw[i] === " ") {
				// empty string
				continue;
			}

			// reference character
			var char = this.raw[i];
			console.log("\nI:", char)

			if (this.tokens.hasToken()) {
				// check for numbers, variables
				console.log("token present, type:", this.tokens.type)
				if (AlgebraicExpr.coefficientValueRegex.test(char)) {
					// number
					if (this.tokens.type === 0) {
						// of similar type
						this.tokens.value = char
						console.log("building similar type")
					} else if (this.tokens.type === 1) {
						// this makes no sense to have a number precede a base
						continue
					}

					continue; // move on to the next character
				} else if (AlgebraicExpr.polynomialDeterminantRegex.test(char)) {
					// base
					if (this.tokens.type === 0) {
						// number preceeded by a base (coefficient)
						// push the number first, and add an asterisk operation to split up the coefficient and the base
						this.tokens.next()
						console.log("INTERMITTENT PUSH", this.tokens.contents)

						// asterisk concat
						this.tokens.type = 2
						this.tokens.value = "*"
						this.tokens.next()
						console.log("PUSHED", this.tokens.contents)

						this.tokens.type = 1
					}

					this.tokens.value = char

					continue; // move on to the next character
				} else {
					this.tokens.next(); // build next token
				}
			}

			// determine token type (predictive?)
			// no tokens currently being built
			if (AlgebraicExpr.operations.includes(this.raw[i])) {
				// binary operation (type 2)
				this.tokens.type = 2
				this.tokens.value = this.raw[i]
				this.tokens.next()
			} else if (this.raw[i] == "(") {
				// open parenthesis (type 3)
				this.tokens.type = 3
				this.tokens.value = char
				this.tokens.next()
			} else if (this.raw[i] == ")") {
				// close parenthesis (type 4)
				this.tokens.type = 4
				this.tokens.value = char
				this.tokens.next()
			} else {
				// token to be 'streamed'
				if (AlgebraicExpr.coefficientValueRegex.test(char)) {
					// is a number (part of a decimal)
					this.tokens.type = 0
					this.tokens.value = char
					console.log("building value", this.tokens.value)
				} else if (AlgebraicExpr.polynomialDeterminantRegex.test(char)) {
					// is a variable ('x', 'y')
					this.tokens.type = 1 // 1 for base
					this.tokens.value = char
				}
			}
		}

		if (this.tokens.hasToken()) {
			// push last token
			this.tokens.next();
		}

		return this // to chain
	}

	treelise() {
		// generates the AST tree based on this.tokens
		if (this.tokens == null) {
			// not tokenised yet
			return false
		}

		// generate nodes
		this.tree = new ASTTree()
		console.log("INIT", this.tree)

		var idx = 0;
		for (const token of this.tokens.contents) {
			console.log("\n", idx, token)
			if (token[0] === 3) {
				// '(', add new left node, and descend to that node
				console.log("pre-creation", this.tree.currentNode, JSON.stringify(this.tree.tree))
				var node = this.tree.addLeftNode(true)
				console.log("post-creation", this.tree.currentNode, JSON.stringify(this.tree.tree))
			} else if (token[0] === 2) {
				// operators, set value of current node to operation, create new right node and descend to it
				this.tree.currentNode[0][2] = token[1]
				this.tree.currentNode[0][3] = token[0] // type of node (either operand or operation)
				console.log("pre-descend", this.tree.currentNode, JSON.stringify(this.tree.tree))
				this.tree.addRightNode(true)
				console.log("added right leaf node", this.tree.currentNode)
			} else if (token[0] === 0 || token[0] === 1) {
				// either number or variable value, set current node's value to number/variable and ascend once
				this.tree.currentNode[0][2] = token[1]
				this.tree.currentNode[0][3] = token[0] // type of node (either operand or operation)
				console.log("post ascension", this.tree.currentNode, JSON.stringify(this.tree.tree))
				this.tree.ascendNode()
				console.log("ascending node", this.tree.currentNode, JSON.stringify(this.tree.tree))
			} else if (token[0] == 4) {
				// ')', ascend to parent node
				this.tree.ascendNode()
			}

			idx++
		}

		return this; // to chain
	}

	_simplifyHeap(nodeBranch) {
		// recursive function called by .simplify()
		// works with each branch
		// post order traversal algorithm

		console.log('\nKNOCKING', nodeBranch)
		if (nodeBranch.length === 1) {
			// no leaf nodes => no operands
			return
		}

		if (nodeBranch[1] != null) {
			// left leaf node exists (left first)
			this._simplifyHeap(nodeBranch[1])
			console.log("POST LEFT")
		}

		if (nodeBranch[2] != null) {
			// right leaf node exists
			this._simplifyHeap(nodeBranch[2])
			console.log("POST RIGHT")
		}

		var a = nodeBranch[1]
		var b = nodeBranch[2]

		console.log('VISITING', nodeBranch)
		console.log("SIMPLIFYING", a, b)
		if (nodeBranch[0][3] === 2 && nodeBranch[0][2] === "*") {
			// multiply
			this.tree.operations.deepMultiply(nodeBranch)
		} else if (nodeBranch[0][3] === 2 && nodeBranch[0][2] === "") {
			// addition
			if (a[0][3] === 0) {
				if (b[0][3] === 0) {
					// both are numbers
					// trim away the leaf nodes, rewrite nodeBranch value as result
					console.log("MERGED")
					nodeBranch[0][2] = a[0][2] +b[0][2]; // rewrite value
					nodeBranch[0][3] = 0; // rewrite node type

					// trim away leaves
					nodeBranch.pop();
					nodeBranch.pop();

					return
				}
			} else if (a[0][3] === 1) {
				if (b[0][3] === 1) {
					// both are bases
					if (a[0][2] === b[0][2]) {
						// same variable, change root node to a multiplication operation
						nodeBranch[0][2] = "*" // type will remain as 2 (for operation)

						// replace left branch
						var coeffNode = this.tree._newNode()
						coeffNode[0][2] = 2 // value (b + b = 2 * b)
						coeffNode[0][3] = 0 // type

						// since left branch was an operand, it has no leaf nodes
						nodeBranch[1] = coeffNode // simply replace node
						return
					}
				}
			}

			// no return yet
			if (a[0][3] === 2 && a[0][2] === "+" && b[0][3] <= 1) {
				// a is an operation, b is an operand (NOT AN OPERATION)
				console.log("A HIT AS ADDITION")
				var success = this.tree.operations.chainAddition(a, b)
				if (success) {
					// can replace nodeBranch with a branch (operation node)
					// since b (operand node) is redundant (already factored into a branch)
					nodeBranch[0] = a[0]
					nodeBranch[1] = a[1]
					nodeBranch[2] = a[2]
				}
			} else if (b[0][3] === 2 && b[0][2] === "+" && a[0][3] <= 1) {
				// b is an operation, a is an operand (NOT AN OPERATION)
				console.log("B HIT AS ADDITION")
				var success = this.tree.operations.chainAddition(b, a)
				if (success) {
					// can replace nodeBranch with b branch (operation node)
					// since a (operand node) is redundant (already factored into b branch)
					nodeBranch[0] = b[0]
					nodeBranch[1] = b[1]
					nodeBranch[2] = b[2]
				}
			} else if (a[0][3] === 1 && b[0][3] === 2 && this.tree.operations.isAlgebraicTerm(b)) {
				// a is an algebraic value, b is a multiplication node, AND b is also a branch representing an algebraic term
				// b is guaranteed to be an multiplication node with a number coefficient value and an algebraic term
				if (b[1][0][3] === 1 && a[0][2] === b[1][0][2]) {
					// same term here, b's left leaf node represents the base
					// right leaf node represents the coefficient
					b[2][0][2] += 1
				} else if (b[2][0][3] === 1 && a[0][2] === b[2][0][2]) {
					// b's right leaf node represents the base, left leaf node represents the coefficient
					b[1][0][2] += 1
				} else {
					return
				}

				// nodeBranch to be replaced to b
				nodeBranch[0] = b[0]
				nodeBranch[1] = b[1]
				nodeBranch[2] = b[2]
			} else if (b[0][3] === 1 && a[0][3] === 2 && this.tree.operations.isAlgebraicTerm(a)) {
				// b is an algebraic value, a is a multiplication node, AND a is also a branch representing an algebraic term
				// a is guaranteed to be an multiplication node with a number coefficient value and an algebraic term
				console.log("B HIT AS EEG")
				if (a[1][0][3] === 1 && b[0][2] === a[1][0][2]) {
					// same term here, a's left leaf node represents the base
					// right leaf node represents the coefficient
					a[2][0][2] += 1
				} else if (a[2][0][3] === 1 && b[0][2] === a[2][0][2]) {
					// a's right leaf node represents the base, left leaf node represents the coefficient
					a[1][0][2] += 1
				} else {
					return
				}

				// nodeBranch to be replaced to b
				nodeBranch[0] = a[0]
				nodeBranch[1] = a[1]
				nodeBranch[2] = a[2]
			} else if (a[0][3] === 2 && a[0][2] === "*" && b[0][3] === 2 && b[0][2] === "*") {
				// both leaf nodes are multiplication operations
				// multiplication should have occurred to simplify it (post-order traversal)
				// compare bases, see if they are similar
				if (this.tree.operations.isAlgebraicTerm(a) && this.tree.operations.isAlgebraicTerm(b)) {
					// extract the algebraic base from both sides
					var base = a[1][0][2] // assume left leaf node of A branch is the base
					var coeff = a[2][0][2] // assume right leaf node of A branch is the coeff
					if (a[2][0][3] === 1) {
						base = a[2][0][2]
						coeff = a[1][0][2]
					}

					// determine if b has the same base
					// if so, increment B branch's coefficient and discard A branch
					if (b[1][0][3] === 1 && base === b[1][0][2]) {
						// same base, increment coefficient of B branch
						// b's right node contains the coeff
						b[2][0][2] += coeff
					} else if (b[2][0][3] === 1 && base === b[2][0][2]) {
						// same base, increment coefficient of B branch
						// b's left node contains the coeff
						b[1][0][2] += coeff
					} else {
						return // not the same base
					}

					// discard A branch, keep A branch
					nodeBranch[0] = b[0]
					nodeBranch[1] = b[1]
					nodeBranch[2] = b[2]
				}
			}
		} else if (nodeBranch[0][3] === 2 && nodeBranch[0][2] === "+") {
			// addition
			this.tree.operations.deepAddition(nodeBranch)
		}
	}

	simplify() {
		// works with the AST tree generated
		console.log("\n\nSIMPLIFIYING")
		this._simplifyHeap(this.tree.tree)

		return this
	}

	normalise() {
		// removes '-' operations by changing them into '+'
		this.tree.operations.iter(this.tree.tree, node => {
			if (node[0][3] === 2 && node[0][2] === "-") {
				if (node[2][0][3] === 0) {
					// right branch is a constant, can convert
					node[0][2] = "+" // change sign
					node[2][0][2] *= -1 // convert polarity
				}
			}
		})

		return this // chaining purposes
	}

	buildRepr(node=null) {
		// returns the representation from this.tree
		// pre-order traversal method
		if (node == null) {
			node = this.tree.tree
		}

		var r = ""
		if (node[0][3] === 2) {
			// operation, get the two operands
			if (node[0][2] != "*") {
				// can omit asterisk if both operands are algebraic terms (with coefficients and base)
				r = node[0][2]
			}
			r = this.buildRepr(node[1]) +r // left operand
			r += this.buildRepr(node[2]) // right operand

			r = `(${r})`
		} else if (node[0][3] === 0 || node[0][3] === 1) {
			// numbers or variables
			// no need to call itself on the leaves (as it has none)
			return node[0][2]
		}

		return r
	}

	getCoeffs() {
		// generates the polynomial object from an AST tree
		// AST tree must be the expanded form, i.e. 3x^5 + 2x^4 + 2x^3 + x^2 + 4x + 8
		// returns the array of coefficients assuming algebraic expression is a polynomial in the simplified and expanded form
		// the 0 index of the return array represents the coefficient to the power of 0, and likewise for 2nd index (square term), etc
		// calculate degree
		var deg = 0 // base level
		this.tree.operations.iter(this.tree.tree, node => {
			if (node[0][3] === 2 && node[0][2] === "^") {
				var a = node[1]
				var b = node[2]

				var powerNode = a[0][3] === 0 ? a : b
				if (powerNode[0][2] > deg) {
					deg = powerNode[0][2]
				}
			}
		})

		// fill coefficient array
		var coefficients = Array(deg +1).fill(0) // default values of 0
		coefficients[0] = 0 // 0th index representing the constnat, 2nd index representing the coefficient for the square term, etc

		// validate ast tree and populate coefficients array
		var root = this.tree.tree
		if (root[0][3] === 2) {
			// either multiplication or +/-
			if (root[0][2] === "*") {
				// simple iteration
				// get coefficient
				var [coefficient, base, power] = this.getCoefficientFromBranch(root)
				if (coefficient) {
					coefficients[power] = coefficient
				} else {
					// not valid
					throw new Error(`${JSON.stringify(root)} is not valid for constructing a polynomial in the standard form`)
				}
			} else if (root[0][2] === "+" || root[0][2] === "-") {
				// look at direct child nodes
				this.extractPolynomialTermFromBranch(root, coefficients)
			}
		} else if (root[0][3] <= 1) {
			// since type numbers (0) and algebraic values (1)
			// 0 would write into constant
			// 1 would write into x^1
			coefficients[root[0][3]] = 1
		}

		return coefficients
	}

	getCoefficientFromBranch(node) {
		// helper util tool during instantiation of Polynomial object
		// node is a multiplication node, will return [coefficient, base, power]
		if (node[0][3] === 2 && node[0][2] === "*") {
			// simple iteration
			// get coefficient
			var coeffNode = node[1][0][3] === 0 ? node[1] : node[2]
			var baseNode = node[1][0][3] === 0 ? node[2] : node[1]

			if (baseNode[0][3] === 2 && baseNode[0][2] === "^") {
				// exponent
				var [base, power] = this.extractPowerFromBranch(baseNode)
				return [coeffNode[0][2], base, power]
			} else if (baseNode[0][3] === 1) {
				// algebraic base, power 1
				return [coeffNode[0][2], baseNode[0][2], 1]
			} else {
				// not valid
				return
			}
		}
	}

	extractPowerFromBranch(node) {
		// returns [base, power] of the exponent node
		// returns nothing if not otherwise
		// node should have already been verified that it is an exponent node
		if (node[0][3] === 2 && node[0][2] === "^") {
			var base = node[1][0][3] === 1 ? node[1] : node[2]
			var power = node[1][0][3] === 1 ? node[2] : node[1]
			return [base[0][2], power[0][2]]
		}
	}

	extractPolynomialTermFromBranch(root, coeffArr) {
		// root is a addition/subtraction operation node
		for (let i = 1; i < 3; i++) {
			var polarity = i === 2 ? (root[0][2] === "+" ? 1 : -1) : 1 // subtraction only applies to right operand
			var child = root[i]

			if (child[0][3] === 2 && child[0][2] === "*") {
				// coefficient
				var [coefficient, base, power] = this.getCoefficientFromBranch(child)
				if (coefficient) {
					coeffArr[power] = coefficient *polarity // take into account of subtraction operation
				} else {
					throw new Error(`${JSON.stringify(child)} is not valid for constructing a polynomial in the standard form`)
				}
			} else if (child[0][3] === 2 && child[0][2] === "^") {
				// coefficient is 1 (or -1 if polarity === -1)
				var [base, power] = this.extractPowerFromBranch(child)
				if (base) {
					coeffArr[power] = polarity
				} else {
					throw new Error(`${JSON.stringify(child)} is not valid for constructing a polynomial in the standard form`)
				}
			} else if (child[0][3] === 2 && (child[0][2] === "+" || child[0][2] === "-")) {
				// treat child as 'root' in the next recursive call
				this.extractPolynomialTermFromBranch(child, coeffArr)
			} else if (child[0][3] === 1) {
				// power 1 base
				coeffArr[1] = polarity
			} else if (child[0][3] === 0) {
				// constant
				coeffArr[0] = child[0][2] *polarity
			}
		}
	}
}

// var c = "((((3*(x^4)) + (2*(x^3))) + x) + 3)"
// var expr = new AlgebraicExpr(c).tokenise().treelise()
// console.log(expr.tokens.contents, expr.tree, JSON.stringify(expr.tree.tree))
// // expr.simplify();
// console.log(expr.buildRepr(), JSON.stringify(expr.tree.tree))

// var f = "(((x^2) - (4x)) + 3)"
// var poly = new Polynomial(new AlgebraicExpr(f).tokenise().treelise().normalise().tree)

// var f = "(((x^2) - (3x)) + 2)"
// var g = "(((3*(x^2)) + (5x)) - 2)"
// // var g = "(x-2)"
// var c = "(x-1)"
// var d = "(((3*(x^2)) + (6x)) + 9)"
// // var f = "(((((3*(x^4)) + (3*(x^3))) + (x^2)) -x) - 2)"
// var f = "((((x^3) - (5*(x^2))) + (8x)) - 4)" // x^3 - 5 x^2 + 8 x - 4
// var fpoly = new AlgebraicExpr(f).tokenise().treelise().normalise()
// var gpoly = new AlgebraicExpr(g).tokenise().treelise().normalise()
// var cpoly = new AlgebraicExpr(c).tokenise().treelise().normalise()
// var dpoly = new AlgebraicExpr(d).tokenise().treelise().normalise()
// var poly = new Polynomial([-4, 0, 1])
// var poly2 = new Polynomial([-2, 5, 3])
// // var poly3 = new Polynomial(cpoly.getCoeffs())
// var poly4 = new Polynomial(dpoly.getCoeffs())
// console.log("\n\n\nRUNNING")
// console.log(poly2.multiplyPoly(poly3))
// var rem = poly.euclidDivision(poly2)
// var [q, r] = rem
// console.log("\n\n\nFINAL:", rem)
// console.log("REM", poly.buildRepr(), poly2.buildRepr(), q.buildRepr(), r.isEmpty())
// const sv = poly.sylvesterMatrix(poly2)
// console.log(JSON.stringify(sv.data, null, 4), sv.getDeterminant())
// var gcd = poly.prs_gcd(poly2)
// console.log("\n\n\n\nOUTPUT:\n", gcd)

// console.log("VALID")
// var sqf = poly.nprs_gcd(poly.derivative())
// console.log("\n\nintermediate output:", sqf)
// sqf = poly.euclidDivision(sqf)
// console.log("TESTING", poly.buildRepr())
// var sqf = poly.prs_gcd(poly.derivative())
// console.log("\n\n\n\n\nOUTPUT:\n", sqf)

// var poly = new Polynomial([-1, 0, 1])
// console.log("FACTORISATION", poly.simpleFactorisation())

// var poly = new Polynomial([1, 5])
// var spoly = new Polynomial([-4, 3])
// var npoly = poly.dQuotientRule(spoly)
// console.log("FINAL OUTPUT:", npoly)

module.exports = {
	Polynomial,
	Fraction
}