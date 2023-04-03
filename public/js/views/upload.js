import { Image as ImageInteractable } from "./upload_interfaceHandler.js"
import APIClass from "/js/includes/upload_APIClass.js"

let hasPrivileges = fetch("/auth/perms").then(r => {
	if (r.status == 200) {
		return r.json()
	} else {
		return Promise.reject(false)
	}
}).then(d => {
	return d.upload && d.delete // has both perms
}, () => false)

// function getTimestamp(imgUrl) {
// 	return window.exifr.parse(imgUrl)
// }

$(document).ready(() => {
	const $selectors = {
		"treasure": $("#treasure"),
		"topbar-action-panel": $("#topbar-action-panel"),
		"dates-giant-container": $("#dates-giant-container"),

		"user-dropdown-name-text": $("#user-dropdown-name-text"),

		"item-detail-more-trigger": $("#item-detail-more-trigger"),
		"item-detail-more-trigger-image": $("#item-detail-more-trigger-image"),
		"item-detail-more": $("#item-detail-more")
	}

	function fetchImages() {
		APIClass.Actions.fetchImages().then(payload => {
			/*
			 *	payload = {
			 *		"2023": {
			 *			"3": {
			 *				"12": {
			 *					"images": [imageUid, ...],
			 *					"properties": {
			 *						"custom_name": "12/3/23", // dd/mm/yyyy
			 *						"background_image": ""
			 *					}
			 *				}
			 *			}
			 *		}
			 *	}
			 */

			// get a map of all the years first (sort them from oldest year -> latest year; aka ascending order)
			var yearArray = Object.keys(payload).sort((a, b) => {a - b})

			// iterate through yearArray in order (from oldest year onwards)
			for (let i = 0; i < yearArray.length; i++) {
				var yearBranch = payload[yearArray[i]]

				
				// get all the months in the year, starting from month 1
				for (let monthIdx = 1; monthIdx < 13; monthIdx++) {
					if (!(monthIdx.toString() in yearBranch)) {
						// entry for this month doesn't exist
						continue
					}

					var monthBranch = yearBranch[monthIdx.toString()]

					// get all the days in the month, starting from day 1
					for (let dayIdx = 1; dayIdx < 32; dayIdx++) {
						if (!(dayIdx.toString() in monthBranch)) {
							// entry for this day for the month doesn't exist
							continue
						}

						var dayBranch = monthBranch[dayIdx.toString()]

						// create new day container (pass in custom properties for customisations)
						var $div, $picgc = ImageInteractable.createNewContainer(dayBranch.properties, $selectors["dates-giant-container"])

						for (let imgIdx = 0; imgIdx < dayBranch.images.length; imgIdx++) {
							// iterate through image ids, sorted in ascending order
							new ImageInteractable(dayBranch.images[imgIdx], $picgc)
						}
					}
				}
			}
		})
	}

	function refresh() {
		// clear any instances under grid parent
		$selectors["dates-giant-container"].empty()

		// load in the images
		fetchImages();
	}

	hasPrivileges.then(hasPrivileges => {
		if (hasPrivileges) {
			refresh()
		} else {
			// no privileges (clear user details cache)
			localStorage.setItem("userDetails", "{}")

			// refresh page
			window.location.href = "/<3"
		}
	})

	// add box shadow effect to topbar when scrolling
	const stickyTopbarTriggerThreshold = 10;

	$(window).scroll(() => {
		if (window.pageYOffset >= stickyTopbarTriggerThreshold && !$selectors["topbar-action-panel"].hasClass("active")) {
			$selectors["topbar-action-panel"].addClass("active")
		} else if (window.pageYOffset < stickyTopbarTriggerThreshold && $selectors["topbar-action-panel"].hasClass("active")) {
			$selectors["topbar-action-panel"].removeClass("active")
		}
	})
	$selectors["dates-giant-container"].scroll(() => {
		var y = $selectors["dates-giant-container"].scrollTop()
		if (y >= stickyTopbarTriggerThreshold && !$selectors["topbar-action-panel"].hasClass("active")) {
			$selectors["topbar-action-panel"].addClass("active")
		} else if (y < stickyTopbarTriggerThreshold && $selectors["topbar-action-panel"].hasClass("active")) {
			$selectors["topbar-action-panel"].removeClass("active")
		}
	})


	// load up user details
	var userDetails = []
	var userDetailsStr = localStorage.getItem("userDetails");
		console.log("[DEBUG]: raw userDetails", userDetailsStr)
	if (userDetailsStr) {
		// parse it (json string)
		userDetails = JSON.parse(userDetailsStr)
		console.log("[DEBUG]: parsed userDetails", userDetails)
	}

	if ("username" in userDetails) {
		// change username display
		$selectors["user-dropdown-name-text"].text(userDetails.username)
	}
})