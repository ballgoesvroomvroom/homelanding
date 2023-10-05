// globally exposed variable QUESTIONS stores questions
const PAPER_DIMEN = { // pixels
	"A4": 3508,
	"A5": 2480
}

// workbook style baseline properties
const QUESTION_HEIGHT = 250 // baseline height each question will take in workbook style; to be multipied by qnSpaceFactor
const QUESTION_COLUMN = 2 // paper will have 2 columns by default

$(document).ready(e => {
	const $selectors = {
		"body": $("body"),
		"questions-container": $("#questions-container"),
		"page-share-link": $("#page-share-link")
	}

	function buildQuestion(qnStr, latexEqnArr) {
		/*
		 * build questions where,
		 *	1. new line characters are converted from '\n' to '<br>'
		 *	2. populate inline questions (to be rendered by latex visual engine) into qnStr from latexEqnArr into respective placeholders (e.g. "%%0%% divides %%1%%")
		 *	2.1. proper html parsed and built by katex
		 */

		// replace new line characters to <br> tags
		qnStr = qnStr.replaceAll("\n", "<br>")

		// replace inline positions qnStr with built latex expr (final step since most sophiscated)
		for (let i = 0; i < latexEqnArr.length; i++) {
			qnStr = qnStr.replace(`%%${i}%%`, katex.renderToString(latexEqnArr[i], {throwOnError: false}))
		}

		return qnStr
	}

	function createNewPage($header, $footer) {
		/*
		 * creates and return a new page container (div tag with class 'page-container')
		 * returns [page container, content container within the page]
		 */
		const $container = $("<div>", {
			"class": "page-container"
		})

		const $contentContainer = $("<div>", {
			"class": "page-content-container"
		})

		$header.appendTo($container)
		$contentContainer.appendTo($container)
		$footer.appendTo($container)

		return [$container, $contentContainer]
	}

	function getPageHeader() {
		/*
		 * returns the header element to be re-used in every question page
		 */
		const $container = $("<div>", {
			"class": "page-header"
		})

		const $spanLeft = $("<span>", {
			"class": "page-header-left"
		})
		const $spanRight = $("<span>", {
			"class": "page-header-right"
		})

		$spanRight.text(`${QRILLER_CODE} | ${QRILLER_TITLE}`) // exposed global
		$spanLeft.appendTo($container)
		$spanRight.appendTo($container)

		return $container
	}

	function getPageFooter(pageCount) {
		/*
		 * pageCount: number, representing the page number to write
		 * returns the fpoter element to be re-used in every question page
		 */
		const $container = $("<div>", {
			"class": "page-footer"
		})

		const $hr = $("<hr>")
		const $span = $("<span>", {
			"class": "page-footer-count"
		})
		$span.text(pageCount)

		$hr.appendTo($container)
		$span.appendTo($container)

		return $container
	}

	function redrawPage(style, styleProp={}) {
		/*
		 * style: str, "workbook"|"classic"
		 * styleProp: {}, specific to the style used
		 *		"workbook"
		 *		- qnHtFactor (multiplies QUESTION_HEIGHT)
		 *		- qnColumn (questions will have 2 columns)
		 *		"classic"
		 *		- none
		 */

		// clear document
		document.body.innerHTML = ""

		// set style properties of page
		document.body.className = "workbook"

		switch (style) {
			case "workbook":
				// grid view

				// set default properties
				if (!('qnHtFactor' in styleProp)) {
					styleProp.qnHtFactor = 1
				}
				if (!('qnColumn' in styleProp)) {
					styleProp.qnColumn = QUESTION_COLUMN
				}

				// set column count for style sheet
				$selectors.body.attr("style", `--grid-columns: ${styleProp.qnColumn}`)

				// start creating new pages and streaming in questions
				var absQnIdx = 0; // absolute question index
				var pageCount = 0; // page count
				var qnHt = QUESTION_HEIGHT *styleProp.qnHtFactor // in pixels
				while (absQnIdx < QUESTIONS.length) {
					const $header = getPageHeader()
					const $footer = getPageFooter(++pageCount)

					var [$pageContainer, $contentContainer] = createNewPage($header, $footer)

					// append to DOM to get height
					$pageContainer.appendTo($selectors.body)
					var availHt = $pageContainer.height() -$header.height() -$footer.height()

					// set content container to height (relative)
					$contentContainer.css("height", `${availHt /$pageContainer.height() *100}%`)

					// apply grid styling
					$contentContainer.css("grid-template-rows", `repeat(${styleProp.qnColumn}, 1fr})`)

					// calculate the relative space each questions will take up to calculate the total questions we can fit in this page
					var relQnHt = qnHt /availHt
					var qnPerPage = Math.min(Math.floor(1 /relQnHt) *styleProp.qnColumn, QUESTIONS.length -absQnIdx) // math.min() for the last page scenario
					for (let j = 0; j < qnPerPage; j++) {
						// j = qnIdx
						// qnData: [qnStr, latexEqnArr]
						var qnData = QUESTIONS[absQnIdx]
						var qnStr = buildQuestion(...qnData) // returns a built string that can be plugged straight away (including latex expressions into html tags)

						var $qnContainer = $("<div>", {
							"class": "qn-container"
						})

						// $qnContainer.css("height", `${relQnHt *100}%`)

						var $pTag = $("<p>")
						$pTag.html(`${absQnIdx +1}. ${qnStr}`) // html to render

						// render outside of DOM first, then to be attached to the DOM structure - unsure of performance benefits if vice versa?
						$pTag.appendTo($qnContainer)
						$qnContainer.appendTo($contentContainer)

						absQnIdx++; // increment absolute counter
					}
				}
			case "classic":
				// list view
		}
	}

	// main entry function to be called during initialisation
	function main() {
		var shareLink = window.location.hostname +`/qriller/${QRILLER_ID}`
		console.log(shareLink)
		redrawPage("workbook")
	}

	// main entry
	main()
})