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

class ParserError extends Error {
	name = "ParserError"
}

class AlgebraicParser {
	static operations = {
		"+": 1,
		"-": 1,
		"*": 3,
		"/": 4
	}
	static variableRegex = /[A-Za-z\u0391-\u03C9]+/ // a-z, A-Z, all the greek symbols
	static coeffRegex = /[\d.-]+/ // include the minus symbol to capture negative coefficients

	constructor(eqnStr) {
		this.raw = eqnStr.replaceAll(" ", "") // remove ALL whitespace
		this.tokens = [] // store tokens in order
		this.units = [] // parsed tokens goes here
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
			}

			// resume build token
			if ((!partialTokenOnlyConsistsOfToken && AlgebraicParser.operations[char] != null && partialToken.length > 0) || char === ")") {
				// push token into stream (unless token consists of operations)
				tokenStream.push(partialToken) // trim out all whitespaces

				// include operation in new partialToken
				partialToken = char

				// set partialTokenOnlyConsistsOfToken value to true
				partialTokenOnlyConsistsOfToken = char !== ")"
			} else if (char === "(") {
				// parenthesis demarcations (start)

				// determine if partialToken contains any operation, if does, simply use that operation on this parenthesis
				if (partialTokenOnlyConsistsOfToken) {
					partialToken += "("
				} else if (partialToken.length > 0) {
					// has coefficient infront, automatically becomes a * parenthesis
					// ensure is not simply a captured operation (one char), although can be simply a constant factor, e.g. n(a + b)

					// push token
					tokenStream.push(partialToken)

					// multiplication operator
					partialToken = "*("
				} else if (tokenStream.length >= 1) {
					// use previous token to determine what operation to apply on this parenthesis
					var prevToken = tokenStream[tokenStream.length -1]
					if ((prevToken.length >= 1) && (prevToken[prevToken.length -1] === "^" || prevToken[prevToken.length -1] === "(")) {
						// exponent  parenthesis or previous token was an adjacent parenthesis opening
						partialToken = "("
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
		}

		// trailing token
		if (partialToken.length > 0) {
			tokenStream.push(partialToken)
		}

		// build units based on tokens in tokenStream
		var units = []
		var localScopeIdx = 0; // will increment as long as is within same scope
		var expectingParenthesis = false; // will be toggled true when exponent has no value
		for (let tokenIdx = 0; tokenIdx < tokenStream.length; tokenIdx++) {
			var token = tokenStream[tokenIdx]

			if (token.length === 0) {
				throw new ParserError(`Empty token with idx: ${tokenIdx}\n${JSON.stringify(tokenStream)}`)
			}

			// determine operation
			var operation;
			if (token[0] === ")") {
				// end of parenthesis

				// check if there is any operation
				if (token.length > 1) {
					operation = AlgebraicParser.operations[token[1]]
					if (operation == null) {
						throw new ParserError(`Token [${token}] does not contain any operation preceeding the close parenthesis`)
					}
				}
			} else if (expectingParenthesis) {
				if (token[token.length -1] === "(") {
					expectingParenthesis = false; // reset value
					operation = 5 // exponents
				} else {
					// expected open parenthesis from previous token but no parenthesis
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
			}

			// identify base and exponent
			var base, exponent;
			var caretIdx = token.indexOf("^");
			if (caretIdx !== -1) {
				// has an exponent
				var exponentSection = token.slice(caretIdx +1)
				if (exponentSection.length === 0) {
					expectingParenthesis = true
					exponent = null; // set to null pointer in unit
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

			// identify type
			var type = 1
			if (token[token.length -1] === "(") {
				type = 2 // open parenthesis demarcation
			} else if (token[0] === ")") {
				type = 3 // close parenthesis demarcation
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
			units.push([
				operation, coeff, variable, exponent, type
				])
		}


		this.units = units
		this.variables = Object.keys(variableStore) // store the characters that are variables here

		return this // for chaining purposes
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
				// move on to the next group
				continue
			}

			var closeParenthesis = this.units[endIdx]
			if (endIdx < this.units.length -1) {
				// not last unit, has units preceeding close parenthesis
				var alreadyHasFactorInfront = this.units[startIdx][0] === 3 // start parenthesis has a multiplication
				for (let unitIdx = endIdx +1; unitIdx < this.units.length; unitIdx++) {
					var superseedingUnit = this.units[unitIdx]

					if (superseedingUnit[0] === 3 ) {
						// multiplication, move it forward to start of parenthesis
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

		if (leftoperand[2] === -1 && leftoperand[3] != null) {
			// constants
			// evaluate number with exponents, reset it to 1
			leftoperand[1] **= leftoperand[3];
			leftoperand[3] = 1;
		} else if (leftoperand[3] == null) {
			// exponents are in brackets
			return false;
		}
		if (rightoperand[2] === -1 && rightoperand[3] != null) {
			// constants
			rightoperand[1] **= rightoperand[3];
			rightoperand[3] = 1;
		} else if (rightoperand[3] == null) {
			// exponents are in brackets
			return false;
		}

		// discard right term
		// exponents have been factored into their coefficients value (index 1)
		var sameTerm = leftoperand[2] === rightoperand[2];
		if (sameTerm && leftoperand[2] != -1) {
			// algebraic terms
			leftoperand[1] *= rightoperand[1];
			leftoperand[3] += rightoperand[3]; // sum the powers
		} else if (sameTerm) {
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

	_findLeftOperand(unitIdx) {
		// unitIdx: number, denotes index of right operand
		// backtrack to find unit that is NOT deserviced (empty)
		for (let i = unitIdx -1; i >= 0; i--) {
			if (this.units[i][4] !== 4) {
				return i
			}
		}
	}

	_findLeftOperandWithSameBaseAndExpo(unitIdx) {
		// unitIdx: number, denotes index of right operand
		// backtrack to find unit that has the same base AND is NOT deserviced (empty)
		var unit = this.units[unitIdx];
		var scope = 0; // denotes scope level
		for (let i = unitIdx -1; i >= 0; i--) {
			if (unit[4] === 3) {
				scope++
			} else if (unit[4] === 2 && scope === 0) {
				// already reached boundary of parenthesis group, no more match
				return; // empty object
			} else if (unit[4] === 2) {
				// decrement scope
				scope--
			} else if (scope > 0) {
				// not within scope
				continue; // do nothing
			} else if (unit[2] === this.units[i][2] && unit[3] === this.units[i][3] && this.units[i][4] !== 4) {
				return i
			}
		}
	}

	_deserviceUnit(unitIdx) {
		// renders unit at unitIdx (index) empty
		// empty (or deserviced) units are present as junk, but serve no purpose to the representation of work
		this.units[unitIdx][4] = 4 // 4 for deserviced units
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

	simplify() {
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
				var loIdx = this._findLeftOperandWithSameBaseAndExpo(unitIdx -removalOffset)
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
				// is a constant, and has a greater than 1 exponent value
				unit[1] **= unit[3]
				unit[3] = 1 // reset exponent
			} else if (unit[4] === 1 && unit[2] !== -1 && unit[3] === 0) {
				// unit stills representing a constant, remove variable terms
				unit[2] = -1 // unit now represent constant term
			}
		}

		// clean up all the deserviced units
		this._cleanupDeserviceUnits()
	}

	factorise() {

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

	buildRepr() {
		// build a string representation based on this.units
		var r = ""
		var scopeIdx = 0; // scopeIdx to globally uniquely idenitify scope within equation
		for (let unitIdx = 0; unitIdx < this.units.length; unitIdx++) {
			var unit = this.units[unitIdx]

			if (unit[4] === 4) {
				// deserviced unit, aka empty unit, ignore
				continue
			}

			// determine prefix
			var prefix = "";
			var resetScopeIdx = false; // if true, will reset scopeIdx
			if (unit[1] < 0) {
				prefix = "-"
			} else if (scopeIdx === 0 && unit[4] === 2) {
				// parenthesis start demarcation
				prefix = "("
				resetScopeIdx = true
			} else if (scopeIdx > 0) {
				// if not, prefix remain empty
				switch (unit[0]) {
					case 1:
						prefix = "+"
						if (unit[4] === 2) {
							// if type (4th index of unit] === 2, is an open parenthesis demarcation
							// includes open parenthesis
							prefix += "("

							// reset scopeIdx
							resetScopeIdx = true
						} else if (unit[4] === 3) {
							// close parenthesis
							prefix = ")"
						}

						break
					case 3:
						if (unit[4] == 2) {
							// no need for asterisk operation
							prefix = "("

							// reset scopeIdx
							resetScopeIdx = true
						} else if (unit[4] === 3) {
							// close parenthesis
							prefix = ")"
						} else {
							prefix = "*"
						}
						break
					case 4:
						prefix = "/"
						break
					case 5:
						prefix = "^("

						// reset scopeIdx
						resetScopeIdx = true;
						break
				}
			}

			// determine coeff
			var coeff = ""
			if (unit[4] === 1 && (unit[2] === -1 || Math.abs(unit[1]) > 1)) {
				// unit type is a value, not parenthesis (2 & 3)
				// constant, coeff is important OR has coefficient for an algebraic term
				coeff = Math.abs(unit[1])
			}

			// determine base
			var variableChoice = "" // empty by default as constant is already represented by the 'coefficient'
			if (typeof unit[2] === "string") {
				variableChoice = unit[2]
			} else {
				// function names
			}

			// determine exponent
			var exponent = "";
			if (unit[3] && unit[3] > 1) {
				// unit[3] may be null or 0, both are false values and would not pass the if statement
				exponent = `^${unit[3]}`
			}

			// handle scope idx
			if (resetScopeIdx) {
				scopeIdx = 0;
			} else {
				scopeIdx++
			}

			r += `${prefix}${coeff}${variableChoice}${exponent}`
		}

		return r.length === 0 ? "0" : r
	}
}

$(document).ready(e => {
	$("#user-input-test").on("input", e => {
		try {
			var d = new AlgebraicParser(e.target.value)

			d.tokenise().clean()

			var id = d.buildRepr()
			d.simplify()
			var ad = d.buildRepr()
			var roots = d.solveForRoots()

			$("#display-pp").html(id.length === 0 ? '&nbsp;' : id +", " +roots)
			$("#display-cp").html(ad.length === 0 ? '&nbsp;' : ad)
		} catch (e) {
			console.log(e)
			$("#display-pp").html(e.message)
		}
	})
})