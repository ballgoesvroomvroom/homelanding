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
		container.className = "qty-counter-container"

		const decrBtn = document.createElement("button")
		decrBtn.className = "qty-decr-btn"
		decrBtn.innerHTML = "-"

		const incrBtn = document.createElement("button")
		incrBtn.className = "qty-incr-btn"
		incrBtn.innerHTML = "+"

		const fieldInp = document.createElement("input")
		fieldInp.className = "qty-inp"
		fieldInp.setAttribute("type", "number")
		fieldInp.setAttribute("min", 0)
		fieldInp.value = 1

		container.appendChild(decrBtn)
		container.appendChild(fieldInp)
		container.appendChild(incrBtn)

		return [container, fieldInp, decrBtn, incrBtn]
	}

	constructor(data = null) {
		/*
		 * data: [topicRoute, qty][], saved data from previous session, if exists preload it into this.cart map
		 */
		this.cart = new Map() // contains the mapping between the topic route and the quantity ordered

		if (data != null) {
			console.log(data)
			for (let i = data.length - 1; i >= 0; i--) {
				this.cart.set(...data[i])
				console.log(this.cart)
			}
		}
	}

	registerTopic(topicRoute, buyBtn) {
		/*
		 * topicRoute: string, e.g. "3.0" represents the route to obtain the topic
		 * buyBtn: DOM element (button), to have click events be registered
		 * handles the adding of cart of topics
		 * deals with changing the DOM and 'backend' logic (i.e. actually adding to cart and keeping track of the quantity counter)
		 */
		var initialiseState = true
		buyBtn.addEventListener("click", e => {
			if (initialiseState === false && this.cart.has(topicRoute)) {
				// already added to cart
				console.log('CONTAINS')
				return
			}

			// toggle initial state
			initialiseState = false

			// cart logic
			if (this.cart.has(topicRoute) === false) {
				// first time adding, NOT a pre-loaded data
				this.cart.set(topicRoute, 1)
			} // otherwise, use currently default since click event triggered for buy btn when previously added to cart (on refresh)

			// create cart visual entry
			var containerInCart = this.addToCart(topicRoute)
			var deleteBtn = containerInCart.getElementsByClassName("cart-trash-btn")[0]

			// change buy button to a quantity ticker (to be destroyed whenever item is removed out of cart i.e. qty === 0)
			var [container, fieldInp, decrBtn, incrBtn] = Session.createQuantityCounter()
			fieldInp.value = this.cart.get(topicRoute) // might have a pre-loaded value instead of default 1

			buyBtn.style.display = "none" // hide the buy button
			buyBtn.parentElement.appendChild(container)

			// save data
			this.saveToLocalStorage()

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

				// save data
				this.saveToLocalStorage()
			})
			incrBtn.addEventListener("click", e => {
				var c = this.cart.get(topicRoute)
				this.cart.set(topicRoute, c + 1)
				fieldInp.value = c + 1

				this.updateItemCartVisual(topicRoute, containerInCart) // update cart count

				// save data
				this.saveToLocalStorage()
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

				this.cart.set(topicRoute, c - 1)
				fieldInp.value = c - 1 // update input
				this.updateItemCartVisual(topicRoute, containerInCart) // update cart count

				// save data
				this.saveToLocalStorage()
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

				// save data
				this.saveToLocalStorage()
			})
		})

		if (this.cart.has(topicRoute)) {
			// already exists, simulate click
			buyBtn.click();
		}
	}

	addToCart(topicRoute) {
		/*
		 * topicRoute: string, e.g. "3.0" represents the route to obtain the topic
		 * will update visuals in the cart checkout page
		 * returns the container element (dom element, containing the columns and buttons)
		 */

		// update cart view in DOM
		var path = topicRoute.split(".")
		var type = path.length === 1 ? "ST" : "MO"
		var title = `${topicRoute} | `
		if (path.length === 1) {
			// standard
			title += DATA[parseInt(path[0]) - 1][1]
		} else {
			// mono, length 2
			title += DATA[parseInt(path[0]) - 1][3][parseInt(path[1])][1]
		}
		var qty = this.cart.get(topicRoute)
		var price = 5 * qty

		return this.addItemToCartVisuals(type, title, qty, price)
	}

	updateItemCartVisual(topicRoute, visualContainer) {
		/*
		 * topicRoute: string, e.g. "3.0" represents the individual indices ("." as delimiter) to obtain the data in DATA
		 * visualContainer: dom element (div container, in the cart checkout, i.e. <tr> element)
		 * takes in topicRoute and calculate the new quantity and total price
		 */

		if (this.cart.has(topicRoute) === false) {
			console.warn("[WARN]: attempting to update cart visuals with updated quantity failed.")
			return
		}

		var qty = this.cart.get(topicRoute)
		var price = `${qty * 5}`

		visualContainer.getElementsByTagName("td")[2].innerHTML = qty
		visualContainer.getElementsByTagName("td")[3].getElementsByTagName("span")[0].innerHTML = price

		// update the total summary too
		this.updateCartTotalVisuals()
	}

	updateCartTotalVisuals() {
		/**
		 * update visual elements in total cart summary
		 * called whenever there is a change to the cart's content, hence will toggle '.empty' class for #cart-content-container when cart.length is === 0
		 */
		var container = document.getElementById("cart-content-foot")
		var totalQty = 0
		for (let qty of this.cart.values()) {
			totalQty += qty
		}

		var totalPrice = Math.trunc(totalQty * 5 * 100) / 100
		var cols = container.getElementsByTagName("td")
		cols[1].innerHTML = totalQty
		cols[2].innerHTML = `SGD ${totalPrice}`

		if (totalQty === 0) {
			// empty cart, apply .empty style
			document.getElementById("cart-content-container").classList.add("empty")
		} else {
			document.getElementById("cart-content-container").classList.remove("empty")
		}
	}

	addItemToCartVisuals(type, title, qty, price) {
		/*
		 * adds the visual entrys to cart checkout
		 * returns the container (without any events binded)
		 */
		const cartContainer = document.getElementById("cart-content-body")

		const container = document.createElement("tr")

		const typeCol = document.createElement("td")
		typeCol.innerHTML = type

		const titleCol = document.createElement("td")
		titleCol.innerHTML = title

		const qtyCol = document.createElement("td")
		qtyCol.innerHTML = qty

		const priceCol = document.createElement("td")
		priceCol.className = "price-col"

		const priceSpan = document.createElement("span")
		priceSpan.innerHTML = price

		const deleteBtn = document.createElement("button")
		deleteBtn.className = "cart-trash-btn"
		deleteBtn.innerHTML = `<img src="/qriller_assets/trash_icon.svg">`

		priceCol.appendChild(priceSpan)
		priceCol.appendChild(deleteBtn)

		container.appendChild(typeCol)
		container.appendChild(titleCol)
		container.appendChild(qtyCol)
		container.appendChild(priceCol)
		cartContainer.appendChild(container)

		// update total summary
		this.updateCartTotalVisuals()

		return container
	}

	emptyCart() {
		/*
		 * called when cart is to be resetted
		 */
		this.cart.clear()

		this.updateCartTotalVisuals(); // update total summary

		this.saveToLocalStorage() // save to localStorage

		// un-hide back all the add buttons
		var addBtns = document.getElementsByClassName("add-to-cart-btn")
		var addBtnsLen = addBtns.length
		for (let i = 0; i < addBtnsLen; i++) {
			addBtns.item(i).style.removeProperty("display")
		}

		// remove all the qty input counters
		var qtyInpCounters = document.getElementsByClassName("qty-counter-container")
		var qtyInpCountersLen = qtyInpCounters.length
		for (let i = 0; i < qtyInpCountersLen; i++) {
			qtyInpCounters.item(0).remove()
		}

		// remove cart visuals
		var shoppingListEntries = document.getElementById("cart-content-body").getElementsByTagName("tr")
		var shoppingListEntriesLen = shoppingListEntries.length
		for (let i = 0; i < shoppingListEntriesLen; i++) {
			shoppingListEntries.item(0).remove()
		}
	}

	saveToLocalStorage() {
		/*
		 * saves this.cart into localstorage as a JSON array (so insert position still holds)
		 */
		var arr = []
		for (let [topic, qty] of this.cart) {
			arr.push([topic, qty])
		}

		localStorage.setItem("cartData", JSON.stringify(arr))
	}

	saveToServer() {
		/**
		 * formats the cart data and then sends it to the server
		 * calls fetch with the backend route and returns the fetch response
		 */

		// server accepts the unique code followed by the index in the format,
		// UNIQUECODE-INDEX
		// e.g. topicRoute = "1.0", serverCode = "TC001-0"
		// e.g. topicRoute = "1", serverCode = "TC001"
		if (this.cart.size === 0) {
			// nothing
			return new Promise((res, rej) => {
				rej("Empty cart.")
			})
		}

		var arr = []
		for (let [topic, qty] of this.cart) {
			var split = topic.split(".")
			var topicData = DATA[parseInt(split[0]) - 1]

			var uniqueCode = `${topicData[2]}`
			if (split.length === 2) {
				// a mono series
				uniqueCode += `-${split[1]}`
			}
			arr.push([uniqueCode, qty])
		}

		return fetch(`/api/qriller/cart/overwrite`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ 'suppliedArr': arr })
		})
	}
}

