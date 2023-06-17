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
		var a, b = Math.min(a, b), Math.max(a, b) // b should represent the bigger value
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
		console.log("UNITS", JSON.stringify(this.units))

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
				// move on to the next group; no need to re-order multiplication order on exponent groups
				continue
			}

			var closeParenthesis = this.units[endIdx]
			if (endIdx < this.units.length -1) {
				// not last unit, has units preceeding close parenthesis
				var alreadyHasFactorInfront = this.units[startIdx][0] === 3 // start parenthesis has a multiplication
				for (let unitIdx = endIdx +1; unitIdx < this.units.length; unitIdx++) {
					var superseedingUnit = this.units[unitIdx]

					if (superseedingUnit[0] === 3) {
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

	_multUnit(leftoperand, rightoperand, leftComplexExpoGroup, rightComplexExpoGroup) {
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

						}
					}
				}
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
		var result = [unit[0]]
		for (let i = 1; i < units.length; i++) {
			// start by multiplying the second unit with the first unit
			var rightoperand = units[i]
			for (let j = j; j < result.length; j++) {
				// list of candidates if they cannot be simplified farther

				var leftoperand = result[j]
				var result = this._multUnit(leftoperand[0], rightoperand[0], leftoperand[1], rightoperand[1]) // supply the exponent groups if any
			}
		}
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
		// firstPgIdx: integer, index of the first parenthesis group demarcation (inclusive)
		// secondPgIdx: integer, index of the second parenthesis group demarcation (inclusive)

		// extract out all the terms to be used as factors (in both groups)
		var groupFactors = [];
		for (let g = 0; g < 2; g++) {
			var currentFactor = [] // build factors here
			var factorList = []

			var startIdx = firstPgIdx *(1 -g) +secondPgIdx *g // firstPgIdx during first iteration
			var endIdx = firstPgCloseIdx *(1 -g) +secondClosePgIdx *g

			var exponentScope = 0; // if >= 1, will ignore all units, will be decremented by close parenthesis
			var exponentBuild = []; // build complex exponents here
			for (let i = startIdx +1; i < endIdx; i++) {
				var unit = this.units[i]
				if (unit[0] === 5 && unit[4] === 2) {
					// exponent open parenthesis group
					exponentScope = 1; // start scope so iteration knows to ignore it
					
					// push current base (unit) into factorList after retrieving the exponent group
				} else if (exponentScope >= 1 && unit[4] === 3) {
					// close parenthesis, and exponentScope >= 1, need to decrement

					// exponent scope
					if (exponentScope >= 1) {
						exponentScope--
					}

					if (exponentScope === 0) {
						// reached the end, closed exponent scope
						// push whatever was in exponent build into factorList
						// also push the unit representing the base
						factorList.push([currentFactor, exponentBuild])
					}

					// ignore this unit, continue
					continue
				} else if (exponentScope === 0 && unit[4] === 1) {
					if (unit[0] === 1) {
						// addition operation, a whole new factor by itself
						// push current factor (if any)
						if (currentFactor.length >= 1) {
							factorList.push([currentFactor]);
						}

						currentFactor = [unit]; // new factor
					} else if (unit[0] === 3) {
						// multiplication
						// add to current factor
						currentFactor.push(unit)
					}
				} else if (exponentScope >= 1) {
					// exponent content, push into exponentBuild, including parenthesis demarcations
					exponentBuild.push(unit)
				}
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
				var result = this._multUnits(...unit.splice(unit.length, 0, groupFactors[1][j])) // result would be an array

				group.slice(group.length, 0, ...result) // spread out array container
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

	simplifyTest() {
		this._applyExponents();
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
						this._deserviceUnit(j)
					}
				}
			}
		}

		// try to break non-exponent parenthesis groups (including expansion)
		// CODE HERE
		var closePgIdxMapping = {}; // create a mapping of parenthesis endings idx to their opening counterparts
		for (let [startIdx, endIdx] of this.parenthesisGroup()) {
			// create mapping entry
			closePgIdxMapping[endIdx] = startIdx;

			var openParenthesis = this.units[startIdx]
			if (openParenthesis[0] === 3) {
				// multiplication
				var factor = this.units[startIdx -1]
				if (factor[4] === 3) {
					// close parenthesis
					var previousOpenPgIdx = closePgIdxMapping[startIdx -1] // mapping works cause of how this.parenthisGroup behaves, it start the inner-most PG with left to right fashion
					var expandedGroup = this._multAdjacentParenthesis(previousOpenPgIdx, startIdx -1, startIdx, endIdx)
					this.units.splice(previousOpenPgIdx, endIdx -previousOpenPgIdx +1, expandedGroup)
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
			d.simplifyTest()
			var ad = d.buildRepr()
			// var roots = d.solveForRoots()

			$("#display-pp").html(id.length === 0 ? '&nbsp;' : id)
			$("#display-cp").html(ad.length === 0 ? '&nbsp;' : ad)
		} catch (e) {
			console.log(e)
			$("#display-pp").html(e.message)
		}
	})
})