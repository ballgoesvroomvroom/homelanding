class ArraySort {
	static quickSort = function(arr, s, e) {
		// in place sorting algo
		if (s < e) {
			// valid call

			// choose pivot
			var pivot = arr[e]

			// partition
			let i = s -1; // pointer to point at element where it marks the parition (greater elements)
			for (let j = s; j < e; j++) {
				if (arr[j] < pivot) {
					i++ // increment pointer

					// swap elements (using stray variables is much faster than destructuring assignment)
					var b = arr[j]
					arr[j] = arr[i]
					arr[i] = b
				}
			}

			// swap pivot for pointer (the next element, to properly section the data) stored at i
			var b = arr[e]
			arr[e] = arr[i +1]
			arr[i +1] = b

			// quick sort the two partitions
			ArraySort.quickSort(arr, s, i)
			ArraySort.quickSort(arr, i +2, e) // plus 2 to exclude pivot element
		}
	}
}

class BaseQuestion {
	static getCommonBase = function(a, b) {
		// get quotient, should have no remainder, if remainder present, not a perfect root
		var a = Math.min(a, b) // a should represent the smaller value
		var b = Math.max(a, b) // b should represent the bigger value
		var diff = b /a
		if (diff -math.floor(diff) > 0) {
			return; // return null
		}

		print(diff)
		if (Math.abs(diff -a) <= .00001) {
			return a // base
		} else {
			return BaseQuestion.getCommonBase(a, diff) // order does not matter
		}
	}

	static getDeterminant = function(m) {
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

			determinant += factor *BaseQuestion.getDeterminant(dm) *(toggle ? -1 : 1)
			toggle = !toggle; // toggle value
		}

		return determinant;
	}
}

class ParserError extends Error {
	name = "ParserError"
}

class AlgebraicParser {
	static operations = {
		"+": 1,
		"-": 1,
		"*": 3,
		"×": 3,
		"/": 4,
		"÷": 4
	}
	static variableRegex = /[A-Za-z\u0391-\u03C9]{1}/ // a-z, A-Z, all the greek symbols
	static coeffRegex = /[\d.-]+/ // include the minus symbol to capture negative coefficients

	constructor(eqnStr) {
		this.raw = eqnStr.replaceAll(" ", "") // remove ALL whitespace
		this.tokens = [] // store tokens in order
		this.units = [] // parsed tokens goes here

		// states
		this.flipPolarity = false; // mostly for exponents (reciprocals)
	}

	tokenise() {
		// tokenise this.raw into this.tokens

		// checks
		var oCount = 0;
		var cCount = 0;
		for (let charIdx = 0; charIdx < this.raw.length; charIdx++) {
			if (this.raw[charIdx] === "(") {
				oCount++;
			} else if (this.raw[charIdx] === ")") {
				cCount++;
			}
		}

		if (oCount != cCount) {
			// unmatching number of parenthesis
			throw new ParserError(`Miscount of opening & closing parenthesis`)
		}


		var tokenStream = [] // stream tokens here to be parsed into units
		var partialToken = "" // build tokens character by character
		var partialTokenOnlyConsistsOfToken = false
		var prevIsAlgebraicTerm = false; // true when previous token is an algebraic term
		var isAlgebraicTerm = false; // true when char is algebraic term
		var variableStore = {} // sniff out for variables
		var skipCounter = 0 // amt of chars to skip
		for (let charIdx = 0; charIdx < this.raw.length; charIdx++) {
			if (skipCounter >= 1) {
				skipCounter--
				continue
			}

			var char = this.raw[charIdx]

			// sniff out for variable
			if (AlgebraicParser.variableRegex.test(char)) {
				if (variableStore[char] == null) {
					variableStore[char] = new RegExp(char)
				}

				isAlgebraicTerm = true
			}

			console.log("R", char, isAlgebraicTerm, prevIsAlgebraicTerm, partialToken)

			// resume build token
			if ((!partialTokenOnlyConsistsOfToken && AlgebraicParser.operations[char] != null) || char === ")") {
				// push token into stream (unless token consists of operations)
				console.log("OP")
				if (partialToken.length > 0) {
					tokenStream.push(partialToken) // push current built token
				}

				// include operation in new partialToken
				partialToken = char

				// set partialTokenOnlyConsistsOfToken value to true
				partialTokenOnlyConsistsOfToken = char !== ")"
			} else if (char === "(") {
				console.log("PP")
				// parenthesis demarcations (start)

				// determine if partialToken contains any operation, if does, simply use that operation on this parenthesis
				if (partialTokenOnlyConsistsOfToken) {
					partialToken += "("
				} else if (partialToken.length > 0) {
					// has coefficient infront, automatically becomes a * parenthesis
					// ensure is not simply a captured operation (one char), although can be simply a constant factor, e.g. n(a + b)

					// push token
					console.log("PP", char)
					tokenStream.push(partialToken)

					// multiplication operator
					partialToken = "*("
				} else if (tokenStream.length >= 1) {
					// nothing in partial token
					// use previous token to determine what operation to apply on this parenthesis
					var prevToken = tokenStream[tokenStream.length -1]
					if ((prevToken.length >= 1) && (prevToken[prevToken.length -1] === "^" || prevToken[prevToken.length -1] === "(")) {
						// exponent  parenthesis or previous token was an adjacent parenthesis opening
						partialToken = "("
					} else {
						// need a multiplication operation
						partialToken = "*("
					}
				} else {
					// first character met is an open parenthesis
					partialToken = "("
				}

				// push token into stream
				tokenStream.push(partialToken)

				// reset token
				partialToken = ""
			} else if (char === "^") {
				// exponent operation
				// look forward to see if its a algberaic value or a cosntant exponent
				var toPushCurrentToken = false;
				var addParenthesis = false;
				var parenthesisContent = "";
				if (charIdx < this.raw.length -1) {
					for (let j = charIdx +1; j < this.raw.length; j++) {
						if (this.raw[j] === "(") {
							// already grouped
							// push current token
							toPushCurrentToken = true
							break
						} else if (AlgebraicParser.operations[this.raw[j]] != null) {
							break; // stop loop (operation encountered)
						} else if (AlgebraicParser.variableRegex.test(this.raw[j])) {
							// variable, need to add parenthesis
							toPushCurrentToken = true
							addParenthesis = true

							// set content
							parenthesisContent = this.raw.slice(charIdx +1, j +1)

							// set skip counter
							skipCounter = j -charIdx

							// add variable to store if haven't yet
							if (variableStore[this.raw[j]] == null) {
								variableStore[this.raw[j]] = new RegExp(this.raw[j])
							}

							break
						}
					}
				}

				// push current token
				if (toPushCurrentToken) {
					tokenStream.push(partialToken +"^")

					// reset token
					partialToken = ""

					if (addParenthesis && parenthesisContent.length > 0) {
						tokenStream.push("(")
						tokenStream.push(parenthesisContent)
						tokenStream.push(")")
					}
				} else {
					// continue capturing
					partialToken += "^"
				}
			} else if (prevIsAlgebraicTerm && isAlgebraicTerm) {
				// push current token
				if (partialToken.length > 0) {
					// SHOULD BE since contains algebraic term
					tokenStream.push(partialToken);
				}

				// push the current partial token
				tokenStream.push(`*${char}`); // add the multiplication operation first

				// reset partialToken
				partialToken = "";
			} else {
				// continue building token
				partialToken += char

				if (partialTokenOnlyConsistsOfToken) {
					// determine if new char is an operation
					if (AlgebraicParser.operations[char] == null) {
						partialTokenOnlyConsistsOfToken = false
					}
				}
			}

			// reset states
			prevIsAlgebraicTerm = isAlgebraicTerm
			isAlgebraicTerm = false
		}

		// trailing token
		if (partialToken.length > 0) {
			tokenStream.push(partialToken)
		}

		console.log("T", tokenStream)

		// build units based on tokens in tokenStream
		var units = []
		var exponentUnitPtr = []; // store units here that have exponents to be built
		var openingParenthesisPtr = []; // store idx of open parenthesis units here
		var localScopeIdx = 0; // will increment as long as is within same scope
		var expectingParenthesis = false; // will be toggled true when exponent has no value
		var toPopExponent = false; // if true, will call .pop() method on exponentUnitPtr
		for (let tokenIdx = 0; tokenIdx < tokenStream.length; tokenIdx++) {
			var token = tokenStream[tokenIdx]

			if (token.length === 0) {
				throw new ParserError(`Empty token with idx: ${tokenIdx}\n${JSON.stringify(tokenStream)}`)
			}

			// determine operation
			var operation;
			var isDivision = false;
			if (token[0] === ")") {
				// end of parenthesis

				// check if there is any operation
				if (token.length > 1) {
					operation = AlgebraicParser.operations[token[1]]
					if (operation == null && token.indexOf("^") === -1) {
						// include caret (exponent operator) in this case
						throw new ParserError(`Token [${token}] does not contain any operation preceeding the close parenthesis`)
					}
				}
			} else if (expectingParenthesis) {
				if (token[token.length -1] === "(") {
					expectingParenthesis = false; // reset value
					operation = 1
				} else {
					// expected open parenthesis from previous token but no parenthesis
					throw new ParserError(`Token [${token}] is not wrapped but any parethesis (declaration for previous exponent); not done internally too`)
				}
			} else {
				operation = AlgebraicParser.operations[token[0]] // first char
				if (operation == null && localScopeIdx === 0) {
					// first time, no operation declared, take it as an addition
					operation = AlgebraicParser.operations["+"]
				} else if ((operation === 3 || operation === 4) && localScopeIdx === 0) {
					// multiplication & division operations at the first term is illegal
					throw new ParserError(`Token [${token}] cannot be parsed, illegal operation on the first term`)
				} else if (operation == null && localScopeIdx >= 1) {
					// no operation captured
					throw new ParserError(`Token [${token}] cannot be parsed, missing an operation`)
				}

				if (operation === 4) {
					// division
					isDivision = true // set state so coefficient will be reciprocal of itself instead
					operation = 3 // use 3
				}

				if (token[token.length -1] === "(") {
					// normal opening parenthesis, add idx to array (so exponents on closing parenthesis will be brought forward)
					openingParenthesisPtr.push(units.length); // idx of THIS current unit to be built
				}
			}

			// identify base and exponent
			var base, exponent;
			var caretIdx = token.indexOf("^");
			console.log("BASE SNIFFING", token, caretIdx)
			if (caretIdx !== -1) {
				// has an exponent
				var exponentSection = token.slice(caretIdx +1)
				if (exponentSection.length === 0) {
					expectingParenthesis = true

					// create new algeraic parser to be added into exponent (nested objects)
					exponent = new AlgebraicParser("");
					exponentUnitPtr.push(exponent) // push current exponent container to be built
				} else {
					// should be a constant, as variable exponents have been enclosed with parenthesis demarcations during lexing
					exponent = parseFloat(exponentSection)
				}

				base = token.slice(0, caretIdx)
			} else {
				// no exponents
				exponent = 1 // SET TO 1 SINCE evaluating coefficient with an exponent of 0 leads to a multiplication factor of 1 || OLD COMMENT: constant (if variables are present, exponent will be increased to 1 later)

				base = token // entire token is the base
			}

			// coefficient
			var coeffMatch = AlgebraicParser.coeffRegex.exec(base)
			var coeff;
			if (coeffMatch == null) {
				coeff = 1 // by default is a 1
			} else {
				var match = coeffMatch[0]
				if (match === "-") {
					// single minus sign
					coeff = -1 // minus 1
				} else {
					coeff = parseFloat(coeffMatch[0])
				}
			}

			// test for algebraic variables within base
			var variable = -1; // -1 for constants
			if (token[token.length -1] === "(" || token[0] === ")") {
				// parenthesis demarcation gets 0
				variable = 0;
			} else {
				for (let [variableChar, variableRegExp] of Object.entries(variableStore)) {
					var match = variableRegExp.exec(token)
					if (match) {
						// has a variable
						variable = match[0]

						// EXPONENT HAS ALREADY BEEN SET TO 1 BY DEFAULT, NO LONGER 0
						// BELOW IS OLD COMMENT
						// // if exponent is 0, change it to 1 (0 is a falsy value)
						// if (exponent != null && exponent == 0) {
						// 	exponent = 1 // linear term
						// }

						break
					}
				}
			}
			for (let [variableChar, variableRegExp] of Object.entries(variableStore)) {
				var match = variableRegExp.exec(token)
				if (match) {
					// has a variable
					variable = match[0]

					// EXPONENT HAS ALREADY BEEN SET TO 1 BY DEFAULT, NO LONGER 0
					// BELOW IS OLD COMMENT
					// // if exponent is 0, change it to 1 (0 is a falsy value)
					// if (exponent != null && exponent == 0) {
					// 	exponent = 1 // linear term
					// }

					break
				}
			}

			// handle division operation (nuances between mult & div)
			if (isDivision) {
				// reciprocal of coefficient
				coeff = 1 /coeff

				if (variable !== -1 && typeof exponent === "number") {
					// inverse the variables too (by changing the exponent), brackets also
					// anything else but not numbers since they are already inversed
					exponent *= -1
				} else if (variable !== 1 && exponent instanceof AlgebraicParser) {
					exponent.flipPolarity = true // will call .applyPolarity() method on closing (when .pop is called on entry in exponentUnitPtr)
				}
			}

			// identify type
			var type = 1
			if (token[token.length -1] === "(") {
				type = 2 // open parenthesis demarcation

				// push into openingParenthesis
			} else if (token[0] === ")") {
				type = 3 // close parenthesis demarcation

				if (exponentUnitPtr.length > 0) {
					toPopExponent = true; // pop away exponent focus; cannot pop here if not closing parenthesis demarcation will go into this.units instead of exponent object
				} else if (openingParenthesisPtr.length > 0) {
					// find opening parenthesis, pass any exponents to it (for ease of calculations)
					// and also pass back any exponents open parenthesis has (ensure they are both the same value)
					var opUnit = units[openingParenthesisPtr.pop()];
					if (typeof opUnit[3] === "number" && opUnit[3] === -1) {
						// should be -1 ONLY, caused by division operation
						if (typeof exponent === "number") {
							// constant exponent
							exponent *= opUnit[3]
							opUnit[3] = exponent
						} else {
							// exponent is complex, an array (being built)
							throw new ParserError(`Complex exponent for token [${token}] not yet supported`)
						}
					} else if (opUnit[3] instanceof AlgebraicParser) {
						throw new ParserError(`Backlog reference triggered by [${token}]: Open parenthesis token [${opUnit}] has complex exponents`)
					}
				} else {
					// no matching open parenthesis
					throw new ParserError(`Token [${token}] with idx: ${units.length}; has no matching open parenthesis`)
				}
			}

			// identify scope
			if (token[token.length -1] === "(") {
				// start of new scope

				localScopeIdx = 0 // reset scope idx
			} else {
				// continue in this scope
				localScopeIdx++ // increment locally based idx
			}

			// push built unit into units stream
			var unit = [
				operation, coeff, variable, exponent, type
			]
			if (!expectingParenthesis && exponentUnitPtr.length > 0) {
				// prevent the unit (with array as exponent to be pushed into the reference array, results in circular reference)
				// exponents to be built
				exponentUnitPtr[exponentUnitPtr.length -1].units.push(unit)
			} else {
				units.push(unit)
			}

			console.log("PUSHED", unit)

			if (toPopExponent && exponentUnitPtr.length > 0) {
				toPopExponent = false; // toggle value

				// call POP operation ONLY after current unit (in building) has already been pushed
				// AT THE SAME TIME, apply polarity (i.e. if it is a reciprocal)
				exponentUnitPtr.pop().applyPolarity();
			} else if (toPopExponent && exponentUnitPtr.length === 0) {
				// should not happen since toPopExponent is only toggled true when exponentUnitPtr.length > 0
				throw new ParserError(`Token [${token}] trigged closing of exponent close parenthesis, but no exponent close parenthesis found`)
			}
		}


		this.units = units
		console.log("UNITS", JSON.parse(JSON.stringify(this.units)))

		// ensure parenthesis

		return this // for chaining purposes
	}

