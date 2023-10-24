const DATA = [
	["1", "Indices", "TC001",
		[
			["0", "Laws of Indices Part I"],
			["1", "Laws of Indices Part II"],
			["2", "Laws of Indices Final Part"],
			["3", "Expressing Numbers in Standard Form"]
		]
	],
	["2", "Factorisation", "TC002",
		[
			["0", "Factoring Univariate Polynomials"],
			["1", "Factoring Univariate Polynomials with Exponents"],
			["2", "Factoring Multivariate Polynomials"],
		]
	],
	["3", "Quadratics", "TC003",
		[
			["0", "Solving Linear Equations"],
			["1", "Solving Systems of Linear Equations"],
			["2", "Solving Quadratic Equations by Factorisation"],
			["3", "Solving Quadratic Equations with the Quadratic Formula"],
			["4", "Solving Quadratic Equations by Completing the Square"],
			["5", "Solving Quadratic Equations Involving Fractions"],
			["6", "Solving Systems of Quadratic Equations"],
		]
	],
	["4", "Differentiation", "TC004",
		[
			["0", "Differentiating Univariate Polynomials (Power rule)"],
			["1", "Differentiating Univariate Polynomials (Product rule)"],
			["2", "Differentiating Univariate Polynomials (Quotient rule)"],
			["3", "Differentiating Univariate Polynomials (Chain rule)"],
			["4", "Differentiating Challenging Polynomials"],
		]
	]
]

class Session {
	/*
	 * keeps track of all things added to cart
	 * also responsible for formatting the final data to be sent to the backend
	 */
	static createQuantityCounter() {
		/*
		 * creates the DOM container as an input helper to key in quantity
		 * returns [container, input field, decrement btn, increment btn]
		 */
		const container = document.createElement("div")
		container.className = "add-qty-inp-container"

		const decrBtn = document.createElement("button")
		decrBtn.className = "add-qty-decr-btn"
		decrBtn.innerHTML = "-"

		const incrBtn = document.createElement("button")
		incrBtn.className = "add-qty-incr-btn"
		incrBtn.innerHTML = "+"

		const fieldInp = document.createElement("input")
		fieldInp.className = "add-qty-field-inp"
		fieldInp.setAttribute("type", "number")
		fieldInp.setAttribute("min", 0)
		fieldInp.value = 1

		container.appendChild(decrBtn)
		container.appendChild(fieldInp)
		container.appendChild(incrBtn)

		return [container, fieldInp, decrBtn, incrBtn]
	}

	constructor() {
		this.cart = new Map() // contains the mapping between the topic route and the quantity ordered
	}

	registerTopic(topicRoute, buyBtn) {
		/*
		 * topicRoute: string, e.g. "3.0" represents the route to obtain the topic
		 * buyBtn: DOM element (button), to have click events be registered
		 * handles the adding of cart of topics
		 * deals with changing the DOM and 'backend' logic (i.e. actually adding to cart and keeping track of the quantity counter)
		 */
		buyBtn.addEventListener("click", e => {
			if (this.cart.has(topicRoute)) {
				// already added to cart
				console.log('CONTAINS')
				return
			}

			// create cart visual entry
			var containerInCart = this.addToCart(topicRoute)
			var deleteBtn = containerInCart.getElementsByClassName("delete-btn")[0]

			// change buy button to a quantity ticker (to be destroyed whenever item is removed out of cart i.e. qty === 0)
			var [container, fieldInp, decrBtn, incrBtn] = Session.createQuantityCounter()
			buyBtn.style.display = "none" // hide the buy button
			buyBtn.parentElement.appendChild(container)

			fieldInp.addEventListener("keydown", e => {
				if (e.key === "+" || e.key === "-") {
					e.preventDefault()
					e.stopPropagation()
				}
			})
			fieldInp.addEventListener("change", e => {
				if (fieldInp.value.length === 0) {
					// empty, ignore
					fieldInp.value = this.cart.get(topicRoute)
					return
				}

				var c = parseInt(fieldInp.value)
				if (c <= 0) {
					// delete operation
					this.cart.delete(topicRoute) // remove entry in this.cart

					// remove qty counter DOM element
					container.remove();
					container = null, fieldInp = null, decrBtn = null, incrBtn = null; // remoev references

					// un-hide buy button
					buyBtn.style.removeProperty("display") // revert back to original value as defined in stylesheet

					// remove containerInCart references too
					containerInCart.remove()
					containerInCart = null

					// update total cart summary
					this.updateCartTotalVisuals()

					return
				}

				this.cart.set(topicRoute, c)
				this.updateItemCartVisual(topicRoute, containerInCart) // update cart count
			})
			incrBtn.addEventListener("click", e => {
				var c = this.cart.get(topicRoute)
				this.cart.set(topicRoute, c +1)
				fieldInp.value = c +1

				this.updateItemCartVisual(topicRoute, containerInCart) // update cart count
			})
			decrBtn.addEventListener("click", e => {
				var c = this.cart.get(topicRoute)
				if (c <= 1) {
					// delete operation
					this.cart.delete(topicRoute) // remove entry in this.cart

					// remove qty counter DOM element
					container.remove();
					container = null, fieldInp = null, decrBtn = null, incrBtn = null; // remoev references

					// un-hide buy button
					buyBtn.style.removeProperty("display") // revert back to original value as defined in stylesheet

					// remove containerInCart references too
					containerInCart.remove()
					containerInCart = null

					// update total cart summary
					this.updateCartTotalVisuals()

					return
				}

				this.cart.set(topicRoute, c -1)
				fieldInp.value = c -1 // update input
				this.updateItemCartVisual(topicRoute, containerInCart) // update cart count
			})
			deleteBtn.addEventListener("click", e => {
				// delete operation
				this.cart.delete(topicRoute) // remove entry in this.cart

				// remove qty counter DOM element
				container.remove();
				container = null, fieldInp = null, decrBtn = null, incrBtn = null; // remoev references

				// un-hide buy button
				buyBtn.style.removeProperty("display") // revert back to original value as defined in stylesheet

				// remove containerInCart references too
				containerInCart.remove()
				containerInCart = null

				// update total cart summary
				this.updateCartTotalVisuals()
			})
		})
	}

