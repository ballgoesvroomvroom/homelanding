fetch("/api/qriller/account/details", {
	method: "GET",
	credentials: "same-origin"
}).then(r => {
	if (r.status === 200) {{
		return r.json()
	}} else {
		return Promise.reject(r.status)
	}
}).catch(status => {
	console.warn("[ERROR]: FAILED TO LOAD WITH HTTP STATUS", status)

	return Promise.reject(r.status)
})

document.addEventListener("DOMContentLoaded", e => {
	let container = document.getElementById("container");

	let menuNavigContainer = document.getElementById("menu-horizontal-navig-container")
	let menuNavigBtn = menuNavigContainer.children
	let menuContainer = document.getElementsByClassName("menu-container")

	let prevIdx = 1;
	let _shakeId = 0;
	for (let i = 0; i < menuNavigBtn.length; i++) {
		menuNavigBtn[i].addEventListener("click", () => {
			if (prevIdx === i) {
				// already at this menu, shake screen by adding .shake class to container
				container.classList.add("shake");
				let _localShakeId = ++_shakeId;
				setTimeout(() => {
					if (_localShakeId === _shakeId) {
						// same closing function that triggered the shake
						container.classList.remove("shake");
					}
				}, 500) // remove class after 500 milliseconds
				return;
			}
			menuContainer[prevIdx].classList.add("hidden")
			menuContainer[i].classList.remove("hidden")

			// set current state
			prevIdx = i
		})
	}

	// initialisation
	for (let i = 0; i < menuContainer.length; i++) {
		if (i === prevIdx) {
			menuContainer[i].classList.remove("hidden");
		} else {
			menuContainer[i].classList.add("hidden");
		}
	}
})