	applyPolarity() {
		// flip polarity
		if (!this.flipPolarity) {
			// no need to flip polarity
			return;
		}

		for (let i = 0; i < this.units.length; i++) {
			var unit = this.units[i];
			if (unit[4] === 1 && unit[0] === 1) {
				// only apply to coefficients of terms who are not multiplications
				if (typeof unit[3] === "number") {
					unit[1] **= unit[3] *-1; // -1 to flip polarity
					unit[3] = 1; // reset exponent value
				} else if (unit[3] instanceof AlgebraicParser) {
					unit[3].flipPolarity = !unit[3].flipPolarity
					if (unit[3].flipPolarity) {
						unit[3].applyPolarity(); // apply polarity (beauty of using itself object to represent exponents, can work with nested exponents perfectly)
					}
				}
			}
		}
	}

	swap(a, b) {
		// swaps unit at the specified index (a and b)
	}

	clean() {
		// to clean up built units
		// caries out some trimming works, preserves parenthesis group
		// i.e. transforms (x + 1) *4x *12 to 4x* 12*(x + 1); works with units representation, hence 4 will expand into x + 1 properly
		// standard notation to have open parenthesis unit be operation of 3 so it will look forward for the factor to expand with, in this case, 4x*12
		// some works are need to simplify them together (4x and 12 are individual units in this case), should be handled under .simplify()
		// works with factors already present infront of parenthesis groups, i.e. 4(x + 1) *12 will be 4 *12(x + 1)

		for (let [startIdx, endIdx] of this.parenthesisGroup()) {
			// clean up multiplication PRECEEDING parenthesis, forward it as a coefficient
			if (this.units[startIdx][0] === 5) {
				// start parenthesis denotes an exponent group (i.e. parenthesis group represents a complex exponent)
				// move on to the next group; no need to re-order multiplication order on exponent groups
				continue
			}

			var closeParenthesis = this.units[endIdx]
			if (endIdx < this.units.length -1) {
				// not last unit, has units preceeding close parenthesis
				var alreadyHasFactorInfront = this.units[startIdx][0] === 3 // start parenthesis has a multiplication
				for (let unitIdx = endIdx +1; unitIdx < this.units.length; unitIdx++) {
					var superseedingUnit = this.units[unitIdx]

					if (superseedingUnit[0] === 3 && superseedingUnit[4] === 1) {
						// multiplication & a number term (constant/variable), move it forward to start of parenthesis
						this.units.splice(unitIdx, 1) // splice from last index
						this.units.splice(startIdx, 0, superseedingUnit)

						// change type of previously preceeding unit (if none, will chage start parenthesis demarcation)
						if (this.units[startIdx +1][0] !== 3) {
							this.units[startIdx +1][0] = 3
						}

						if (!alreadyHasFactorInfront) {
							// drop the multiplication operation
							this.units[startIdx][0] = 1 // shifted to startIdx pos
						}
					} else {
						break // no more multiplication after close parenthesis
					}
				}
			}
		}

		return this; // for chaining purposes
	}

