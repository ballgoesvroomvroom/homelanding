onmessage = e => {
	var data = e.data

	// extract all the identifiers
	var {id, fileBlob, blobHash} = data
	console.log(data)

	// id acts as a unique session identifier for the caller object (CreatePage object)
	// fileBlob is the uploaded file blob (to be sent to the server to obtain processed data - e.g. date, location)
	// blobHash is the hash computed from the file blob (to be returned to main thread for file identifying)

	const fd = new FormData()
	fd.append("files", fileBlob)

	fetch("/api/<3/image-fetch-details", {
		"method": "POST",
		"body": fd
	}).then(r => {
		if (r.status == 200) {
			return r.json()
		} else {
			return Promise.reject(r.status)
		}
	}).then(d => {
		// check if d is empty
		if (Object.keys(d).length === 0) {
			// empty, no data returned by server
			// do nothing
			return
		}

		// re-format date from UTC epoch time into date object
		if ('date' in d) {
			d.date = new Date(d.date)
		}

		console.log("[DEBUG]: processed data", d, blobHash)

		// return to main thread
		postMessage({
			createPageContainerId: id,
			blobHash: blobHash,
			processedData: d
		})
	}).catch(errcode => {
		console.error("POST request to /api/<3/image-fetch-details returned error status code", errcode)
	})
}