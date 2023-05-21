// globally exposed variable QUESTIONS stores questions
$(document).ready(e => {
	$selectors = {
		"questions-container": $("#questions-container"),
		"page-share-link": $("#page-share-link")
	}

	function createNewQuestionEntry(content) {
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
		$container.appendTo($selectors["questions-container"])
	}

	QUESTIONS.forEach(qnData => {
		// qnData: [qnStr, latexEqnArray]

		// replace inline positions qnStr with built latex expr
		qnStr = qnData[0]
		for (let i = 0; i < qnData[1].length; i++) {
			qnStr = qnStr.replace(`%%${i}%%`, katex.renderToString(qnData[1][i], {throwOnError: false}))
		}

		createNewQuestionEntry(qnStr);
	})

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