	generateSylvesterMatrix(roAlgebraicObject) {
		// assumes this AND roAlgebraicObject is a non-zero univariate polynomial
		var loM = []; // store coefficients of terms, starting with x^0 for the first index and x^1 for the second index
		var roM = []; // similar to loM but for right operand

		console.log("GENERATING SYLVESTER MATRIX FOR", JSON.parse(JSON.stringify(this)), JSON.parse(JSON.stringify(roAlgebraicObject)))
		for (let order = 0; order < 2; order++) {
			var target = this
			var targetM = loM;
			if (order === 1) {
				target = roAlgebraicObject;
				targetM = roM;
			}

			// find constant first (power 0)
			for (let i = 0; i < target.units.length; i++) {
				if (target.units[i][4] === 1 && target.units[i][2] === -1) {
					// constant
					targetM.push(target.units[i][1]); // push coefficient
					break
				}
			}

			// go by increasing power
			for (let i = 1; i < target.units.length +1; i++) {
				// target.units.length is a safe upper limit
				for (let j = 0; j < target.units.length; j++) {
					var unit = target.units[j];
					if (unit[4] === 1 && typeof unit[2] === "string" && typeof unit[3] === "number" && unit[3] === i) {
						targetM.push(unit[1]); // push coefficient
						break
					}
				}
			}
		}
		
		console.log("TEST", loM, roM)
		var matrix = []; // build matrix (m + n)
		var size = loM.length +roM.length -2; // offset of -2
		for (let i = 0; i < size; i++) {
			var row = [];

			var target = loM;
			var offset = i; // default offset
			if (i >= loM.length) {
				target = roM;
				offset = i -loM.length;
			}

			// initial padding
			for (let j = 0; j < offset; j++) {
				// pad columns with 0
				row.push(0);
			}

			// actual values
			for (let j = 0; j < target.length; j++) {
				row.push(target[target.length -j -1]); // reference starting from the back since constant is the first element
			}

			// trailing padding
			var remaining = size -row.length
			for (let j = 0; j < remaining; j++) {
				row.push(0);
			}

			matrix.push(row)
		}

		return matrix;
	}

	_copyUnits() {
		// returns a copy of the current this.units
		var copy = []
		for (let unitIdx = 0; unitIdx < this.units.length; unitIdx++) {
			copy.push([...this.units[unitIdx]])
		}
		return copy
	}

	_addAdjacent(loIdx, roIdx, discardOperand) {
		// performs arithmetic add on units (left operand & right operand as defined by loIdx & roIdx)
		var leftoperand = this.units[loIdx];
		var rightoperand = this.units[roIdx];

		if (leftoperand[3] == null || rightoperand[3] == null) {
			// cannot evaluate
			return false
		}

		var sameTerm = leftoperand[2] === rightoperand[2];
		if (sameTerm) {
			// DONT include any different bases albeit algebraic term
			// apply exponents first if any
			if (leftoperand[2] === -1 && leftoperand[3] != null) {
				// a constant with a constant exponent, evaluate raised coefficient
				leftoperand[1] **= leftoperand[3];
				leftoperand[3] = 1; // reset exponent to 1
			}
			if (rightoperand[2] === -1 && rightoperand[3] != null) {
				// a constant with a constant exponent, evaluate raised coefficient
				rightoperand[1] **= rightoperand[3];
				rightoperand[3] = 1; // reset exponent to 1
			}

			if (typeof leftoperand[2] === "string" && leftoperand[3] != rightoperand[3]) {
				// leftoperand[3] and rightoperand[3] cannot be null (have checked at the top of the function)
				// only need to check if leftoperand is an algebraic term since it has the same base as rightoperand
				// different powers, cannot evaluate
				return false
			}

			leftoperand[1] += rightoperand[1]; // exponents already dealed with
		} else {
			return false;
		}

		// splice out right operand
		if (discardOperand) {
			this.units.splice(roIdx, 1)
		}
		return true
	}

	_multAdajcent(loIdx, roIdx, discardOperand) {
		// multiply operation between units (leftoperand index & right operand index)
		// discardOperand: boolean, if true will splice away right operand, otherwise will not discard any operands
		var leftoperand = this.units[loIdx];
		var rightoperand = this.units[roIdx];

		var leftComplexExpo, rightComplexExpo;

		if (leftoperand[2] === -1 && leftoperand[3] != null) {
			// constants
			// evaluate number with exponents, reset it to 1
			leftoperand[1] **= leftoperand[3];
			leftoperand[3] = 1;
		} else if (leftoperand[3] == null) {
			// complex exponents
			var complexExpo = this._getComplexExponent(loIdx)
			if (complexExpo === null) {
				return; // failed to grab exponent
			} else if (complexExpo.length === 1)

			// determine right operand exponent
			var rightExpo = [rightoperand[3]]; // wrap it in an iterable
			if (rightoperand[3] == null) {
				rightExpo = this._getComplexExponent(roIdx)
				if (rightExpo == null) {
					// failed to grab complex exponent
					return false;
				}
			}

			if (leftoperand[2] !== -1 && leftoperand[2] === rightoperand[2]) {
				// algebraic term, same base
				complexExpo.splice(complexExpo.length, 0, ...rightoperand[3])
			} else if (leftoperand[2] === -1 && leftoperand[1] === rightoperand[1]) {
				// constant term, same base
			} else {
				return false;
			}
		}
		if (rightoperand[2] === -1 && rightoperand[3] != null) {
			// constants
			rightoperand[1] **= rightoperand[3];
			rightoperand[3] = 1;
		} else if (rightoperand[3] == null) {
			// complex exponents
			return false;
		}

		// discard right term
		// exponents have been factored into their coefficients value (index 1)
		var sameTerm = leftoperand[2] === rightoperand[2];
		if (sameTerm && leftoperand[2] !== -1) {
			// algebraic terms
			leftoperand[1] *= rightoperand[1];
			leftoperand[3] += rightoperand[3]; // sum the powers
		} else if (sameTerm && leftoperand[2] === 1) {
			// constants
			leftoperand[1] *= rightoperand[1];
		} else if (!sameTerm && (leftoperand[2] === -1 || rightoperand[2] === -1)) {
			// one is a algebraic term and the other is the constant
			var varUnit = rightoperand; // assume variable unit is right operand
			if (rightoperand[2] === -1) {
				// left operand is the variable instead
				varUnit = leftoperand;
			}

			this.units[loIdx] = [
				leftoperand[0],
				leftoperand[1] * rightoperand[1],
				varUnit[2],
				varUnit[3],
				leftoperand[4],
			];
		} else {
			// both are algebraic terms but different bases
			return false;
		}

		// discard right operand
		if (discardOperand) {
			this.units.splice(roIdx, 1);
		}
		return true;
	}

	_getComplexExponent(unitIdx) {
		// returns an array of units representing the complex exponent of base, unitIdx, exclusive of the exponents demarcation
		// not in-place, which also means no modifications will apply to this.units
		if (this.units[unitIdx +1][0] !== 5) {
			// not an exponent-parenthesis dermacation
			return; // return null
		} else if (this.units[unitIdx +2][4] === 3) {
			// close parenthesis dermacation, no content within parenthesis group
			return; // return null
		}

		var startIdx = unitIdx +1; // plus one to exclude demarcation units
		var endIdx = -1;
		var scope = 1; // to detect when parenthesis have been exitted
		for (let i = unitIdx +3; i < this.units.length; i++) {
			// plus 3 to skip the parenthesis demarcation and the element right after opening the parenthesis
			if (this.unit[i][4] === 3) {
				// close parenthesis, decrease scope
				scope--
			} else if (this.unit[i][4] === 2) {
				// open parenthesis, increase scope
				scope++
			}

			if (scope === 0) {
				// exitted initial exponent parenthesis group
				endIdx = unitIdx -1 // minus one to exclude demarcation units
				break
			}
		}

		return this.units.slice(startIdx +1, endIdx)
	}

	_multUnit(leftoperand, rightoperand) {
		// multiply both units together, returns null if cannoot be simplified further than the multiplication representation
		// else, returns a new unit representing the multiplication of leftoperand & rightoperand
		// leftoperand: unit data
		// rightoperand: unit data
		// evaluate exponents if any

		if (leftoperand[4] === -1 && leftoperand[3] > 1) {
			leftoperand[1] **= leftoperand[3]
			leftoperand[3] = 1; // reset exponent
		} else if (leftoperand[3] == null) {
			// complex exponent
			return
		}

		if (rightoperand[4] === -1 && rightoperand[3] > 1) {
			rightoperand[1] **= rightoperand[3]
			rightoperand[3] = 1; // reset exponent
		} else if (rightoperand[3] == null) {
			// complex exponent
			return
		}

		// build new term
		var newTerm = [...leftoperand] // copy of leftoperand

		// compare scenarios
		var sameTerm = leftoperand[2] === rightoperand[2];
		console.log("SAME TERM?", sameTerm)
		if (sameTerm && leftoperand[2] !== -1) {
			// algebraic terms
			console.log("ALGEBRAIC TERM", JSON.parse(JSON.stringify(newTerm)), JSON.parse(JSON.stringify(rightoperand)))
			newTerm[1] *= rightoperand[1];
			newTerm[3] += rightoperand[3]; // sum the powers
		} else if (sameTerm && leftoperand[2] === 1) {
			// constants
			newTerm[1] *= rightoperand[1]; // exponents should be 1
		} else if (!sameTerm && (leftoperand[2] === -1 || rightoperand[2] === -1)) {
			// one is a algebraic term and the other is the constant
			var varUnit = rightoperand; // assume variable unit is right operand
			if (rightoperand[2] === -1) {
				// left operand is the variable instead
				varUnit = leftoperand;
			}

			newTerm[1] *= rightoperand[1] // exponent has already been applied
			newTerm[2] = varUnit[2]
			newTerm[3] = varUnit[3] // take exponent of algebraic term since it cannot be factored in
		} else {
			// both are algebraic terms but different bases
			return;
		}

		return newTerm
	}

