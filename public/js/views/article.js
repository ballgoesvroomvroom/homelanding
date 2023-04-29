$(document).ready(e => {
	// store jquery objects (to prevent querying again)
	const $selectors = {
		"window": $("#window"),
		"sidebar-document-list-container": $("#sidebar-document-list-container")
	}

	fetch("/api/docs/get-all", {
		method: "GET"
	}).then(r => {
		if (r.status == 200) {
			return r.json()
		} else {
			return Promise.reject(r.json())
		}
	}).then(data => {
		// data represents the available document names and their files
		/*
		 *	data = {
		 *		documents = ["doc1", "doc2"],
		 *		articles = {
		 *			doc1: ["art1", "art2"],
		 *			doc2: ["art3", "art4"]
		 *		}
		 *	}
		 */
		for (let docIdx = 0; docIdx < data.documents.length; docIdx++) {
			var doc = data.documents[docIdx]

			if (data.articles[doc]) {
				// verify existence

				// create new header as label
				console.log(data)
				const $documentHeader = $("<li>", {
					tabindex: "0"
				})
				$documentHeader.text(doc) // write content

				// create new container
				const $documentContainer = $("<ul>")

				// get articles
				for (let artIdx = 0; artIdx < data.articles[doc].length; artIdx++) {
					const $articleHeader = $("<li>", {
						tabindex: "0"
					})

					// write content & append to container (later added to DOM)
					$articleHeader.text(data.articles[doc][artIdx])
					$articleHeader.appendTo($documentContainer)

					// add click events
					$articleHeader.on("click", e => {
						window.location.href = `/docs/${doc}/${data.articles[doc][artIdx]}`
					})
				}

				// add click events
				$documentHeader.on("click", e => {
					window.location.href = `/docs/${doc}`
				})

				// append to DOM
				$documentHeader.appendTo($selectors["sidebar-document-list-container"])
				$documentContainer.appendTo($selectors["sidebar-document-list-container"])
			}
		}
	})
})