	addToCart(topicRoute) {
		/*
		 * topicRoute: string, e.g. "3.0" represents the route to obtain the topic
		 * will update visuals in the cart checkout page
		 * returns the container element (dom element, containing the columns and buttons)
		 */
		this.cart.set(topicRoute, 1)

		// update cart view in DOM
		var path = topicRoute.split(".")
		var type = path.length === 1 ? "ST" : "MO"
		var title = `${topicRoute} | `
		if (path.length === 1) {
			// standard
			title += DATA[parseInt(path[0]) -1][1]
		} else {
			// mono, length 2
			title += DATA[parseInt(path[0]) -1][3][parseInt(path[1])][1]
		}
		var qty = 1
		var price = "5.00"

		return this.addItemToCartVisuals(type, title, qty, price)
	}

	updateItemCartVisual(topicRoute, visualContainer) {
		/*
		 * topicRoute: string, e.g. "3.0" represents the individual indices ("." as delimiter) to obtain the data in DATA
		 * visualContainer: dom element (div container, in the cart checkout)
		 * takes in topicRoute and calculate the new quantity and total price
		 */

		if (this.cart.has(topicRoute) === false) {
			console.warn("[WARN]: attempting to update cart visuals with updated quantity failed.")
			return
		}

		var qty = this.cart.get(topicRoute)
		var price = `${Math.trunc(qty *5 *100) /100}`

		visualContainer.getElementsByClassName("qty-col")[0].innerHTML = qty
		visualContainer.getElementsByClassName("price-col")[0].innerHTML = price

		// update the total summary too
		this.updateCartTotalVisuals()
	}

	updateCartTotalVisuals() {
		var container = document.getElementById("total-summary")
		var totalQty = 0
		for (let qty of this.cart.values()) {
			totalQty += qty
		}

		var totalPrice = Math.trunc(totalQty *5 *100) /100
		container.getElementsByClassName("qty-col")[0].innerHTML = totalQty
		container.getElementsByClassName("totalprice-col")[0].innerHTML = `SGD ${totalPrice}`
	}

	addItemToCartVisuals(type, title, qty, price) {
		/*
		 * adds the visual entrys to cart checkout
		 * returns the container (without any events binded)
		 */
		const cartContainer = document.getElementById("shopping-list-summary")

		const container = document.createElement("div")
		container.className = "shopping-list-entry"

		const typeCol = document.createElement("p")
		typeCol.className = "type-col"
		typeCol.innerHTML = type

		const titleCol = document.createElement("p")
		titleCol.className = "title-col"
		titleCol.innerHTML = title

		const qtyCol = document.createElement("p")
		qtyCol.className = "qty-col"
		qtyCol.innerHTML = qty

		const priceCol = document.createElement("p")
		priceCol.className = "price-col"
		priceCol.innerHTML = price

		const actionContainer = document.createElement("div")
		actionContainer.className = "action-col"

		const deleteBtn = document.createElement("button")
		deleteBtn.className = "delete-btn"
		deleteBtn.innerHTML = `<img src="/static/trash_icon.svg">`

		actionContainer.appendChild(deleteBtn)

		container.appendChild(typeCol)
		container.appendChild(titleCol)
		container.appendChild(qtyCol)
		container.appendChild(priceCol)
		container.appendChild(actionContainer)
		cartContainer.appendChild(container)

		// update total summary
		this.updateCartTotalVisuals()

		return container
	}
}

