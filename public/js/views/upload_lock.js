$(document).ready(() => {
	const $selectors = {
		"keyinputform": $("#keyinputform"),
		"authkeyinput": $("#authkeyinput")
	}

	$selectors["keyinputform"].on("submit", e => {
		e.preventDefault();

		var inp = $selectors["authkeyinput"].val()
		fetch("/auth/login", {
			method: "POST",
			headers: {
				"authorization": `Basic ${btoa(`username:${inp}`)}`
			}
		}).then(r => {
			if (r.status == 200) {
				return r.json(); // contains the user details (e.g. username)
			} else {
				console.log("BAD")
				return Promise.reject(r.json())
			}
		}).then(userDetails => {
			// store it in localStorage
			localStorage.setItem("userDetails", JSON.stringify(userDetails))
			window.location.reload()
		}).catch(errcode => {
			console.warn("[WARN] auth login request to /auth/login failed with HTTP status code", errcode)
		})
	})
})