	_multUnitPower(leftoperand, rightoperand, leftComplexExpoGroup, rightComplexExpoGroup) {
		// multiply both units together, returns null if cannot be simplified further than the multiplication operation
		// else, returns a new unit representing the multiplication of leftoperand and rightoperand
		// leftoperand: unit data
		// rightoperand: unit data
		// leftComplexExpoGroup: unit[], array of units representing the complex expo group

		// work with cloned copies
		var leftoperand = [...leftoperand]
		var rightoperand = [...rightoperand]
		var leftComplexExpoGroupClone = []
		leftComplexExpoGroup.each(expoUnit => {
			leftComplexExpoGroupClone.push([...expoUnit])
		})
		var rightComplexExpoGroupClone = []
		rightComplexExpoGroup.each(expoUnit => {
			rightComplexExpoGroupClone.push([...expoUnit])
		})

		// re-assigned clones
		leftComplexExpoGroup = leftComplexExpoGroupClone
		rightComplexExpoGroup = rightComplexExpoGroupClone
		
		// evaluate exponents if any
		if (leftoperand[4] === -1 && leftoperand[3] > 1) {
			leftoperand[1] **= leftoperand[3]
			leftoperand[3] = 1; // reset exponent
		} else if (leftoperand[3] == null && leftComplexExpoGroup == null) {
			// complex exponent
			return
		}

		if (rightoperand[4] === -1 && rightoperand[3] > 1) {
			rightoperand[1] **= rightoperand[3]
			rightoperand[3] = 1; // reset exponent
		} else if (rightoperand[3] == null && rightComplexExpoGroup == null) {
			// complex exponent
			return
		}

		var leftHasComplexExpo = leftoperand[3] == null // leftComplexExpoGroup should be present (above checked)
		var rightHasComplexExpo = rightoperand[3] == null // rightComplexExpoGroup should be present (above checked)
		
		// see if the complex exponents can be simplified
		if (leftoperand[2] === -1 && leftComplexExpoGroup.length === 1 && leftComplexExpoGroup[0][2] === -1) {
			// both exponents and base are a constant
			// base has no exponents to apply, exponent value is a null pointer
			leftoperand[1] **= leftComplexExpoGroup[0][1] **leftComplexExpoGroup[0][3] // take into consideration the exponent of the exponent, e.g. 10^(2^2)
			leftoperand[3] = 1 // reset exponent (from null)

			// toggle leftHasComplexExpo value
			leftHasComplexExpo = false
		}
		if (rightoperand[2] === -1 && rightComplexExpoGroup.length === 1 && rightComplexExpoGroup[0][2] === -1) {
			// both exponents and base are a constant
			// base has no exponents to apply, exponent value is a null pointer
			rightoperand[1] **= rightComplexExpoGroup[0][1] **rightComplexExpoGroup[0][3] // take into consideration the exponent of the exponent, e.g. 10^(2^2)
			rightoperand[3] = 1 // reset exponent (from null)

			// toggle leftHasComplexExpo value
			rightHasComplexExpo = false
		}

		var newComplexExpoGroup = []
		if ((leftHasComplexExpo && rightHasComplexExpo) || leftoperand[2] === rightoperand[2]) {
			// same bases type, yay can multiply
			leftComplexExpoGroup = leftComplexExpoGroup ?? []; // default value of empty
			rightComplexExpoGroup = rightComplexExpoGroup ?? [];

			newComplexExpoGroup = leftHasComplexExpo ? leftComplexExpoGroup : rightComplexExpoGroup
			if (leftoperand[2] === -1) {
				// constant
				if (leftoperand[1] === rightoperand[1]) {
					// same base, can simply add complex expo
					newComplexExpoGroup = leftComplexExpoGroup.splice(leftComplexExpoGroup.length, 0, rightComplexExpoGroup)
				} else {
					// not same base
					// try to find a common base
					var commonbase = BaseQuestion.getCommonBase(leftoperand[1], leftoperand[2])
					if (commonbase) {
						// there is a common base present
						var lnRoot = Math.log(commonbase)
						var leftoperandIncrPower = Math.log(leftoperand[1]) /lnRoot
						var rightoperandIncrPower = Math.log(rightoperand[2]) /lnRoot
						if (leftoperandIncrPower > 1) {
							// multiply left expo by leftoperandIncrPower
							// change base to root base
							leftoperand[1] = commonbase
						}
						if (rightoperandIncrPower > 1) {
							// multiply right expo by rightoperandIncrPower
							// change base to root base
							rightoperand[1] = commonbase
						}
					}
				}
			} else if (typeof leftoperand[2] === "string") {
				// variable term
				
			}
		}

		var sameTerm = leftoperand[2] === rightoperand[2];
		if (sameTerm && leftoperand[2] !== -1) {
			// algebraic terms
			leftoperand[1] *= rightoperand[1];
			leftoperand[3] += rightoperand[3]; // sum the powers
		} else if (sameTerm && leftoperand[2] === 1) {
			// constants
			leftoperand[1] *= rightoperand[1];
		} else if (!sameTerm && (leftoperand[2] === -1 || rightoperand[2] === -1)) {
			// one is a algebraic term and the other is the constant
			var varUnit = rightoperand; // assume variable unit is right operand
			if (rightoperand[2] === -1) {
				// left operand is the variable instead
				varUnit = leftoperand;
			}

			this.units[loIdx] = [
				leftoperand[0],
				leftoperand[1] * rightoperand[1],
				varUnit[2],
				varUnit[3],
				leftoperand[4],
			];
		} else {
			// both are algebraic terms but different bases
			return false;
		}
	}

	_multUnits(...units) {
		// chain multiply units supplied here
		// units are wrapped by an array, with the second element (also an array element at index 1) representing the power if base has an exponent of null
		// WILL MODIFY contents within units, use .toSpliced() if you still want to preserve the previous units
		console.log("RAW", JSON.parse(JSON.stringify(units)))
		var result = [units[0]]
		console.log("INITIAL RESULT", JSON.parse(JSON.stringify(result)))
		for (let i = 1; i < units.length; i++) {
			// start by multiplying the second unit with the first unit
			var rightoperand = units[i]
			var success = false
			console.log("START CYCLE", JSON.parse(JSON.stringify(result)))
			for (let j = 0; j < result.length; j++) {
				// list of candidates if they cannot be simplified farther

				var leftoperand = result[j]
				console.log("BEF TRYING", JSON.parse(JSON.stringify(leftoperand)), JSON.parse(JSON.stringify(rightoperand)))
				var postOpResult = this._multUnit(leftoperand, rightoperand) // supply the exponent groups if any
				console.log("TRYING", JSON.parse(JSON.stringify(leftoperand)), JSON.parse(JSON.stringify(rightoperand)), postOpResult)
				if (postOpResult) {
					// was able to simpifly farther
					result[j] = postOpResult;

					// set states, escape control loop (sourcing candidates for mult op)
					success = true
					break
				} else {
					console.log("NOT SUCCESSFULLY, trying next in result pool")
				}
			}

			if (!success) {
				rightoperand[0] = 3 // change it to multiplication before pushing it in

				// push the coefficient to root term (index 0 of result array)
				result[0][1] *= rightoperand[1]
				rightoperand[1] = 1; // reset

				result.push(rightoperand)
				console.log("RESULT POOL", JSON.parse(JSON.stringify(result)))
			} else {
				console.log("SUCCESS", JSON.parse(JSON.stringify(result)))
			}
		}

		// ensure op is 1 for root term (index 0 of result array)
		result[0][0] = 1;

		return result
	}

	_simplifyParenthesis(startContentIdx, endContentIdx) {
		// does not remove any units but deservice them instead using this._deserviceUnit()
		// startContentIdx: number, inclusive of parenthesis content
		// endContentIdx: number, inclusive of parenthesis content, but not parenthesis demarcation
		for (let i = startContentIdx +1; i <= endContentIdx; i++) {
			var loIdx = this._findLeftOperand(i)
			if (loIdx == null) {
				// no left operand for this unit
				continue // move on to the next right operand
			}

			if (this.units[i][0] === 3) {
				// multiplication first
				var success = this._multAdajcent(loIdx, i, false)
				if (success) {
					this._deserviceUnit(i)
				}
			}
		}

		// second iteration for addition and subtraction
		for (let i = startContentIdx +1; i <= endContentIdx; i++) {
			var loIdx = this._findLeftOperand(i)
			if (loIdx == null) {
				// no left operand for this unit
				continue // move on to the next right operand
			}

			if (this.units[i][0] === 1) {
				// addition and subtraction
				var success = this._addAdjacent(loIdx, i, false)
				if (success) {
					this._deserviceUnit(i)
				}
			}
		}
	}

	_multAdjacentParenthesis(firstPgIdx, firstPgCloseIdx, secondPgIdx, secondClosePgIdx) {
		// expands out the adjacent parenthesis group with multiplication
		// inner parenthesis group should have been reduced to minimal by .simplify()
		// return the new units group inclusive of the removal of previous parenthesis demarcation
		// firstPgIdx: integer, index of the first parenthesis group demarcation (inclusive)
		// secondPgIdx: integer, index of the second parenthesis group demarcation (inclusive)

		// extract out all the terms to be used as factors (in both groups)
		var groupFactors = []; // stream final factorList into here
		for (let g = 0; g < 2; g++) {
			var factorList = [] // stream built factors into here
			var currentFactor = [] // build factors here

			var startIdx = firstPgIdx *(1 -g) +secondPgIdx *g // firstPgIdx during first iteration
			var endIdx = firstPgCloseIdx *(1 -g) +secondClosePgIdx *g
			for (let i = startIdx +1; i < endIdx; i++) {
				var unit = this.units[i]
				if (unit[4] === 1) {
					if (unit[0] === 1) {
						// addition operation, a whole new factor by itself
						// push current factor (if any)
						if (currentFactor.length >= 1) {
							factorList.push(currentFactor);
						}

						currentFactor = [unit]; // new factor
					} else if (unit[0] === 3) {
						// multiplication
						// add to current factor
						currentFactor.push(unit)
					}
				}
			}

			// push any remaining factorList
			if (currentFactor.length >= 1) {
				factorList.push(currentFactor)
			}

			groupFactors.push(factorList)
		}

		// construct the new parenthesis group
		var group = [] // stream new units into here
		for (let i = 0; i < groupFactors[0].length; i++) {
			var unit = groupFactors[0][i];

			// multiply every term in the second pg by unit
			for (let j = 0; j < groupFactors[1].length; j++) {
				// chain all the terms together, operation does not matter since ._multUnits assume multiplication operation & hence does not check for operation mode value
				var chain = unit.map(unitData => [...unitData]).toSpliced(unit.length, 0, ...groupFactors[1][j].map(unitData => [...unitData]))
				var result = this._multUnits(...chain) // result would be an array

				group.splice(group.length, 0, ...result) // spread out array container
			}
		}

		return group
	}

