document.addEventListener("DOMContentLoaded", () => {
	const selectors = {
		"form": document.getElementById("login"),
		"username-inp": document.getElementById("username-inp"),
		"emailaddr-inp": document.getElementById("emailaddr-inp"),
		"password-inp": document.getElementById("password-inp"),
		"cfm-password-inp": document.getElementById("cfm-password-inp"),
		"button": document.getElementById("formSubmitBtn"),

		"formErrMsg": document.getElementById("formErrorMsg")
	}

	selectors["username-inp"].addEventListener("invalid", e => {
		e.preventDefault()

		var un = selectors["username-inp"].value
		if (un.length < 3) {
			// username too short
			selectors["formErrMsg"].innerHTML = "Username must have a minimum of 3 characters."
			return
		} else if (un.length > 23) {
			// username too long
			selectors["formErrMsg"].innerHTML = "Username cannot exceed 23 characters."
			return
		}
	})

	selectors["password-inp"].addEventListener("invalid", e => {
		e.preventDefault()

		var pw = selectors["password-inp"].value
		if (pw.length < 3) {
			// password too short
			selectors["formErrMsg"].innerHTML = "Password must have a minimum of 3 characters."
			return
		} else if (pw.length > 25) {
			// password too long
			selectors["formErrMsg"].innerHTML = "Password cannot exceed 23 characters."
			return
		}
	})

	selectors["cfm-password-inp"].addEventListener("invalid", e => {
		e.preventDefault()

		var pw = selectors["password-inp"].value
		var cpw = selectors["cfm-password-inp"].value
		if (pw.length !== cpw.length || pw !== cpw) {
			// passwords don't match
			selectors["formErrMsg"].innerHTML = "Passwords do not match."
		}
	})

	selectors["emailaddr-inp"].addEventListener("invalid", e => {
		e.preventDefault()

		var email = selectors["emailaddr-inp"].value
		if (email.length === 0) {
			selectors["formErrMsg"].innerHTML = "Email address required."
			return
		}
		var emailSplit = email.split("@")
		if (emailSplit.length !== 2) {
			selectors["formErrMsg"].innerHTML = "Missing either name or domain portion for email address."
			return
		} else if (emailSplit[0].length === 0) {
			selectors["formErrMsg"].innerHTML = "Missing name portion for email address."
			return
		}
		var domain = emailSplit[1].split(".")
		if (domain.length <= 1) {
			// missing domain, e.g 'google' instead of 'google.com'
			selectors["formErrMsg"].innerHTML = "Invalid domain portion for email address."
			return
		} else if (domain.filter(r => r.length === 0).length >= 1) {
			// domain got missing fields following '.' delimiter
			selectors["formErrMsg"].innerHTML = "Domain portion of email address is of illegal syntax, check for extra periods."
			return
		}
	})

	selectors["form"].addEventListener("sub", e => {
		/**
		 * submit event triggered for 'form'
		 * proceed to validate the two inputs, username and password
		 */
		console.log("FORM SUBMITTING")
		e.preventDefault() // prevent refresh
		var un = selectors["username-inp"].value.trim()
		var email = selectors["emailaddr-inp"].value.trim()
		var pw = selectors["password-inp"].value.trim()
		var cpw = selectors["cfm-password-inp"].value.trim()

		// validate username
		if (un.length < 3) {
			// username too short
			selectors["formErrMsg"].innerHTML = "Username must have a minimum of 3 characters."
			return
		} else if (un.length > 23) {
			// username too long
			selectors["formErrMsg"].innerHTML = "Username cannot exceed 23 characters."
			return
		}

		// validate email
		if (email.length === 0) {
			selectors["formErrMsg"].innerHTML = "Email address required."
			return
		}
		var emailSplit = email.split("@")
		if (emailSplit.length !== 2) {
			selectors["formErrMsg"].innerHTML = "Missing either name or domain portion for email address."
			return
		} else if (emailSplit[0].length === 0) {
			selectors["formErrMsg"].innerHTML = "Missing name portion for email address."
			return
		}
		var domain = emailSplit[1].split(".")
		if (domain.length <= 1) {
			// missing domain, e.g 'google' instead of 'google.com'
			selectors["formErrMsg"].innerHTML = "Invalid domain portion for email address."
			return
		} else if (domain.filter(r => r.length === 0).length >= 1) {
			// domain got missing fields following '.' delimiter
			selectors["formErrMsg"].innerHTML = "Domain portion of email address is of illegal syntax, check for extra periods."
			return
		}


		// validate passwords
		if (pw.length < 3) {
			// password too short
			selectors["formErrMsg"].innerHTML = "Password must have a minimum of 3 characters."
			return
		} else if (pw.length > 25) {
			// password too long
			selectors["formErrMsg"].innerHTML = "Password cannot exceed 23 characters."
			return
		}

		if (pw.length !== cpw.length || pw !== cpw) {
			// passwords don't match
			selectors["formErrMsg"].innerHTML = "Passwords do not match."
		}

		fetch("/auth/create", {
			method: "POST",
			headers: {
				"authorization": `Basic ${btoa(`${un}:${pw}`)}` // `Basic b64.encode(username:password)`  scheme
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

			// redirect to route determined by server
			console.log("REPLACING", `${window.location.origin}${userDetails.returnTo}`)
			window.location.replace(`${window.location.origin}${userDetails.returnTo}`)
		}).catch(errcode => {
			console.warn("[WARN] auth login request to /auth/login failed with HTTP status code", errcode)
		})
	})
})