class Modal {
	constructor() {
		this.window = document.getElementById("modal-window")
		this.header = document.getElementById("modal-dialogue-header")
		this.details = document.getElementById("modal-dialogue-details")

		this.currentlyActive = false // state

		this.currentPendingConfirmationCallbackFunction = null // callback function to be binded
		document.getElementById("modal-dialogue-confirm-btn").addEventListener("click", e => {
			if (this.currentPendingConfirmationCallbackFunction) {
				this.currentPendingConfirmationCallbackFunction(true)
				this.currentPendingConfirmationCallbackFunction = null // remove reference
			}
		})
		document.getElementById("modal-dialogue-cancel-btn").addEventListener("click", e => {
			if (this.currentPendingConfirmationCallbackFunction) {
				this.currentPendingConfirmationCallbackFunction(false)
				this.currentPendingConfirmationCallbackFunction = null // remove reference
			}
		})
	}

	toggle() {
		this.currentlyActive = !this.currentlyActive
		this.window.classList.toggle("active")
	}

	resetPromptContents() {
		/*
		 * clear contents of header and details
		 */
		this.header.innerHTML = ""
		this.details.innerHTML = ""
	}

	showConfirmationPrompt(title, details) {
		/*
		 * title: string
		 * details: string
		 * returns a promise where chained value will be true on confirmation, false otherwise
		 */

		this.header.innerHTML = title
		this.details.innerHTML = details

		return new Promise(res => {
			this.currentPendingConfirmationCallbackFunction = res; // to be called
		})
	}
}

