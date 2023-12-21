// globally exposed variable QUESTIONS stores questions
$(document).ready(e => {
	$selectors = {
		"answers-container": $("#answers-container"),
		"page-share-link": $("#page-share-link")
	}

	function createNewAnswerEntry(content) {
		const $container = $("<div>", {
			"class": "answer-element"
		})

		const $headerContainer = $("<div>", {
			"class": "answer-header"
		})
		const $ansHeaderText = $("<p>")
		$ansHeaderText.html(content)
		$ansHeaderText.appendTo($headerContainer)

		$headerContainer.appendTo($container)
		$container.appendTo($selectors["answers-container"])
	}

	ANSWERS.forEach(ansData => {
		// qnData: [ansStr, latexEqnArray]

		var ansStr = ansData[0]

		// replace new line characters to <br> tags
		ansStr = ansStr.replaceAll("\n", "<br>")

		// replace inline positions ansStr with built latex expr
		if (ansData.length > 1) {
			// there are latex equations
			for (let i = 0; i < ansData[1].length; i++) {
				ansStr = ansStr.replace(`%%${i}%%`, katex.renderToString(ansData[1][i], {throwOnError: false}))
			}
		} else {
			// raw numbers
			ansStr = katex.renderToString(ansStr, {throwOnError: false})
		}

		createNewAnswerEntry(ansStr);
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