	_findLeftOperand(unitIdx) {
		// unitIdx: number, denotes index of right operand
		// backtrack to find unit that is NOT deserviced (empty)
		for (let i = unitIdx -1; i >= 0; i--) {
			if (this.units[i][4] !== 4) {
				return i
			}
		}
	}

	_findLeftOperandWithSameBaseAndExpoWithinSameScope(unitIdx) {
		// unitIdx: number, denotes index of right operand
		// backtrack to find unit that has the same base AND is NOT deserviced (empty) AND is able to be add
		var unit = this.units[unitIdx];
		var scope = 0; // denotes scope level
		for (let i = unitIdx -1; i >= 0; i--) {
			var btUnit = this.units[i]
			if (btUnit[4] === 3) {
				scope++
			} else if (btUnit[4] === 2 && scope === 0) {
				// already reached boundary of parenthesis group, no more match
				return; // empty object
			} else if (btUnit[4] === 2) {
				// decrement scope
				scope--
			} else if (scope > 0) {
				// not within scope
				continue; // do nothing
			} else if (unit[2] === btUnit[2] && unit[3] === btUnit[3] && btUnit[4] !== 4) {
				return i
			}
		}
	}

	_deserviceUnit(...unitIdx) {
		// renders unit at unitIdx (index) empty
		// empty (or deserviced) units are present as junk, but serve no purpose to the representation of work
		for (let i of unitIdx) {
			this.units[i][4] = 4 // 4 for deserviced units
		}
	}

	_cleanupDeserviceUnits() {
		var initLen = this.units.length;
		for (let unitIdx = initLen -1; unitIdx >= 0; unitIdx--) {
			// start slicing from the back to minimise shifting operations
			if (this.units[unitIdx][4] === 4 || this.units[unitIdx][1] === 0) {
				// coefficients 0 also considered deserviced units
				this.units.splice(unitIdx, 1)
			}
		}
	}

	_countUnits(unitsArr) {
		// count the number of non-deserviced units there are
		var dsUnits = 0; // generally lesser increment operations if counting deserviced units
		for (let i = 0; i < unitsArr.length; i++) {
			if (unitsArr[i][4] === 4) {
				// deserviced unit
				dsUnits++
			}
		}

		return unitsArr.length -dsUnits
	}

	_applyExponents() {
		for (let i = 0; i < this.units.length; i++) {
			if (this.units[i][4] === 1 && this.units[i][2] === -1 && this.units[i][3] > 1) {
				// constant with an exponent of greater than 1
				this.units[i][1] **= this.units[i][3] // apply exponent
				this.units[i][3] = 1; // reset exponent;
			}
		}
	}

	_solveLinearRoots() {
		// solve linear equation
		// equation should only contain at most two items (.simplify() should have been called, no exponents > 1 for constants)
		if (this.units.length > 2) {
			// call .simplify() before calling ._solveLinearRoots()
			return false
		}

		var coefficient = 1
		var constant = 0

		for (let unitIdx = 0; unitIdx < this.units.length; unitIdx++) {
			var unit = this.units[unitIdx]
			if (unit[4] === 1 && unit[2] !== -1) {
				// variable term
				coefficient = unit[1]
			} else if (unit[4] === 1 && unit[2] === -1) {
				// constant term
				constant = unit[1] **unit[3] // exponent for constant should be one since .simplify() was called
			}
		}

		return -constant /coefficient
	}

	_solveQuadRoots() {
		// solve quadratic equation
		// equation should only contain at most three items (.simplify() should have been called, no exponents > 1 for constants)
		if (this.units.length > 3) {
			// call .simplify() before calling ._solveQUadRoots()
			return false
		}

		var a = 0
		var b = 0
		var c = 0

		for (let unitIdx = 0; unitIdx < this.units.length; unitIdx++) {
			var unit = this.units[unitIdx]
			if (unit[4] === 1 && unit[2] !== -1 && unit[3] === 2) {
				// quad variable term
				a = unit[1]
			} else if (unit[4] === 1 && unit[2] !== -1 && unit[3] === 1) {
				// linear variable term
				b = unit[1]
			} else if (unit[4] === 1 && unit[2] === -1) {
				// constant term
				c = unit[1] **unit[3] // exponent for constant should be one since .simplify() was called
			}
		}

		var discriminantSq = Math.sqrt(b **2 -(4 *a *c))
		return [(-b +discriminantSq) /(2 *a), (-b -discriminantSq) /(2 *a)]
	}

	_solveCubicRoots() {
		return [0, 0, 0]
	}

	solveForRoots() {
		// solve for roots, determine highest polynomial degree first
		if (this.variables.length !== 1) {
			// ONLY solve the roots for ONE variable
			return false
		}

		var polynomialDegree = 0 // should not be zero since there are variables present
		for (let unitIdx = 0; unitIdx < this.units.length; unitIdx++) {
			// iterate through units, sniff out highest polynomial degree
			var unit = this.units[unitIdx]
			if (unit[2] === this.variables[0] && unit[3] > polynomialDegree) {
				// only targetting one variable
				polynomialDegree = unit[3]
			}
		}

		if (polynomialDegree <= 0) {
			// no variables present
			return false
		}

		// see what degree it is
		console.log("DEGREE:", polynomialDegree)
		switch (polynomialDegree) {
			case 1:
				return this._solveLinearRoots()
			case 2:
				return this._solveQuadRoots()
			case 3:
				return this._solveCubicRoots()
		}
	}

	_sameLikeTerms(termA, termB) {
		// returns true if termA === termB
		// should only contain multiplication operation other than the root term
		// takes into account of exponents, should have been simplified with no duplicate terms (4x^2*x^3 is not valid and should be 4x^5)
		var variables = {} // extract out all the variables in termA; store the as a dictionary where the key is the base and the exponent is the value
		var variablesLen = 0
		for (let i = 0; i < termA.length; i++) {
			var unit = termA[i]
			if (unit[4] === 1 && unit[2] !== -1 && unit[3]) {
				if (typeof unit[3] === "number" && variables[unit[2]] == null) {
					// not in yet
					variables[unit[2]] = unit[3];
					variablesLen++; // increment count
				} else {
					// in already, throw error
					throw new ParserError(`Like terms [${termA}] was not simplified or has a complex exponent`)
				}
			}
		}

		// spot for missing terms in termA that are present in termB
		// if not spot for excess terms in termA that are absent in termB
		for (let i = 0; i < termB.length; i++) {
			var unit = termB[i]
			if (unit[4] === 1 && unit[2] !== -1) {
				if (variables[unit[2]] == null) {
					return false; // no term found in termA
				} else if (typeof unit[3] !== "number") {
					// complex exponent in termB
					throw new ParserError(`Like terms (second term, B) [${termB}] contains a complex exponent`)
				} else if (variables[unit[2]] !== unit[3]) {
					// different exponent
					return false
				} else {
					// same exponent, exact term
					variablesLen--; // decrement term
				}
			}
		}

		return variablesLen === 0
	}