document.addEventListener("DOMContentLoaded", e => {
	const entriesContainer = document.getElementById("scrolltable-container")

	var preloadData = localStorage.getItem("cartData")
	if (preloadData != null) {
		preloadData = JSON.parse(preloadData)
	}
	const session = new Session(preloadData);

	const modal = new Modal()

	function resetCart() {
		/*
		 * triggered when shopping-cart-refresh-btn click event is triggered
		 * handles the confirmation prompt
		 */
		console.log("HELLO")
		if (modal.currentlyActive) {
			// attempt to open another modal
			return
		}

		modal.toggle() // show modal
		modal.showConfirmationPrompt("Confirm?", "You are about to reset your cart.").then(r => {
			if (r === true) {
				// empty cart
				session.emptyCart()
			} else {
				// no confirmation
				// empty modal prompt contents
				modal.resetPromptContents()
			}

			modal.toggle()
		})
	}

	function loadSelections() {
		/*
		 * builds the list view from DATA
		 * returns a mapping respective to the routes in DATA for the DOM containers
		 */
		var containerMappings = []

		for (let i = 0; i < DATA.length; i++) {
			const container = document.createElement("div")
			container.className = "topic-entry"

			// create the topic-entry-header
			const topicEntryHeader = document.createElement("div");
			topicEntryHeader.className = "topic-entry-header";

			const h2 = document.createElement("h2");
			h2.innerHTML = `${DATA[i][0]} | ${DATA[i][1]}`;

			const expandBtn = document.createElement("button");
			expandBtn.className = "topic-entry-expand-btn";
			expandBtn.innerHTML = "Expand";

			const addBtn = document.createElement("button");
			addBtn.className = "add-to-cart-btn";
			addBtn.textContent = "Add";

			topicEntryHeader.appendChild(h2);
			topicEntryHeader.appendChild(expandBtn);
			topicEntryHeader.appendChild(addBtn);

			const subTopicsTable = document.createElement("table");
			subTopicsTable.className = "sub-topics-table";
			const thead = document.createElement("thead");
			const tbody = document.createElement("tbody");

			const tableHeaderRow = document.createElement("tr");
			const topicCodeHeader = document.createElement("th");
			topicCodeHeader.innerHTML = "Topic Code";
			const topicTitleHeader = document.createElement("th");
			topicTitleHeader.innerHTML = "Topic Title";

			tableHeaderRow.appendChild(topicCodeHeader);
			tableHeaderRow.appendChild(topicTitleHeader);

			thead.appendChild(tableHeaderRow);

			// append to map
			var subtopicsContainerMappings = [];
			containerMappings.push([container, subtopicsContainerMappings])

			// build table rows for sub topic lists
			for (let j = 0; j < DATA[i][3].length; j++) {
				const topicRow = document.createElement("tr");
				const topicCodeCell = document.createElement("td");
				topicCodeCell.innerHTML = `${DATA[i][2]}-${DATA[i][3][j][0]}`;
				const topicTitleCell = document.createElement("td");
				topicTitleCell.innerHTML = `${DATA[i][3][j][1]}`;
				const addToCartCell = document.createElement("td");
				const addToCartBtn = document.createElement("button");
				addToCartBtn.className = "add-to-cart-btn";
				addToCartBtn.textContent = "Add";

				addToCartCell.appendChild(addToCartBtn);
				topicRow.appendChild(topicCodeCell);
				topicRow.appendChild(topicTitleCell);
				topicRow.appendChild(addToCartCell);
				tbody.appendChild(topicRow);

				// register buy event handler
				session.registerTopic(`${DATA[i][0]}.${DATA[i][3][j][0]}`, addToCartBtn)

				// append to map
				subtopicsContainerMappings.push(topicRow)
			}

			subTopicsTable.appendChild(thead);
			subTopicsTable.appendChild(tbody);

			container.appendChild(topicEntryHeader);
			container.appendChild(subTopicsTable);

			// add dropdown functionality
			expandBtn.addEventListener("click", e => {
				subTopicsTable.classList.toggle("active");
				if (subTopicsTable.classList.contains("active")) {
					expandBtn.innerHTML = "Shrink"
				} else {
					expandBtn.innerHTML = "Expand"
				}
			})

			// register buy event handler
			session.registerTopic(`${DATA[i][0]}`, addBtn)

			// add entire row container to DOM
			entriesContainer.appendChild(container)
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
				containerMappings[i][0].classList.remove("uninterested") // toggled ininterested with previous filter
				for (let j = 0; j < DATA[i][3].length; j++) {
					containerMappings[i][1][j].classList.remove("uninterested")
				}

				continue
			} else {
				// title is not interested, try applying the filters on the sub-topics
				var oneInterested = false // at least one is interested
				for (let j = 0; j < DATA[i][3].length; j++) {
					var subtopicTitle = DATA[i][3][j][1]
					if (subtopicTitle.toLowerCase().includes(modifiedQuery)) {
						oneInterested = true
						containerMappings[i][1][j].classList.remove("uninterested") // cannot assume it does not contain the class "uninterested" -- could be residue from previous filter
					} else {
						containerMappings[i][1][j].classList.add("uninterested")
					}
				}

				console.log("LOOPEY FINISHED", DATA[i][1], oneInterested)
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

	var searchBarInp = document.getElementById("searchbar-inp")
	var searchBarBtn = document.getElementById("searchbar-search-btn")
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

	// reset cart button
	document.getElementById("cart-reset-btn").addEventListener("click", e => {
		console.log("FIRST")
		resetCart()
	})

	// checkout button
	var errorMsgContainer = document.getElementById("checkout-msg-container")
	var errorMsgSpan = document.getElementById("checkout-msg")
	document.getElementById("checkout-btn").addEventListener("click", e => {
		if (session.cart.size === 0) {
			// empty cart
			errorMsgSpan.innerHTML = "Your cart is empty, kindly add something before checking out."
			errorMsgContainer.classList.add("active")
			return
		}

		session.saveToServer().then(r => {
			console.log("STATUS", r.status)
			if (r.status === 200) {
				// succcess
				return
			} else {
				return Promise.reject(`Failed to upload to cart with HTTP status ${r.status}`)
			}
		}).then(() => {
			// redirect user to /checkout page
			window.location.href = "/qriller/checkout"
		}).catch(errMsg => {
			// display error message
			errorMsgSpan.innerHTML = "Server failed to process checkout request, please try again; else reach out to help@qriller.com for near-immediate assistance."
			errorMsgContainer.classList.remove("active")
		})
	})
})