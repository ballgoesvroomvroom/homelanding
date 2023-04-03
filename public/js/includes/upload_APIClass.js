class Error {
	cosntructor(msg) {
		this.message = msg ? msg : "General error"
		this.code = 100
	}
}

class APIError extends Error {
	cosntructor(msg) {
		this.message = msg ? msg : "API Error"
		this.code = 200
	}
}

class APIClass {
	constructor() {
		// build the routes
		this.base = "/api/<3"

		// construct actions class (container for actions)
		this.Actions = new APIActions(this.base)
		this.Viewer = new APIView(this.base) // to 'parse' data coming in
	}
}

class APIActions {
	constructor(baseRoute) {
		// build routes
		this.base = baseRoute

		// memory
		this.cachedQueriedImageDetails = {} // caches previously queried image details (as promises)
	}

	fetchImages() {
		var path = `${this.base}/laided-pathway`
		return fetch(path, {
			method: "GET"
		}).then(r => {
			if (r.status == 200) {
				return r.json()
			} else {
				return Promise.reject(r.status)
			}
		}).catch(errcode => {
			console.warn("[WARN]: request to " +path +" failed with HTTP status code", errcode)
		})
	}

	queryImageDetails(imageUid) {
		// returns a promise, acts as a queue
		// implemment webhooks for live updates (caching is a must for responsiveness)
		if (imageUid in this.cachedQueriedImageDetails) {
			return this.cachedQueriedImageDetails[imageUid]
		} else {
			this.cachedQueriedImageDetails[imageUid] = fetch(`${this.base}/query/${imageUid}`, {
				method: "GET"
			}).then(r => {
				if (r.status == 200) {
					return r.json()
				} else {
					return Promise.reject(r.status)
				}
			}).catch(errStatus => {
				console.warn("[WARN]: failed to load details for image with uid:", imageUid)
			})

			return this.cachedQueriedImageDetails[imageUid]
		}
	}

	modifyTitle(imageUid, title) {
		// title string cannot be more than 128 characters
		if (title.length > 128) {
			return new APIError("Title string above 128 characters")
		} else if (title.length == 0) {
			return new APIError("Title string is empty")
		}

		// send fetch POST request
		return fetch(`${this.base}/modify/${imageUid}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				title: title
			})
		}).then(r => {
			if (r.status == 200) {
				return true
			} else {
				return Promise.reject(r.status)
			}
		}).catch(errStatusCode => {
			console.log("[WARN]: FAILED TO MODIFY TITLE FOR uid:", imageUid, "with status", errStatusCode)
			return false
		})
	}

	uploadImages(formData) {
		// formData field 'files' stores the file blobs in order
		// formData field 'metadata' stores the file metadata (date and title input)
		// formData field 'timezonePref' stores the timezone images are to be uploaded in

		// check if timezonePref field is present in formData
		if (!formData.has("timezonePref")) {
			formData.set("timezonePref", Intl.DateTimeFormat().resolvedOptions().timeZone)
		}

		// send fetch POST request
		return fetch(`${this.base}/upload`, {
			method: "POST",
			body: formData
		}).then(r => {
			if (r.status == 200) {
				return true
			} else {
				return Promise.reject(r.status)
			}
		}).catch(errcode => {
			console.warn("[WARN]: failed to upload to route " +path +" with HTTP status code", errcode)
			return false
		})
	}
}

class APIView {
	constructor(base) {
		this.base = base
	}
}


export default new APIClass()