document.addEventListener("DOMContentLoaded", e => {
	const topicChoiceSelectionContainer = document.getElementById("topics-choice-selection")

	const session = new Session();

	function loadSelections() {
		/*
		 * builds the list view from DATA
		 * returns a mapping respective to the routes in DATA for the DOM containers
		 */
		var containerMappings = []

		for (let i = 0; i < DATA.length; i++) {
			// build the container
			const container = document.createElement("div")
			container.className = "topic-element-container"

			const detailsContainer = document.createElement("div")
			detailsContainer.className = "topic-element-details-container"

			const dropdownBtn = document.createElement("button")
			dropdownBtn.className = "topic-element-dropdown-btn"

			const dropdownBtnImg = document.createElement("img")
			dropdownBtnImg.src = "/static/dropdown_collapsed_arrow_icon.svg"

			const topicPTag = document.createElement("p")
			topicPTag.innerHTML = `${DATA[i][0]} | ${DATA[i][1]}`

			const topicATCBtn = document.createElement("button")
			topicATCBtn.className = "topic add-btn"
			topicATCBtn.innerHTML = "ADD"

			const subtopicsContainer = document.createElement("div")
			subtopicsContainer.className = "subtopic-element-list-container"

			// add functionality
			dropdownBtn.addEventListener("click", e => {
				container.classList.toggle("expanded")
			})

			// maintain hierarchy
			dropdownBtn.appendChild(dropdownBtnImg)
			detailsContainer.appendChild(dropdownBtn)
			detailsContainer.appendChild(topicPTag)
			detailsContainer.appendChild(topicATCBtn)
			container.appendChild(detailsContainer)
			container.appendChild(subtopicsContainer)

			topicChoiceSelectionContainer.appendChild(container)

			// register buy event handler
			session.registerTopic(`${DATA[i][0]}`, topicATCBtn)

			// append to map
			var subtopicsContainerMappings = [];
			containerMappings.push([container, subtopicsContainerMappings])

			var subtopics = DATA[i][3]
			for (let j = 0; j < subtopics.length; j++) {
				const subtopicEleContainer = document.createElement("div")
				subtopicEleContainer.className = "subtopic-element-container"

				const subtopicPTag = document.createElement("p")
				subtopicPTag.innerHTML = `${DATA[i][0]}.${subtopics[j][0]} | ${subtopics[j][1]}`

				const subtopicATCBtn = document.createElement("button")
				subtopicATCBtn.className = "subtopic add-btn"
				subtopicATCBtn.innerHTML = "ADD"

				subtopicEleContainer.appendChild(subtopicPTag)
				subtopicEleContainer.appendChild(subtopicATCBtn)
				subtopicsContainer.appendChild(subtopicEleContainer)

				// register buy event handler
				session.registerTopic(`${DATA[i][0]}.${subtopics[j][0]}`, subtopicATCBtn)

				// append to map
				subtopicsContainerMappings.push(subtopicEleContainer)
			}
		}

		return containerMappings
	}

	function applyFilterToSelection(query, containerMappings) {
		/*
		 * query: string, search query
		 * containerMappings: [DOM, DOM[]][], respective mapping between the DOM representing the selection option in DATA
		 * takes in a search query and applies class name 'uninterested' in the DOM selection for items not matching search query
		 */
		var modifiedQuery = query.toLowerCase()
		for (let i = 0; i < DATA.length; i++) {
			var title = DATA[i][1]
			if (title.toLowerCase().includes(modifiedQuery)) {
				// skip entire branch of sub topics since main topic is relevant
				continue
			} else {
				var oneInterested = false // at least one is interested
				for (let j = 0; j < DATA[i][3].length; j++) {
					var subtopicTitle = DATA[i][3][j][1]
					if (subtopicTitle.toLowerCase().includes(modifiedQuery)) {
						oneInterested = true
					} else {
						containerMappings[i][1][j].classList.add("uninterested")
					}
				}

				if (oneInterested === false) {
					// none of its sub topics (let alone itself) are interested results
					containerMappings[i][0].classList.add("uninterested")
				}
			}
		}
	}

	function resetFilterOnSelection(containerMappings) {
		/*
		 * called to remove 'uninterested' class name in selection DOM elements
		 * that is, when search query input is empty (i.e. "", .length === 0)
		 */
		for (let i = 0; i < containerMappings.length; i++) {
			containerMappings[i][0].classList.remove("uninterested")
			for (let j = 0; j < containerMappings[i][1].length; j++) {
				containerMappings[i][1][j].classList.remove("uninterested")
			}
		}
	}

	var containerMappings = loadSelections()

	var searchBarInp = document.getElementById("search-query-inp")
	var searchBarBtn = document.getElementById("search-query-btn")
	searchBarInp.addEventListener("input", e => {
		if (searchBarInp.value.length === 0) {
			resetFilterOnSelection(containerMappings);
		} else {
			applyFilterToSelection(searchBarInp.value, containerMappings)
		}
	})
	searchBarBtn.addEventListener("click", e => {
		if (searchBarInp.value.length === 0) {
			resetFilterOnSelection(containerMappings);
		} else {
			applyFilterToSelection(searchBarInp.value, containerMappings)
		}
	})
})