	simplifyTest() {
		this._applyExponents();
		// simplify within parenthesis
		for (let [startIdx, endIdx] of this.parenthesisGroup()) {
			for (let j = startIdx +2; j < endIdx; j++) {
				// plus 2 to skip the adjacent element right after starting the parenthesis group since that unit has no operations
				var unit = this.units[j]
				if (unit[4] === 1 && unit[0] === 3) {
					// only acknowledge constants and variables, not parenthesis demarcations
					// multiplication
					var loIdx = this._findLeftOperand(j) // find left operand that is not de-serviced
					if (loIdx == null) {
						continue; // no left operand found
					}

					var success = this._multAdajcent(loIdx, j, false) // pass in false so no operands will be deleted
					if (success) {
						this._deserviceUnit(j)
					}
				}
			}

			// addition now
			for (let j = startIdx +2; j < endIdx; j++) {
				var unit = this.units[j]
				if (unit[4] === 1 && unit[0] === 1) {
					// only acknowledge constants and variables, not parenthesis demarcations
					// addition
					var loIdx = this._findLeftOperandWithSameBaseAndExpoWithinSameScope(j) // find left operand that has the same base and exponent (suitable for multiplication)
					if (loIdx == null) {
						continue; // no left operand found
					}
					var success = this._addAdjacent(loIdx, j, false)
					if (success) {
						console.log("DESERVICING")
						this._deserviceUnit(j)
					}
				}
			}
		}

		// try to simplify complex exponents after simplifying contents of parenthesis
		// i.e. bring down 10^(2) [4 units] to 10^2 [1 unit]
		// should have minimal nested parenthesis by now
		for (let [startIdx, endIdx] of this.parenthesisGroup()) {
			var base = this.units[startIdx -1] // base with null pointer as exponent value represents complex exponents
			if (this.units[startIdx][0] === 5 && base[4] === 1 && base == null) {
				// exponent open parenthesis demarcation, only work with bases who have exponents set to null and aren't close parenthesis (e.g. (x + 1)^2)
				if (this._countUnits(this.units.slice(startIdx +1, endIdx)) === 1) {
					// exactly one element
					var soleExponent = this.units[startIdx +1]
					if (soleExponent[2] === -1 && soleExponent[3] != null) {
						// constant, yay can be brought down
						// also, consider the exponent of the exponent, e.g. (10^(5^2)); the code should start expanding from inner-most parenthesis group
						// so last step would immediately look like 10^25
						
						// base has no exponent (null value) hence safe to just assume this will be the exact exponent
						base[3] = (soleExponent[1] **soleExponent[3])

						// flatten if possible
						if (base[2] === -1) {
							// constant base
							// apply exponent value directly to coefficient

							base[1] **= base[3]
							base[3] = 1; // reset exponent value
						}

						// deservice the both parenthesis demarcation
						this._deserviceUnit(startIdx, startIdx +1, endIdx)
					}
				}
			}
		}

		console.log("FLAG A", JSON.parse(JSON.stringify(this.units)))

		// expand adjacent parenthesis groups FIRST
		console.log("V", JSON.parse(JSON.stringify(this.units)))
		var closePgIdxMapping = {}; // create a mapping of parenthesis endings idx to their opening counterparts
		for (let [startIdx, endIdx] of this.parenthesisGroup()) {
			// create mapping entry
			closePgIdxMapping[endIdx] = startIdx;

			var openParenthesis = this.units[startIdx]
			if (openParenthesis[0] === 3) {
				// multiplication
				var factor = this.units[startIdx -1]
				console.log("FACTOR", factor, startIdx)
				if (factor[4] === 3) {
					// close parenthesis
					var previousOpenPgIdx = closePgIdxMapping[startIdx -1] // mapping works cause of how this.parenthisGroup behaves, it start the inner-most PG with left to right fashion
					console.log("PASSED PARAMS", previousOpenPgIdx, startIdx -1, startIdx, endIdx)
					var expandedGroup = this._multAdjacentParenthesis(previousOpenPgIdx, startIdx -1, startIdx, endIdx)
					console.log("MODIFICATION", JSON.parse(JSON.stringify(expandedGroup)), "\n", this.units, previousOpenPgIdx, endIdx -previousOpenPgIdx +1)
					this.units.splice(previousOpenPgIdx, endIdx -previousOpenPgIdx +1, ...expandedGroup)
				}
			}
		}

		// expand ALL parenthesis groups, start from inner-most
		for (let [startIdx, endIdx] of this.hardLookupParenthesisGroup()) {
			// extracting all the group-units in the parenthesis group to be expanded on
			var groupUnits = []; // stream all the tokens here, like terms (i.e. chained by multiplication operation) are encapsulated in their own arrays
			console.log("HARDLOOKUP", startIdx, endIdx)
			for (let j = startIdx +1; j < endIdx; j++) {
				// start with a 1 offset since the parenthesis demarcation was included in startIdx
				if (this.units[j][4] !== 1) {
					// do not work on this unit, continue
					continue
				}

				if (this.units[j][0] === 3) {
					// stream into current build
					groupUnits[groupUnits.length -1].push(this.units[j])
				} else if (this.units[j][0] === 1) {
					// new group
					groupUnits.push([this.units[j]])
				}
			}

			if (true) {
				// parenthesis is to be expanded AND has units infront
				var factor = this.units[startIdx][1] // negative coefficient perhaps, 1 by default (ALWAYS A CONSTANT VALUE SINCE IT CAN ONLY REPRESENT NUMBERS ONLY)
				console.log("SFACTOR", factor)
				if (this.units[startIdx][0] === 3) {
					// there is a factor infront, i.e. 10x(30a)
					// continuously build factor, i.e. 10x*3b(30a)

					// first, apply the VERY FIRST factor to current constant factor
					var prematureFactor = this.units[startIdx -1]
					prematureFactor[1] *= factor // apply factor
					this.units[startIdx][1] = 1 // reset factor

					factor = [prematureFactor] // build it into a list, start streaming factors if they are any
					if (this.units[startIdx -1][0] === 3) {
						for (let j = startIdx -2; j >= 0; j--) {
							// look at the second and ongoing factor (if no longer a mult op, stop building factors)
							factor.push(this.units[j])

							if (this.units[j][0] !== 3) {
								break; // stop operation
							}
						}
					}

					// reverse factor (order may not matter, but representation will not be exact)
					// e.g. 3bc will become 3cb after multiplication operation
					if (factor.length > 1) {
						factor.reverse()
					}

					console.log("CFACTOR", factor, groupUnits)

					// apply factors to all the terms inside the group
					var result = [] // stream results here
					for (let units of groupUnits) {
						console.log("PARAMS", factor.map(unitData => [...unitData]).toSpliced(factor.length, 0, ...units))
						var multOpResult = this._multUnits(...factor.map(unitData => [...unitData]).toSpliced(factor.length, 0, ...units))
						console.log("MULT RESULT", multOpResult)
						result.splice(result.length, 0, ...multOpResult)
					}

					// build into this.units
					console.log("OVERWRITE", result, startIdx, endIdx -startIdx +1)
					this.units.splice(startIdx -factor.length, endIdx -startIdx +factor.length +1, ...result)
					console.log("FINAL", this.units)
				} else {
					// constant factor
					for (let units of groupUnits) {
						units[0][1] *= factor
					}

					// de-service both parenthesis demarcation
					console.log("DESERVICED", startIdx, endIdx)
					this._deserviceUnit(startIdx, endIdx)
				}
			}
		}

		console.log("FLAG B", JSON.parse(JSON.stringify(this.units)))

		// do multiplication on constants
		for (let i = 1; i < this.units.length; i++) {
			var unit = this.units[i];
			if (unit[4] !== 1) {
				continue;
			}

			if (unit[2] === -1 && unit[0] === 3 && typeof unit[3] === "number") {
				// constant factor
				for (let j = i -1; j >= 0; j--) {
					var leftoperand = this.units[j]
					if (leftoperand[4] === 2 || leftoperand[4] === 3) {
						// parenthesis, stop
						break
					} else if (leftoperand[4] === 4) {
						// deserviced, ignore
						continue
					}

					if (leftoperand[2] === -1 && typeof unit[3] === "number") {
						// can add
						

						if (leftoperand[0] === 3) {
							// more to mult

						} else {
							break; // no more
						}
					} else {
						// not a constant term, i.e. 10x * 10
						break; // no more
					}
				}
			}
		}

		console.log("FLAG C", JSON.parse(JSON.stringify(this.units)))

		// carry out root level addition by sniffing out the like terms first
		// there should be no more parenthesis
		var likeTerms = []; // stream like terms here (indices only)
		var currentTermBuild = []; // build like terms here (indices only)
		for (let i = 0; i < this.units.length; i++) {
			var unit = this.units[i]
			if (unit[4] === 4) {
				// de-serviced (allow parenthesis to pass)
				continue
			}

			if (unit[0] === 1) {
				if (currentTermBuild.length >= 1) {
					// stream into likeTerms array
					likeTerms.push(currentTermBuild)

					// reset build array
					currentTermBuild = [i];
				} else {
					currentTermBuild = [i]; // build
				}

				// flatten unit
				if (unit[2] === -1 && typeof unit[3] === "number") {
					unit[1] **= unit[3];
					unit[3] = 1 // reset
				}
			} else if (unit[0] === 3) {
				// multiplication

				// flatten current unit (constant)
				if (unit[2] === -1 && typeof unit[3] === "number") {
					unit[1] **= unit[3];
					unit[3] = 1 // reset exponent
				}

				// make currentTermBuild[0] the root array; PASS ALL the coeffs to root
				console.log("BEF", JSON.parse(JSON.stringify(this.units)))
				this.units[currentTermBuild[0]][1] *= unit[1]
				unit[1] = 1 // reset coefficient
				console.log("AFT", JSON.parse(JSON.stringify(this.units)))

				if (unit[2] === -1) {
					// constant value
					// exponent is already one
					// constant value of 1 (multiplication factor of 1 is not needed)
					console.log("CONSTANT", i)
					this._deserviceUnit(i)
				}

				// try to find exact bases in currentTermBuild, if any, merge by raising exponents
				// e.g. 10ab *a can be merged to 10(a^2)b
				// this only applies to algebraic terms with a constant exponent
				if (typeof unit[2] === "string" && typeof unit[3] === "number") {
					// constant exponent (algebraic base)
					var manageToMerge = false;
					for (let j = 0; j < currentTermBuild.length; j++) {
						var unitPartOfLikeTerm = this.units[currentTermBuild[j]];
						if (typeof unitPartOfLikeTerm[3] === "number" && unitPartOfLikeTerm[2] === unit[2]) {
							unitPartOfLikeTerm[3] += unit[3];

							// check if poewrs cancel each other out, i.e. anything raised to the power of 0 is a constant
							if (unitPartOfLikeTerm[3] === 0) {
								// change it to a constant
								console.log("EXPO CANCELLED", JSON.parse(JSON.stringify(unitPartOfLikeTerm)))
								unitPartOfLikeTerm[2] = -1; // represents a constant
								unitPartOfLikeTerm[3] = 1; // reset exponent to 1, else when applied, coeff will be 1
								console.log("EXPO AFTER", JSON.parse(JSON.stringify(unitPartOfLikeTerm)))
							}

							// found matching, deservice unit
							this._deserviceUnit(i)
							manageToMerge = true; // set state
							break; // exit control loop
						}
					}

					if (manageToMerge === false) {
						// push it to currentTermBuild, did not manage to merge
						currentTermBuild.push(i)
					}
				} else {
					// add it to like terms, no chance of merging with another term (i.e. different bases, non-constant exponent)
					currentTermBuild.push(i) // should have a leading plus operation inside currentTermBuild (i.e. currentTermBuild.length >= 1)
				}
			}
		}

		if (currentTermBuild.length >= 1) {	
			// push into likeTerms
			likeTerms.push(currentTermBuild)
		}

		console.log("LIKETERMS", JSON.parse(JSON.stringify(this.units)), JSON.parse(JSON.stringify(likeTerms)))

		// start doing the addition & subtraction operation on EXTRACTED like terms
		var arithResult = [likeTerms.pop()] // all the terms in likeTerms will end up here (indices only)
		for (let i = likeTerms.length -1; i >= 0; i--) {
			// start from the end since lesser shifting operations this way
			var leftoperand = likeTerms[likeTerms.length -1].map(idx => this.units[idx])
			var foundMatching = false; // state
			for (let j = 0; j < arithResult.length; j++) {
				// iterate thorugh merged resuls
				var rightoperand = arithResult[j].map(idx => this.units[idx])

				console.log("TESTING MATCH", likeTerms[likeTerms.length -1], arithResult[j])
				if (this._sameLikeTerms(leftoperand, rightoperand)) {
					// same term, can merge (modify the one that has yet to been pushed to result, leftoperand)
					console.log("MATCH FOUND", leftoperand[0][1], rightoperand[0][1])
					leftoperand[0][1] += rightoperand[0][1]

					if (leftoperand[0][1] === 0) {
						// empty, deservice it
						// remove the built unit in arithResult too
						console.log("EMPTY", JSON.parse(JSON.stringify(arithResult)), j)
						this._deserviceUnit(...likeTerms[likeTerms.length -1], ...arithResult[j]) // deservice both left and right operands (they cancel each other out)
						arithResult.splice(j, 1)
					} else {
						// overwrite pushed unit (after deservicing pushed unit)
						this._deserviceUnit(...arithResult[j])
						arithResult[j] = likeTerms[likeTerms.length -1]
					}

					// remove unit
					likeTerms.pop();

					// quit finding
					foundMatching = true
					break
				}
			}

			if (!foundMatching) {
				// no match found, push otherwise
				arithResult.push(likeTerms.pop())
			}
		}

		// determine fractions, same denominators can merge, if not ignore
		// use arithResult to sniff out fractions
		console.log("FLAG D", JSON.parse(JSON.stringify(this.units)))
		console.log(this.units, "SNIFFED OUT ARITH", arithResult)

		// do addition, subtraction on constants
		var constantUnitIdx; // store idx of constant unit (for reference)
		console.log("PRE OP", JSON.parse(JSON.stringify(this.units)))
		for (let i = 0; i < this.units.length; i++) {
			var unit = this.units[i];
			if (unit[4] !== 1) {
				continue; // de-serviced; work with only values
			}

			if (unit[2] === -1 && unit[0] === 1 && typeof unit[3] === "number") {
				// constant (exponent is also not variable), only applies to addition operation
				if (constantUnitIdx == null) {
					// store the current pointer as a refernce for the constant element
					constantUnitIdx = i

					// flatten exponents (constant exponent)
					unit[1] **= unit[3]
					unit[3] = 1; // reset exponent

					console.log("FOUND", constantUnitIdx)

					continue; // continue with loop
				} else {
					// perform add operation on leftoperand and rightoperand
					var leftoperand = this.units[constantUnitIdx]
					this.units[constantUnitIdx][1] += unit[1] **unit[3] // constant term (right operand, exponent too)
					console.log("ADDED", unit)

					// deservice unit (rightoperand)
					this._deserviceUnit(i)
				}
			}
		}

		console.log("FINAL", this.units)
		return this; // chaining purposes
	}

