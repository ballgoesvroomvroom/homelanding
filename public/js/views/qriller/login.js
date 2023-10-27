document.addEventListener("DOMContentLoaded", () => {
	const selectors = {
		"form": document.getElementById("login"),
		"username-inp": document.getElementById("username-inp"),
		"password-inp": document.getElementById("password-inp"),
		"button": document.getElementById("formSubmitBtn"),
	}

	selectors["form"].addEventListener("submit", e => {
		/**
		 * submit event triggered for 'form'
		 * proceed to validate the two inputs, username and password
		 */
		e.preventDefault() // prevent refresh
		var un = selectors["username-inp"].value
		var pw = selectors["password-inp"].value

		// validate username and password
		if (un.length < 3) {
			// username too short
			return
		} else if (un.length > 23) {
			// username too long
			return
		}

		if (pw.length < 3) {
			// password too short
			return
		} else if (pw.length > 25) {
			// password too long
			return
		}

		fetch("/auth/login", {
			method: "POST",
			headers: {
				"authorization": `Basic ${btoa(`${un}:${pw}`)}` // `Basic b64.encode(username:password)` basic authorization scheme
			}
		}).then(r => {
			if (r.status === 200) {
				return r.json()
			} else {
				console.log("BAD")
				return Promise.reject(r.status)
			}
		}).then(userDetails => {
			// store username in localStorage
			localStorage.setItem("username", userDetails.username)
		}).catch(errcode => {
			console.warn("[WARN] auth login request to /auth/login failed with HTTP status code", errcode)
		})
	})
})