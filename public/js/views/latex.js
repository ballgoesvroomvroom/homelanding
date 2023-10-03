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
		for (let i = 0; i < qnData[1].length; i++) {
			qnStr = qnStr.replace(`%%${i}%%`, katex.renderToString(qnData[1][i], {throwOnError: false}))
		}

		return qnStr
	}

	function createNewPage(ht) {
		/*
		 * creates and return a new page container (div tag with class 'page-container')
		 * returns page container, and amount of space (height, in px) that can be used
		 */
		const $container = $("<div>", {
			"class": "page-container"
		})
		$container.css("height", ht)

		const $header = $("<div>", {
			"class": "page-header"
		})
		$header.appendTo($container)

		const $footer = $("<div>", {
			"class": "page-footer"
		})
		$footer.appendTo($container)

		return [$container, ht -$header.height() -$footer.height()]
	}

	function getPageHeader() {
		/*
		 * returns the header element to be re-used in every question page
		 */
		return $("<div>", {
			"class": "page-header"
		})
	}

	function getPageFooter() {
		/*
		 * returns the fpoter element to be re-used in every question page
		 */
		return $("<div>", {
			"class": "page-footer"
		})
	}

	function redrawPage(style, dimen, styleProp) {
		/*
		 * style: str, "workbook"|"classic"
		 * dimen: str, "A4" for A4 (3508px), "A5" for A5 (2480px)
		 * styleProp: {}, specific to the style used
		 *		"workbook"
		 *		- qnHtFactor (multiplies QUESTION_HEIGHT)
		 *		- qnColumn (questions will have 2 columns)
		 *		"classic"
		 *		- none
		 */
		var pageHt = PAPER_DIMEN[dimen]
		switch (style) {
			case "workbook":
				// grid view

				// clear document

				// set style properties of page
				document.body.className = "workbook"

				// set default properties
				if (!('qnHtFactor' in styleProp)) {
					styleProp.qnHtFactor = 1
				}
				if (!('qnColumn' in styleProp)) {
					styleProp.qnColumn = QUESTION_COLUMN
				}

				// generate header and footer
				const $header = getPageHeader()
				const $footer = getPageFooter()

				// calculate available space
				const availHt = pageHt -$header.height() -$footer.height()

				// start populating questions
				var qnPerPage = Math.floor(availHt /(QUESTION_HEIGHT *styleProp.qnHtFactor)) *styleProp.qnColumn
				var qnPageCount = Math.floor(QUESTIONS.length /qnPerPage) +1
				for (let pageIdx = 0; pageIdx < qnPageCount; i++) {
					var [$pageContainer, availHt] = createNewPage(pageHt)

					for (let j = pageIdx *qnPerPage; j < (pageIdx +1) *qnPerPage; j++) {
						// j = qnIdx
						// qnData: [qnStr, latexEqnArr]
						var qnData = QUESTIONS[j]
						var qnStr = buildQuestion(...qnData) // returns a built string that can be plugged straight away (including latex expressions into html tags)

						var $qnContainer = $("<div>", {
							"class": "qn-container"
						})

						$qnContainer.css("height", `${QUESTION_HEIGHT *styleProp.qnHtFactor}px`)

						var $pTag = $("<p>")
						$pTag.html(qnStr) // html to render

						// render outside of DOM first, then to be attached to the DOM structure - unsure of performance benefits if vice versa?
						$pTag.appendTo($qnContainer)
						$qnContainer.appendTo($pageContainer)
					}
				}
			case "classic":
				// list view
		}
	}

	function createNewQuestionEntry(content, $pageContainer) {
		const $container = $("<div>", {
			"class": "question-element"
		})

		const $headerContainer = $("<div>", {
			"class": "question-header"
		})
		const $qnHeaderText = $("<p>")
		$qnHeaderText.html(content)
		$qnHeaderText.appendTo($headerContainer)

		$headerContainer.appendTo($container)
		$container.appendTo($pageContainer)
	}

	var qnCount = 0;
	var firstPageFilled = false; // will be true when qnCount is 10
	var $container = $("<div>", {
		"class": "question-page-container"
	})
	$container.appendTo($selectors["questions-container"])

	QUESTIONS.forEach(qnData => {
		// qnData: [qnStr, latexEqnArray]

		var qnStr = qnData[0]

		// replace new line characters to <br> tags
		qnStr = qnStr.replaceAll("\n", "<br>")

		// replace inline positions qnStr with built latex expr (final step since most sophiscated)
		for (let i = 0; i < qnData[1].length; i++) {
			qnStr = qnStr.replace(`%%${i}%%`, katex.renderToString(qnData[1][i], {throwOnError: false}))
		}


		createNewQuestionEntry(qnStr, $container);
		qnCount++; // increment question count

		if ((qnCount >= 8 && !firstPageFilled) || qnCount >= 10) {
			firstPageFilled = true // set this so upper limit is now 10

			// reset counter
			qnCount = 0

			// create new container
			$container = $("<div>", {
				"class": "question-page-container"
			})
			$container.appendTo($selectors["questions-container"])
		}
	})

	// main entry function to be called during initialisation
	function main() {
		// set title

	}

	// click event for link button
	var shareLink = window.location.hostname +`/qriller/${QRILLER_ID}`
	$selectors["page-share-link"].on("click", e => {
		if (!navigator.clipboard) {
			var textArea = document.createElement("textarea");
			textArea.value = shareLink;

			// Avoid scrolling to bottom
			textArea.style.top = "0";
			textArea.style.left = "0";
			textArea.style.position = "fixed";

			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			try {
				var successful = document.execCommand('copy');
				var msg = successful ? 'successful' : 'unsuccessful';
				console.log('Fallback: Copying text command was ' + msg);
			} catch (err) {
				console.error('Fallback: Oops, unable to copy', err);
			}

			document.body.removeChild(textArea);
		} else {
			navigator.clipboard.writeText(shareLink);
		}
	})
})