	simplify() {
		// simplify what is going on in parethesis first


		// sniff out all the multiplication operations, including within parenthesis
		// important to carry out the operations from left to right, ignores for parenthesis for now
		var initLen = this.units.length;
		var removalOffset = 0; // units removed will contribute to this count
		for (let i = 0; i < initLen; i++) {
			var unitIdx = i - removalOffset;
			var unit = this.units[unitIdx];

			if (unitIdx > 0 && unit[4] === 1 && unit[0] === 3) {
				// only operate on units who represent values and not parenthesis demarcations
				// AND whose unit is a multiplication operation
				// right operand
				var success = this._multAdajcent(unitIdx - 1, unitIdx, true);
				if (success) {
					removalOffset++;
				}
			}
		}

		// start expanding from the innermost parenthesis group
		// left to right order does not matter, should proceed from right to left
		var lftFindOpenPtr = null; // will be null when parenthesis groups are escaped (for nested findings)
		var unitsToPurge = []; // array of unit indices to purge (contains units for parenthesis demarcation)
		for (let unitIdx = 0; unitIdx < this.units.length; unitIdx++) {
			var unit = this.units[unitIdx];
			if (unit[4] === 3) {
				// close parenthesis, back track to find the open parenthesis
				var backTrackPtr = lftFindOpenPtr ?? unitIdx; // if no pointer reference stored, use unitIdx (current indication of where close parenthesis is)
				for (let j = backTrackPtr - 1; j >= 0; j--) {
					if (this.units[j][4] === 2 && this.units[j][0] <= 4) {
						// matching open parenthesis, DONT execute on exponents parenthesis groups
						lftFindOpenPtr = j;

						// carry out operation here
						var openParenthesis = this.units[j];

						// simplify contents of parenthesis
						this._simplifyParenthesis(j +1, unitIdx -1)

						// expand parenthesis
						var factor = openParenthesis[1]; // coefficient (e.g. -1 if raw input was '-(x + 1)')
						var hasComplexFactor = false
						if (openParenthesis[0] === 3) {
							// multiply with previous unit (should have been simplified to one multiplication term in front by .clean())
							hasComplexFactor = true
							unitsToPurge.push(j -1) // remove factor
						}

						// expand factors into contents of parenthesis group
						for (let k = j +1; k < unitIdx; k++) {
							// +1 to exclude open parenthesis and < unitIdx to exclude close parenthesis
							this.units[k][1] *= factor

							// multiply complex factor
							if (hasComplexFactor) {
								this._multAdajcent(k, j -1, false) // reverse order since we want to modify right operand (contents of whats inside the parenthesis)
							}
						}

						// remove brackets
						unitsToPurge.push(j)
						unitsToPurge.push(unitIdx)

						break
					}
				}
			} else if (unit[4] === 2) {
				// met a open parenthesis, do nothing but reset leftPointer reference in order to reach this open parenthesis later on
				lftFindOpenPtr = null; // reset pointer (discard reference to previously stored open parenthesis)
			}
		}

		// process units to be purged (parenthesis demarcations)
		// sort them first
		ArraySort.quickSort(unitsToPurge, 0, unitsToPurge.length -1) // sort units first, so greatest indices are removed without any shifting for indices that come before
		for (let i = unitsToPurge.length -1; i >= 0; i--) {
			this.units.splice(unitsToPurge[i], 1) // include removalOffset
		}

		// there should be no brackets now
		// and no more multiplication units

		// start doing addition and subtraction
		var initLen = this.units.length
		var removalOffset = 0; // counter for units removed
		var isFirstUnitOfScope = true;
		for (let unitIdx = 0; unitIdx < initLen; unitIdx++) {
			var unit = this.units[unitIdx -removalOffset]
			if (unit[4] === 2 || unit[4] === 3 || unit[4] === 4) {
				// parenthesis demarcation OR deserviced unit
				// check for this first, if true, continuing skiping next unit
				isFirstUnitOfScope = true
				continue // move on to next next unit
			} else if (isFirstUnitOfScope && unit[4] !== 4) {
				// no operations on this unit (unit is IN service)
				isFirstUnitOfScope = false; // toggle it false
			}

			if (unitIdx > 0 && unit[0] === 1) {
				var loIdx = this._findLeftOperandWithSameBaseAndExpoWithinSameScope(unitIdx -removalOffset)
				if (loIdx == null) {
					// no valid left operand, CANT !loIdx since 0 is a falsey value
					continue; // continue with next token
				}

				var success = this._addAdjacent(loIdx, unitIdx -removalOffset, true)

				if (success) {
					removalOffset++;
				}
			}
		}

		// ensure all exponents have been factored in
		for (let i = 0; i < this.units.length; i++) {
			var unit = this.units[i]

			if (unit[4] === 1 && unit[2] === -1 && unit[3] > 1) {
				// is a constant, ad has a greater than 1 exponent value
				unit[1] **= unit[3]
				unit[3] = 1 // reset exponent
			}
		}

		// clean up all the deserviced units
		this._cleanupDeserviceUnits()
	}

	factorise() {

	}

	completeTheSquare() {
		
	}

	*parenthesisGroup() {
		// generator function, returns [startIdx, endIdx] of parenthesis groups, inclusive of parenthesis demarcation units

		// start from innermost parenthesis group
		// proceeds from inner-most left operator
		var lftFindOpenPtr = null; // will be null when parenthesis groups are escaped (for nested findings)
		for (let unitIdx = 0; unitIdx < this.units.length; unitIdx++) {
			var unit = this.units[unitIdx]
			if (unit[4] === 3) {
				// close parenthesis, back track to find the open parenthesis
				var backTrackPtr = lftFindOpenPtr ?? unitIdx // if no pointer reference stored, use unitIdx (current indication of where close parenthesis is)
				for (let j = backTrackPtr -1; j >= 0; j--) {
					if (this.units[j][4] === 2) {
						// matching open parenthesis
						lftFindOpenPtr = j

						// carry out operation here
						yield [j, unitIdx]
						break
					}
				}
			} else if (unit[4] === 2) {
				// met a open parenthesis, do nothing but reset leftPointer reference in order to reach this open parenthesis later on
				lftFindOpenPtr = null; // reset pointer (discard reference to previously stored open parenthesis)
			}
		}
	}

	*hardLookupParenthesisGroup() {
		// always refreshes the index, ONLY use this if parenthesis demarcations are being removed
		// will ignore exponent brackets
		var running = true
		while (running) {
			var found = false
			var start, end;

			var lftFindOpenPtr = null; // will be null when parenthesis groups are escaped (for nested findings)
			for (let unitIdx = 0; unitIdx < this.units.length; unitIdx++) {
				var unit = this.units[unitIdx]
				if (unit[4] === 3 && typeof unit[3] === "number" && unit[3] >= 1) {
					// close parenthesis, back track to find the open parenthesis
					var backTrackPtr = lftFindOpenPtr ?? unitIdx // if no pointer reference stored, use unitIdx (current indication of where close parenthesis is)
					for (let j = backTrackPtr -1; j >= 0; j--) {
						if (this.units[j][4] === 2 && this.units[j][0] !== 5) {
							// matching open parenthesis
							lftFindOpenPtr = j

							// carry out operation here
							found = true
							start = j
							end = unitIdx

							break
						}
					}
				} else if (unit[4] === 2 && typeof unit[3] === "number" && unit[3] >= 1) {
					// met a open parenthesis, do nothing but reset leftPointer reference in order to reach this open parenthesis later on
					lftFindOpenPtr = null; // reset pointer (discard reference to previously stored open parenthesis)
				}
			}

			if (found) {
				found = false
				yield [start, end]
			} else {
				running = false
				break
			}
		}
	}

