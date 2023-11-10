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

	console.log('CALLED')
}