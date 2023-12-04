const TopicsDemo = [
	["Law of Indices", "(xy)^{n}*y^{m}"],
	["Factoring Univariate Polynomials", "12x-8=4(3x-2)"],
	["Factoring Multivariate Polynomials", "\\frac{4xy-7bx}{-2}=-\\frac{1}{2}x(4y-7b)"],
	["Solving Linear Equations", "7x+3b=0"],
	["Solving Systems of Linear Equations", "\\frac{1}{2}y=4x+11", "3y-10=5x"],
	["Solving Quadratic Equations", "x^2-20x+40=0"],
	["Solving Systems of Quadratic Equations", "y=13-4x^{2}", "2y^{2}=7x^{2}+11"],
	["Differentiating Univariate Polynomials (Chain rule)", "\\frac{\\partial}{\\partial x}[(2x^2+4)^{18}+(2x^2+4)^{6}]"]
]

let thread = new Promise((res, rej) => {
	document.addEventListener("DOMContentLoaded", res)
})

function katexOnload() {
	/**
	 * called by onload attribute in external katex script loader
	 */
	thread.then(() => {
		var generationContainer = document.getElementById("demo-generation-math-expression")
		var generationPTags = generationContainer.getElementsByTagName("p")

		var casDemoContainer = document.getElementById("demo-cas-math-expression")
		var casDemoDivTags = casDemoContainer.getElementsByClassName("slide-section-side-list-child-div")

		for (let i = 0; i < generationPTags.length; i++) {
			console.log(i)
			katex.render("2x^3 + x^2 + 13", generationPTags.item(i), {
				throwOnError: false
			})
		}

		for (let i = 0; i < casDemoDivTags.length; i++) {
			var divTags = casDemoDivTags.item(i).getElementsByTagName("div")
			if (divTags.length === 3) {
				var pTag = divTags[1].children[0]
				katex.render("x^2 + c", pTag, {
					throwOnError: false
				})
			}
		}
	})

	thread.then(() => {
		// build example cards
		var questionsScrolLContainer = document.getElementById("questions-horizontal-scroll-container")
		for (let i = 0; i < TopicsDemo.length; i++) {
			var d = TopicsDemo[i];

			// create new DOM elements
			var cardContainer = document.createElement("div")
			cardContainer.className = "question-example-card"

			var sampleContContainer = document.createElement("div")
			sampleContContainer.className = "question-samplecont-example-card"

			var detailsContainer = document.createElement("div")
			detailsContainer.className = "question-details-example-card"

			for (let j = 1; j < d.length; j++) {
				var katexPTag = document.createElement("p")
				sampleContContainer.appendChild(katexPTag)

				katex.render(d[j], katexPTag, {
					throwOnError: false
				})
			}

			var titlePTag = document.createElement("p")
			titlePTag.innerHTML = d[0]
			detailsContainer.appendChild(titlePTag)

			cardContainer.appendChild(sampleContContainer)
			cardContainer.appendChild(detailsContainer)

			// append card to DOM
			questionsScrolLContainer.appendChild(cardContainer)
		}
	})

	console.log('CALLED')
}