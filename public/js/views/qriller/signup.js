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

	let inputElements = document.getElementsByTagName("input")
	for (let i = 0; i < inputElements.length; i++) {
		inputElements.item(i).addEventListener("invalid", e => {
			e.preventDefault()
		})
	}

	selectors["form"].addEventListener("submit", e => {
		e.preventDefault() // prevent form from refreshing page
	})

	selectors["button"].addEventListener("click", e => {
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
		} else if (!domain.every(r => r.length >= 1)) {
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
			return
		}

		// all credentials are of valid syntax (/auth/create will validate whether username/email address already exists)
		selectors["formErrMsg"].innerHTML = `&nbsp;` // remove errror message
		fetch("/auth/create", {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify({
				"username": un,
				"email": email,
				"pw": pw
			})
		}).then(r => {
			if (r.status === 200) {
				return
			} else {
				console.log("ERROR", r.status)
				return new Promise((res, rej) => {
					if (r.status === 500) {
						// general server error
						res({error: "Server is unable to process your request, please try again later, if the error persists, please reach out to us at help@qriller.com for near-immediate assistance."})
					} else {
						// 40x response codes
						console.log("40X ERROR")
						res(r.json())
					}
				}).then(errData => {
					// errData.error: string, short descriptor of error message
					return Promise.reject(errData)
				})
			}
		}).then(() => {
			// store username in localStorage
			localStorage.setItem("username", username)
			localStorage.setItem("pendingLogin", true) // temporary state to be used by loginPage

			// redirect to login page for user to login, with pre-filled username
			console.log("REPLACING", `/qriller/login`)
			// window.location.replace(`/qriller/login`)
		}).catch(errData => {
			// errData.error: string, short error descriptor
			if (errData == null) {
				// thrown forward from previous catch statement
				return
			} else {
				console.log("MICE TRAP", errData)
			}

			selectors["formErrMsg"].innerHTML = errData.error
			console.warn("[WARN] auth login request to /auth/login failed with error message:\n" +errData.error)
		})
	})
})