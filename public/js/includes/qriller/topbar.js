document.addEventListener("DOMContentLoaded", e => {
	var mobilePanel = document.getElementById("topbar-mobile-sidepanel-container")
	function togglePanel(state) {
		/**
		 * toggles panel visibility
		 * state: boolean, true to switch panel on
		 */
		mobilePanel.style.display = state ? "block" : "none";
	}

	var panelTriggerBtn = document.getElementById("topbar-mobile-hamburg-btn");
	var panelExitBtn = document.getElementById("topbar-mobile-close-btn")
	panelTriggerBtn.addEventListener("click", () => {
		togglePanel(true)
	})
	panelExitBtn.addEventListener("click", () => {
		togglePanel(false)
	})

	// attach .scrolled class to #topbar-container upon scrolling
	var topbar = document.getElementById("topbar-container");
	window.addEventListener("scroll", function() {
		if (window.scrollY > 50) { // Adjust the value as needed
			topbar.classList.add("scrolled");
		} else {
			topbar.classList.remove("scrolled");
		}
	});
})