	buildRepr() {
		// build a string representation based on this.units

		// get an array of like terms segregated by plus/minus operations (fractions declaration ONLY)
		var fractionReprSlice = []; // element schema: [[leftoperandStartIdx, leftoperandEndIdx], [rightoperandStartIdx, rightoperandEndIdx]]; indices are INCLUSIVE
		for (let i = 0; i < this.units.length; i++) {
			var unit = this.units[i];

			if ((unit[4] === 1 || unit[4] === 2) && typeof unit[3] === "number" && unit[3] < 0) {
				// only sniff out for fraction possibility on numbers and start parenthesis
				var leftoperandStartIdx = -1;
				var leftoperandEndIdx = i -1;
				var rightoperandStartIdx = i;
				var rightoperandEndIdx = -1;

				// look behind to get the left operand
				var pgIdx = 0;
				for (let j = i -1; j >= 0; j--) {
					var prevUnit = this.units[j];
					if (prevUnit[4] === 3) {
						// close parenthesis index, increment pgIdx until it reaches zero (decremented by stumbling on an open parenthesis)
						pgIdx++;
					} else if (prevUnit[4] === 2) {
						// start parenthesis index
						pgIdx--;
					}

					if (pgIdx === 0) {
						leftoperandStartIdx = j; // inclusive
						break
					}
				}

				// look forward to get startingIndex now
				pgIdx = 0; // reset pgIdx
				for (let k = i; k < this.units.length; k++) {
					// start from i since division operation is on the right operand 
					var supUnit = this.units[k];

					if (supUnit[4] === 2) {
						// start parenthesis index, increment pgIdx until it reaches zero (decremented by stumbling on a close parenthesis)
						pgIdx++;
					} else if (supUnit[4] === 3) {
						// close parenthesis index
						pgIdx--;
					}

					if (pgIdx === 0) {
						rightoperandEndIdx = k; // inclusive
						break
					}
				}

				fractionReprSlice.push([[leftoperandStartIdx, leftoperandEndIdx], [rightoperandStartIdx, rightoperandEndIdx]])
			}
		}


		var r = ""
		var scopeIdx = 0; // scopeIdx to globally uniquely idenitify scope within equation
		var indentDepth = 0; // increments whn approaching an open parenthesis, decrements when encountering a close parenthesis
		for (let unitIdx = 0; unitIdx < this.units.length; unitIdx++) {
			var unit = this.units[unitIdx]

			if (unit[4] === 4) {
				// deserviced unit, aka empty unit, ignore
				continue
			}

			// look forward to spot for fraction representation possibilities
			var latexPrefixWrap = "";
			var latexSuffixWrap = "";
			var reversePolarity = false;
			var needPrefix = true;
			if (fractionReprSlice.length > 0) {
				for (let j = 0; j < fractionReprSlice.length; j++) {
					var fractionPtr = fractionReprSlice[j];

					if (unitIdx >= fractionPtr[1][0] && unitIdx <= fractionPtr[1][1]) {
						// right operand (aka denominator)
						reversePolarity = true; // negate exponents and coefficients
					}

					if (unitIdx === fractionPtr[0][0]) {
						// start of left operand
						latexPrefixWrap = "\\frac{"
					} else if (unitIdx === fractionPtr[1][0]) {
						// start of right operand
						latexPrefixWrap = "{"
						needPrefix = false;
					}

					if (unitIdx === fractionPtr[0][1]) {
						// end of left operand
						latexSuffixWrap = "}"
					} else if (unitIdx === fractionPtr[1][1]) {
						// end of right operand
						latexSuffixWrap = "}"

						// get new element
						fractionPtr = fractionReprSlice.splice(j, 1);
					}

					if (latexPrefixWrap.length === 0 && latexSuffixWrap.length === 0) {
						break; // found index
					}
				}
			}

			// determine prefix
			var prefix = "";
			if (scopeIdx > 0 && unit[0] === 1 && (unit[4] === 1 || unit[4] === 2)) {
				// only has prefix for plus, minus arithmetic operations and on terms that are values and open parenthesis
				prefix = unit[1] > 0 ? "+" : ""; // no need negative sign since coeff will include
			} else if (unit[0] === 3 && unit[4] === 1 && unit[1] !== 1) {
				// multiplication on term that is not 1 (do not to show sign for 1 since anything multiply by 1 is just itself)
				prefix = "*"
			}

			// coefficient
			var coeff = unit[1];
			if (unit[2] !== -1 && Math.abs(coeff) === 1) {
				// no need to show coefficient for factors (constants need to show)
				coeff = unit[1] < 0 ? "-" : "";
			}
			if (reversePolarity && indentDepth === 0 && typeof coeff === "number" && (unit[2] === -1 || typeof unit[2] === "string")) {
				// flip the coeff for constants and algebraic terms (only for root terms not enclosed by parenthesis)
				coeff = 1 /coeff
			}

			// base
			var base = "";
			if (typeof unit[2] === "string") {
				// variable
				base = unit[2]
			}

			// handle parenthesis (and resetScopeIdx)
			var parenthesisOpen = "";
			var parenthesisClose = "";
			var resetScopeIdx = true;
			if (unit[4] === 2) {
				// open parenthesis
				parenthesisOpen = "(";
				// resetScopeIdx = true;
			} else {
				resetScopeIdx = false;

				if (unit[4] === 3) {
					// close parenthesis
					parenthesisClose = ")";
				}
			}

			// exponent
			var exponent = "";
			if (unit[4] === 2) {
				// no need to display exponent, purely for calculations only

			} else {
				if (typeof unit[3] === "number" && ((reversePolarity && Math.abs(unit[3]) !== 1) || (!reversePolarity && unit[3] !== 1))) {
					// unit[3] may be null or 0, both are false values and would not pass the if statement
					exponent = `^{${unit[3] *(reversePolarity ? -1 : 1)}}`; // always wrap it in curly braces (conform to latex engine's renderer; so double digits or digits with negative signs prefix will not overflow)
				} else if (unit[3] instanceof AlgebraicParser) {
					console.log("EXPONENT CLASS", unit[3])
					if (reversePolarity && !unit[3].flipPolarity) {
						// have yet to flip polarity, do so
						unit[3].flipPolarity = true
						unit[3].applyPolarity()
					}

					exponent = `^{${unit[3].buildRepr()}}`
					if (reversePolarity && unit[3].flipPolarity) {
						unit[3].applyPolarity();
						unit[3].flipPolarity = false
					}
				}
			}

			// handle scope idx
			if (resetScopeIdx) {
				scopeIdx = 0;
			} else {
				scopeIdx++
			}

			// handle indentDepth
			if (unit[4] === 2) {
				// encountered open parenthesis, increment
				indentDepth++;
			} else if (unit[4] === 3) {
				// encountered close parenthesis, decrement
				indentDepth--;
			}

			r += `${prefix}${latexPrefixWrap}${coeff}${parenthesisOpen}${base}${exponent}${parenthesisClose}${latexSuffixWrap}`
		}

		return r.length === 0 ? "0" : r
	}
}

$(document).ready(e => {
	var testCaseCount = 0;
	var totalTestCaseCount = -1; // to be set
	// RUN_TESTCASES().then(payload => {
	// 	totalTestCaseCount = payload.length
	// 	for (let testcase of payload) {
	// 		try {
	// 			var input = testcase[0];
	// 			var output = testcase[1];

	// 			var result = new AlgebraicParser(input)
	// 				.tokenise()
	// 				.clean()
	// 				.simplifyTest()
	// 				.buildRepr();

	// 			if (result != output.trim().replaceAll(" ", "")) {
	// 				// doesn't match
	// 				return Promise.reject([new Error("Mismatch output"), input])
	// 			} else {
	// 				testCaseCount++; // increase
	// 			}
	// 		} catch (e) {
	// 			return Promise.reject([e, input])
	// 		}
	// 	}

	// 	return true;
	// }).catch(failed => {
	// 	if (failed) {
	// 		console.log("FAILED", failed[1], failed[0])
	// 	}

	// 	return false
	// }).then(r => {
	// 	if (!r) {
	// 		// not all test cases passed
	// 		console.log(`Passed ${testCaseCount}/${totalTestCaseCount}`)
	// 	} else {
	// 		console.log(`Passed all ${totalTestCaseCount} test cases!`)
	// 	}
	// })

	$("#user-input-test").on("input", e => {
		try {
			var d = new AlgebraicParser(e.target.value)

			d.tokenise().clean()

			var id = d.buildRepr()
			d.simplifyTest()
			var ad = d.buildRepr()
			// var roots = d.solveForRoots()

			// wrap renderers around raw result
			// id = katex.renderToString(id, {throwOnError: false})
			ad = katex.renderToString(ad, {throwOnError: false})

			$("#display-pp").html(id.length === 0 ? '&nbsp;' : id)
			$("#display-cp").html(ad.length === 0 ? '&nbsp;' : ad)
		} catch (e) {
			console.log(e)
			$("#display-pp").html(e.message)
		}
	})

	console.log("RUNNING")
	// var d = new AlgebraicParser("3x^4 + 3x^3 + x^2 - x -2").tokenise().clean();
	// var f = new AlgebraicParser("x^3 - 3x^2 + x + 5").tokenise().clean();
	var d = new AlgebraicParser("3x^3 - 6x^2 + 9x").tokenise().clean();
	var f = new AlgebraicParser("x^2 - 2x + 3x").tokenise().clean();
	var sylvesterMatrix = d.generateSylvesterMatrix(f);
	console.log(sylvesterMatrix)
	console.log(sylvesterMatrix, BaseQuestion.getDeterminant(sylvesterMatrix))
	BaseQuestion.getDeterminant([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
})