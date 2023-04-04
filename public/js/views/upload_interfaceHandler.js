import APIClass from "/js/includes/upload_APIClass.js"

var interfaceHandler = {
	$container: null, // to be set by .ready()
	$selectors: null, // to be set by .ready()
	
	currentPageOpened: null, // to be set by .switchPage()

	currentImageUid: null, // to be set by .triggerCloseUpView()
	currentImageLink: null, // active state; to be set by .triggerCloseUpView()
	
	gestureController: null, // to be set by .registerGestures()
	sideBarGestureController: null, // stores controller for sidebar open/close swipe, to be set by .registerGestures()

	notificationTimeoutEventId: null, // to be set by .notification(); stores the id returned by setTimeout to be cancelled if needed

	createPageContainer: null, // will be set by switchPages (property acts like a cache reference; will be created if none exists)

	isReady: false, // to be set by .ready()

	ready($selectors) {
		// called when $(document).ready() is triggered
		this.$container = $selectors["item-zoom"]
		this.$selectors = $selectors
		this.isReady = true

		// register pages
		this.registerPages()

		// listen for create page worker
		this.handleCreatePageWorker()
	},
	queryImageDetails(uid) {
		return APIClass.Actions.queryImageDetails(uid)
	},
	uploadImages(formData) {
		return APIClass.Actions.uploadImages(formData)
	},
	registerTriggerElements($triggerEle, uid, imageLink) {
		// query for data first (and cache it afterwards)
		APIClass.Actions.queryImageDetails(uid)

		// add click events
		$triggerEle.on("contextmenu", e => {
			e.preventDefault();
		})

		$triggerEle.on("click", e => {
			e.preventDefault();

			this.triggerCloseUpView(uid, imageLink).then(() => {
				$triggerEle.blur()
			})
		})
	},
	triggerCloseUpView(uid, imageLink) {
		if (!this.isReady) {
			return
		}

		// update data
		this.currentImageUid = uid
		this.currentImageLink = imageLink
		this.currentImageDetailsPayload = APIClass.Actions.queryImageDetails(uid)

		return this.currentImageDetailsPayload.then(data => {
			// shorthand

			// load it up instantly
			// re-enable gestures for closing
			this.gestureController.enableGestures()

			// disable gestures for sidebar
			this.sideBarGestureController.disableGestures()

			// update styles
			window.requestAnimationFrame(() => {
				this.$container.removeClass("hidden")
				this.$container.addClass("active")
			})

			// get both dates (one is local system time and another is restricted to the timezone the image was uploaded in)
			// format both dates in 'DD/MM/YYYY, HH:MM:SS {TIMEZONE}'
			var date = new Date(data.ms_since_epoch)
			var system_date_repr = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() +1).toString().padStart(2, "0")}/${date.getFullYear()}, ${date.toTimeString()}`

			// calculate timezone string (gmt offset)
			var date_sign_prefix = data.localUploadedDate.offset <= 0 ? "+" : "-" // will be a + on 0 offset
			var date_hour_offset_repr = Math.floor(Math.abs(data.localUploadedDate.offset) /60)
			var date_min_offset_repr = Math.abs(data.localUploadedDate.offset) -(date_hour_offset_repr *60)
			var upload_fixed_date_repr = date.toLocaleString("en-GB", {timeZone: data.uploaded_timezone_str}) +` GMT${date_sign_prefix}${date_hour_offset_repr.toString().padStart(2, "0")}${date_min_offset_repr.toString().padStart(2, "0")}`

			// get file size
			var fileSizeBytes = data.sizeBytes
			var fileSizeMB = fileSizeBytes /1000000

			// display update data
			this.$selectors["item-image-element"].attr("src", imageLink)

			if (data.title.length == 0) {
				// no title
				this.$selectors["item-detail-title-inputtext"].val("") // empty input
				this.$selectors["item-detail-title-inputtext"].attr("placeholder", "No title (write one)")
				// this.$selectors["item-detail-title"].addClass("noTitle")
			} else {
				// this.$selectors["item-detail-title"].removeClass("noTitle")
				this.$selectors["item-detail-title-inputtext"].val(data.title)
			}

			// dates
			this.$selectors["item-detail-date-text"].text(system_date_repr)
			this.$selectors["item-detail-fixeddate-text"].text(upload_fixed_date_repr)

			// collection
			this.$selectors["item-detail-collection-text"].html("collection: <a>add collection</a>")

			// check if location data is present
			if (data.lat && data.long) {
				this.$selectors["item-detail-location-text"].text(`${data.lat} ${data.long}`)
			}

			this.$selectors["item-detail-cameraman-text"].html("<a>set person</a>")
			this.$selectors["item-detail-camera-text"].text("No data")
			this.$selectors["item-detail-filesize-text"].text(`${Math.floor(fileSizeMB *100) /100}MB or ${fileSizeBytes} bytes`)
			this.$selectors["item-detail-filedimen-text"].text(`${data.ext_data.width}x${data.ext_data.height} (px)`)
		})
	},
	hideImageCloseUpView() {
		this.$container.addClass("hidden")
		this.$container.removeClass("active")

		// disable gestures (will be re-enable by interfaceHandler.triggerCloseUpView())
		this.gestureController.disableGestures();

		// re-enable sideBarGestureController
		this.sideBarGestureController.enableGestures();
	},
	registerGestures() {
		// registers gestures for $container
		if (!this.isReady) {
			return
		}

		// gestures controller for swipe to close on image close up view page
		this.gestureController = new Gesture(this.$container[0])
		const swipeclose_trigger_thresholdX = .4 // 30% of screen space
		const swipeclose_trigger_thresholdY = .5 // 50% of screen space

		// fn to be called on frame updates (mouse move)
		this.gestureController.frameUpdateFn = gestureController => { // retain 'this' context as interfaceHandler with arrow funcs
			var pixelsMoved = [gestureController.lastTouchPos[0] -gestureController.initialTouchPos[0], gestureController.lastTouchPos[1] -gestureController.initialTouchPos[1]]
			var screenSpace = [this.$container.width(), this.$container.height()] // use the #item-zoom width and height for relative thresholds
			var computedThresholdInPixels = [swipeclose_trigger_thresholdX *screenSpace[0], swipeclose_trigger_thresholdY *screenSpace[1]]; // necessary to recompute since screenspace may have changed

			// clamp value used to apply stylings
			var leftOffset = pixelsMoved[0]
			if (leftOffset < 0) {
				leftOffset = 0
			}

			// apply styling
			this.$container.css("left", leftOffset *1.2)

			// determine if threshold exceeded
			if (pixelsMoved[0] >= computedThresholdInPixels[0] || pixelsMoved[1] >= computedThresholdInPixels[1]) {
				// hide it
				this.hideImageCloseUpView();
			}
		}

		// reset styling
		this.gestureController.resetCall = () => {
			this.$container.css("left", ""); // remove inline styling
		}

		// gestures controller for swipe to close/open sidebar on mobile (create controller first, only disable it if sidebar is constantly present (resized window))
		this.sideBarGestureController = new Gesture(this.$selectors["big-window"][0])
		const swipe_lock_sidebar_threshold = .3 // 40% of #big-window (for both opening and closing)
		const swipe_trigger_sidebar_threshold = .1 // 10% of #big-window (for triggering opening actions)
		this.sideBarGestureController.frameUpdateFn = gestureController => {
			var pixelsMovedX = gestureController.lastTouchPos[0] -gestureController.initialTouchPos[0]
			var pixelsMovedY = gestureController.lastTouchPos[1] -gestureController.initialTouchPos[1]
			var screenSpace = this.$selectors["big-window"].width()
			var computedTriggerThresholdInPixels = swipe_trigger_sidebar_threshold *screenSpace
			var computedLockThresholdInPixels = swipe_lock_sidebar_threshold *screenSpace

			const $lw = this.$selectors["left-window"] // shorthand
			const sidebarWidth = $lw.width(); // since its calld by window.requestAnimationFrame, it should remain the same throughout
			var leftOffset = pixelsMovedX

			if (Math.abs(pixelsMovedY) > 20) {
				// there is magnitude
				this.$selectors["dates-giant-container"].scrollTop(this.$selectors["dates-giant-container"].scrollTop() -pixelsMovedY *.2)
				return;
			}

			if (leftOffset > computedTriggerThresholdInPixels) {
				// trying to swipe open (only trigger when x axis moved by a set threshold, else too sensitive)
				// check if its already open
				if ($lw.hasClass("hold-active")) {
					return
				}

				// apply styling
				$lw.css("left", -sidebarWidth +leftOffset)

				// apply blur
				if (!this.$selectors["window-blur"].hasClass("active")) {
					this.$selectors["window-blur"].addClass("active")
				}

				if (leftOffset > computedLockThresholdInPixels) {
					// make it hold
					$lw.addClass("hold-active")
					$lw.css("left", "") // remove any inline styling so 'hold-active' style will hold
				}
			} else if (leftOffset < 0) {
				// trying to swipe close
				// leftOffset should be negative
				// check if its already closed
				if (!$lw.hasClass("hold-active")) {
					// already closed
					return
				}

				// apply styling
				$lw.css("left", leftOffset)

				// blur should have been applied

				if (leftOffset < -computedLockThresholdInPixels) {
					// close it
					$lw.removeClass("hold-active")
					$lw.css("left", "")

					// remove blur
					this.$selectors["window-blur"].removeClass("active")
				}
			}
		}

		this.sideBarGestureController.resetCall = () => {
			this.$selectors["left-window"].css("left", "") // remove inline styling

			if (!this.$selectors["left-window"].hasClass("hold-active")) {
				// not in action, remove blur
				this.$selectors["window-blur"].removeClass("active")
			}
		}

		const sideBarGestureController = this.sideBarGestureController;

		// first enable/disable call
		if (window.innerWidth < 800 && !sideBarGestureController.active) {
			// side-bar is hidden
			// start gesture controller
			sideBarGestureController.enableGestures()
		} else if (window.innerWidth >= 800 && sideBarGestureController.active) {
			// side-bar is constantly visible, disable gesture controller
			sideBarGestureController.disableGestures()
		}
		window.addEventListener("resize", function() {
			if (window.innerWidth < 800 && !sideBarGestureController.active) {
				// side-bar is hidden
				// start gesture controller
				sideBarGestureController.enableGestures()
			} else if (window.innerWidth >= 800 && sideBarGestureController.active) {
				// side-bar is constantly visible, disable gesture controller
				sideBarGestureController.disableGestures()
			}
		})
	},

	notification(msg, color) {
		// shows message
		if (!this.isReady) {
			// not ready, return
			return
		}

		if (this.notificationTimeoutEventId) {
			// immediately cancel timeout function
			clearTimeout(this.notificationTimeoutEventId)

			// clear stylings (pop effect)
			this.$selectors["notification-container"].removeClass("active")
			this.$selectors["task-save-path"].removeClass("active")

			// no need to hide notification-panel since its getting displayed immediately
		}

		this.$selectors["notification-panel"].css("display", "block")
		this.$selectors["notification-container"].addClass("active")
		this.$selectors["task-save-path"].addClass("active")
		this.$selectors["notification-text-element"].text(msg)

		// change color attributes
		this.$selectors["notification-container"].css("color", color)
		this.$selectors["task-save-path"].attr("stroke", color)

		this.notificationTimeoutEventId = setTimeout(() => {
			this.$selectors["notification-container"].removeClass("active")
			this.$selectors["task-save-path"].removeClass("active")

			this.notificationTimeoutEventId = setTimeout(() => {
				this.$selectors["notification-panel"].css("display", "none")
			}, 600) // animations finish playing after 500ms
		}, 3000)
	},

	newCreatePageContainer(savedEntry) {
		// trash the current object and creates a new one
		if (this.createPageContainer) {
			this.createPageContainer.destroy()
		}

		this.createPageContainer = new CreatePage(this.$selectors)

		// check if savedEntry is not null (entries re-used from the previous createPageContainer)
		if (savedEntry && savedEntry.length >= 1) {
			savedEntry.forEach(entry => {
				this.createPageContainer.entry.push(entry)
			})

			savedEntry = null // remove reference for GC (not needed?)

			// set current selection to 0 (and call .handleImageClickSelection() so that image & overlay display stats are accurate)
			// can safely set since there is gauranteed to be something in this.entry (since saveEntry.length >= 1)
			this.createPageContainer.handleImageClickSelection(0, false)
		}

		return this.createPageContainer
	},
	getCreatePageContainer() {
		// returns the current create page container (creates one if already doesnt exist)
		if (this.createPageContainer == null) {
			this.createPageContainer = new CreatePage(this.$selectors)
		}

		return this.createPageContainer
	},
	handleCreatePageWorker() {
		// handles reply from create page worker (hooked on .ready())
		if (CreatePage.worker) {
			// worker exists
			console.log("[DEBUG]: worker received")
			CreatePage.worker.onmessage = e => {
				// handle event
				console.log("[DEBUG]: worker message received", e)
				if (e.data.createPageContainerId == this.getCreatePageContainer().id) {
					// same valid id (create page container holds the same data)
					// returns blobHash to ensure metadata updated is the same image
					// processedData contains the date, location data extracted from image by server (if any)
					console.log("[DEBUG]: blobHash", e.data.blobHash)
					this.getCreatePageContainer().updateMetadata(e.data.blobHash, e.data.processedData)
				}
			}
		}
	},

	closeSideBar() {
		if (this.$selectors["left-window"].hasClass("hold-active")) {
			// not in hold (only closes on mobile)
			this.$selectors["left-window"].removeClass("hold-active")
			this.$selectors["window-blur"].removeClass("active")
		}
	},
	registerPages() {
		// called by .ready();
		// registers entry events (buttons)
		this.$selectors["left-panel-action-home"].on("click", e => {
			e.preventDefault();

			this.hideImageCloseUpView(); // close the close up view too

			this.closeCurrentPage(); // if any
			this.closeSideBar();
		})

		// create page
		this.$selectors["left-panel-action-create"].on("click", e => {
			e.preventDefault()

			this.switchPage(2)
			this.closeSideBar()
		})

		// settings page
		this.$selectors["left-panel-action-settings"].on("click", e => {
			e.preventDefault();

			this.switchPage(1)
			this.closeSideBar()
		})

		this.$selectors["page-window-navig-button"].on("click", e => {
			e.preventDefault();

			this.closeCurrentPage(); // if any
		})
	},
	switchPage(pageId) {
		// pageId: integer
		// called externally
		if (!this.isReady) {
			// not ready, return
			return
		}

		if (this.currentOpenedPage == pageId) {
			// same page, do nothing
			return
		}

		// since different page, close current page if any
		this.closeCurrentPage();
		switch (pageId) {
			case 1:
				// settings page
				this.$selectors["settings-page"].addClass("active")
				break
			case 2:
				// create page
				this.$selectors["create-page"].addClass("active")

				// load up create page object
				this.createPageContainer = this.getCreatePageContainer()
		}

		this.currentOpenedPage = pageId
	},
	closeCurrentPage() {
		// called internally, most likely by .switchPage()
		// uses .currentOpenedPage
		if (this.currentOpenedPage == null) {
			// return; no page to close
			return
		}

		switch (this.currentOpenedPage) {
			case 1:
				// settings page
				this.$selectors["settings-page"].removeClass("active")
				break
			case 2:
				// create page
				this.$selectors["create-page"].removeClass("active")

				// no need to trash this.createPageContainer since it saves data
		}

		this.currentOpenedPage = null;
	}
}

export class Image {
	constructor(uid, $datepgccontainer) {
		this.$datepgccontainer = $datepgccontainer

		// create a new image element as a way of reserving a spot (else order would be screwed up)
		var [$big_container, $img_container, $img_ele] = Image.createNewImageElement($datepgccontainer)
		this.$big_container = $big_container
		this.$img_container = $img_container
		this.$img_ele = $img_ele

		// // retrieve data first
		// var data = interfaceHandler.queryImageDetails(uid) // there isnt a need to store the data since its cached internally

		// // store data
		// this.imageLink = data.compressed["20"].filepath

		// fetch image
		return interfaceHandler.queryImageDetails(uid).then(data => {
			this.imageLink = `/hearts/compressed/${data.compressed["20"].filename}`

			// register triggers with handler (and delegate click events and postclick effects to handler)
			interfaceHandler.registerTriggerElements($big_container, uid, this.imageLink)
		}).then(() => fetch(this.imageLink)).then(r => {
			if (r.status == 200) {
				this.$img_ele.attr("src", this.imageLink)
				return r.blob()
			} else {
				return Promise.reject(r.status)
			}
		})
	}

	static createNewContainer(properties, $big_container) {
		const $div = $("<div>", {
			"class": "day-container"
		})

		const $top_div = $("<div>", {
			"class": "day-header-container"
		})

		const $h1 = $("<h1>")
		$h1.html(properties.custom_name)
		$h1.appendTo($top_div)
		$top_div.appendTo($div)

		const $picgc = $("<div>", {
			"class": "picture-grid-container"
		})
		$picgc.appendTo($div)

		if (properties.background_image_filename != "") {
			// not empty
			$div.addClass("containsBg")
			$div.css("backgroundImage", `url(/hearts/background/${properties.background_image_filename}`)
		}
		$div.prependTo($big_container)

		return $div, $picgc
	}

	static createNewImageElement($datepgccontainer) {
		const $container = $("<div>", {
			"class": "pictem-container"
		})
		const $div = $("<div>", {
			"class": "pictem"
		})
		const $img = $("<img>", {
			"class": "skeleton"
		})
		$img.appendTo($div)
		$img.attr("onload", "this.classList.remove('skeleton')"); // removes animations when image has been fully loaded
		$img.attr("onerror", "this.src='/static/filemissing_placeholder.png'; this.classList.remove('skeleton')"); // add fallback when image fails to load
		$div.appendTo($container)
		$container.prependTo($datepgccontainer)

		return [$container, $div, $img]
	}
}

class Gesture {
	constructor(container) {
		this.container = container // pure simple seletors
		this.onAnimFrame = function() {} // empty function for now (to be set by .frameUpdateFn
		this.resetCall = function() {} // callback function when .disableGestures() is called (to reset styling)

		// memory
		this.initialTouchPos = null; // stores the touch point triggered by .handleGestureStart()

		// state
		this.active = true; // if true, gestures will be detected, else false wont be detected
		this.lastTouchPos = null; // stores touch point (in an array where first index represents x coords)
		this.rafPending = false

		// hook up the connections
		if (window.PointerEvent) {
			// add Pointer Event Listener
			container.addEventListener('pointerdown', this.handleGestureStart.bind(this), true);
			container.addEventListener('pointermove', this.handleGestureMove.bind(this), true);
			container.addEventListener('pointerup', this.handleGestureEnd.bind(this), true);
			container.addEventListener('pointercancel', this.handleGestureEnd.bind(this), true);
		} else {
			// add Touch Listener
			container.addEventListener('touchstart', this.handleGestureStart.bind(this), true);
			container.addEventListener('touchmove', this.handleGestureMove.bind(this), true);
			container.addEventListener('touchend', this.handleGestureEnd.bind(this), true);
			container.addEventListener('touchcancel', this.handleGestureEnd.bind(this), true);

			// add Mouse Listener
			container.addEventListener('mousedown', this.handleGestureStart.bind(this), true);
		}
	}

	static getGesturePointFromEvent(e) {
		var point = [];

		if (e.targetTouches) {
			// prefer Touch Events
			point = [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
		} else {
			// either Mouse event or Pointer Event
			point = [e.clientX, e.clientY]
		}

		return point;
	}

	set frameUpdateFn(fn) {
		this.onAnimFrame = () => {
			if (!this.initialTouchPos || !this.lastTouchPos) {
				return
			}
			fn(this); // call the function (with this as argument, NOT content (DONT BIND), this as context reserved for interfaceHandler) that changes the UI states

			// reset this to false so that the next requestAnimationFrame can be called
			this.rafPending = false
		}
	}

	enableGestures() {
		this.active = true
	}

	disableGestures() {
		this.active = false;

		// reset any stylings
		this.resetCall();
	}

	handleGestureStart(e) {
		e.preventDefault();

		if ((e.touches && e.touches.length > 1) || !this.active) {
			return
		}

		if (window.PointerEvent) {
			e.target.setPointerCapture(e.pointerId)
		} else {
			document.addEventListener("mousemove", this.handleGestureMove.bind(this), true);
			document.addEventListener("mouseup", this.handleGestureEnd.bind(this), true);
		}

		this.initialTouchPos = Gesture.getGesturePointFromEvent(e)
	}

	handleGestureMove(e) {
		e.preventDefault();

		if (!this.initialTouchPos || !this.active) {
			return
		}

		this.lastTouchPos = Gesture.getGesturePointFromEvent(e)

		if (this.rafPending) {
			return
		}

		this.rafPending = true
		window.requestAnimationFrame(this.onAnimFrame)
	}

	handleGestureEnd(e) {
		e.preventDefault();

		if (e.touches && e.touches.length > 0) {
			return
		}

		// reset state so next window.requestAnimationFrame() can be run
		this.rafPending = false

		if (window.PointerEvent) {
			e.target.releasePointerCapture(e.pointerId)
		} else {
			document.removeEventListener("mousemove", this.handleGestureMove, true)
			document.removeEventListener("mouseup", this.handleGestureEnd, true)
		}

		// retain positions before settting to null so queued computations (by window.requestAnimationFrame) can exist
		this.initialTouchPos = null
		this.lastTouchPos = null

		// reset stylings
		this.resetCall();
	}
}

var createPageUid = 0;
class CreatePage {
	static worker = window.Worker ? new Worker("/js/includes/workers/createPageWorker.js") : null

	static computeFileBlobHash(fileBlob) {
		return new Promise(res => {
			var a = new FileReader()
			a.readAsArrayBuffer(fileBlob)
			a.onloadend = function() {
				let hashPromise = crypto.subtle.digest("SHA-256", a.result)
				hashPromise.then(hash => {
					res(hash)
				})
			}
		})
	}

	constructor($selectors) {
		// creates new page container (container for forms)
		this.$selectors = $selectors

		this.id = createPageUid++;
		this.entry = []

		this.currentSelectionIdx = -1 // zero index based
	}

	createEmptyImageContainer(fileBlob) {
		var container = {
			fileBlob: fileBlob,
			fileHash: null, // stores a promise, triggered by filereader.onloadend()
			metadata: {
				"title": "",
				"date": new Date(), // date object
				"sizeBytes": 0,
				"dimensions": [0, 0],
				"location": {
					"lat": "",
					"long": ""
				},
				"collection": "",
				"author": "",
				"cameraMake": "",
				states: {
					dateModified: true // will be toggled true when date is modified; toggled false by .updateMetadata() [DEFAULT VALUE: true since 'date' field is the current date aka modified]
				}
			},
			enrichedMetadata: false, // will be toggled true when service worker managed to populate more metadata
		}

		// compute blob hash
		var a = new FileReader()
		a.readAsArrayBuffer(fileBlob)
		a.onloadend = () => {
			try {
				let hashPromise = crypto.subtle.digest("SHA-256", a.result)
				hashPromise.then(hashBuffer => {
					// convert hash (arraybuffer) to a hex string
					var hashView = new Uint8Array(hashBuffer);
					var hashArray = Array.from(hashView)

					var hash = hashArray
						.map(b => b.toString(16).padStart(2, "0"))
						.join("")

					// stores hash
					container.fileHash = hash

					// send data to web worker to verify if image has any valid metadata (e.g. date, location)
					if (CreatePage.worker) {
						CreatePage.worker.postMessage({
							id: this.id, // send id so when worker sends it back, we will know if process was outdated or not
							fileBlob: fileBlob,
							blobHash: hash
						})
					}
				})
			} catch (err) {
				// cannot generate blob (service worker functionality have to be cancelled)
				interfaceHandler.notification("Incompatible browser error MA", "#ff0000")
			}
		}

		return container
	}

	addImage(fileBlob) {
		// use form data field "files"
		this.entry.push(this.createEmptyImageContainer(fileBlob))

		// retrieve index
		let selectionIdx = this.entry.length -1

		// // attach click events
		// $div.on("click", e => {
		// 	this.handleImageClickSelection(selectionIdx)
		// })

		// auto trigger selection for this if it is the first entry
		console.log("[DEBUG]: entry", this.entry)
		if (this.currentSelectionIdx === -1) {
			// currently no selection bound (since there were no images)
			// view first image uploaded
			this.handleImageClickSelection(0, false)
		} else {
			// currently on a selection
			// update coutner and navigation buttons' visibility
			this.updateStats()
		}
	}

	prevSelection() {
		// references this.currentSelectionIdx
		if (this.currentSelectionIdx !== -1 && this.currentSelectionIdx >= 1) {
			// currently on a selection and has an entry behind it
			this.handleImageClickSelection(this.currentSelectionIdx -1, false)
		}
	}

	nextSelection() {
		// references this.currentSelectionIdx
		if (this.currentSelectionIdx !== -1 && this.entry.length -1 > this.currentSelectionIdx) {
			// currently on a selection and has an entry infront of it
			this.handleImageClickSelection(this.currentSelectionIdx +1, false)
		}
	}

	updateStats() {
		// updates this.$selectors["create-upload-stats"] container
		// counter & navig buttons' visibility
		// to be called only when this.currentSelectionIdx !== -1 (on a view)

		var selectionIdx = this.currentSelectionIdx

		// update counter
		this.$selectors["create-upload-counter"].text(`${selectionIdx +1}/${this.entry.length}`)

		// show hidden proceed button
		this.$selectors["create-page-topbar-right"].removeClass("hidden")

		// show navigation arrows (if there is any previous/next images to be shown)
		if (this.entry.length -1 > selectionIdx) {
			// there is more (show next button)
			this.$selectors["create-upload-next-btn"].removeClass("hidden")
		} else {
			// no more to show (hide next button)
			this.$selectors["create-upload-next-btn"].addClass("hidden")
		}

		if (selectionIdx >= 1) {
			// previous item (selectionIdx of 0 can be shown)
			this.$selectors["create-upload-prev-btn"].removeClass("hidden")
		}else {
			this.$selectors["create-upload-prev-btn"].addClass("hidden")
		}
	}

	saveCurrentFormToEntry() {
		// saves form details to entry before moving on
		// references this.currentSelectionIdx
		var selectionIdx = this.currentSelectionIdx

		var title = this.$selectors["create-form-title-input"].val().trim()
		var date = this.$selectors["create-form-date-input"].val() // in format of YYYY-MM-DDThh:mm

		this.entry[selectionIdx].metadata.title = title
		console.log("DATE", date, date !== "", date === "")
		if (date != "") {
			var [d, t] = date.split("T") // t = "hh:mm:ss.sss"
			console.log("[DEBUG]: [d, t]", d, t)
			var [year, month, day] = d.split("-")

			// datetime string "YYYY-MM-DDThh:mm:ss.sss" local time
			var datetime_string = `${year}-${month}-${day}T${t}`
			console.log("[DEBUG]: datetime_string", datetime_string)
			const dateObj = new Date(datetime_string)
			console.log("[DEBUG]: date", dateObj.valueOf(), this.entry[selectionIdx].metadata.date.valueOf())
			if (dateObj.valueOf() == this.entry[selectionIdx].metadata.date.valueOf()) {
				// same date; ignore
			} else {
				this.entry[selectionIdx].metadata.date = new Date(datetime_string)
				this.entry[selectionIdx].metadata.states.dateModified = true;
			}
		}
	}

	handleImageClickSelection(selectionIdx, refreshCall) {
		// triggered for click events
		// if refreshCall is true, this.entry has been changed, need to re-update graphics
		if (!refreshCall && this.currentSelectionIdx !== -1) {
			// was on a selection
			// save any form data
			this.saveCurrentFormToEntry()
		}

		// update counter
		this.$selectors["create-upload-counter"].text(`${selectionIdx +1}/${this.entry.length}`)

		// show hidden proceed button
		this.$selectors["create-page-topbar-right"].removeClass("hidden")

		// display edit form
		this.$selectors["create-edit-emptyplaceholder"].addClass("hidden")
		this.$selectors["create-edit-form"].removeClass("hidden")

		// show uploaded tray (and hide empty placeholder for upload tray if any)
		this.$selectors["create-upload-tray"].removeClass("hidden")
		this.$selectors["create-upload-tray-empty"].addClass("hidden")

		// show image
		this.$selectors["create-upload-img-display"].attr("srC", URL.createObjectURL(this.entry[selectionIdx].fileBlob))

		// fill up edit form
		this.populateEditForm(selectionIdx)

		// show navigation arrows (if there is any previous/next images to be shown)
		if (this.entry.length -1 > selectionIdx) {
			// there is more (show next button)
			this.$selectors["create-upload-next-btn"].removeClass("hidden")
		} else {
			// no more to show (hide next button)
			this.$selectors["create-upload-next-btn"].addClass("hidden")
		}

		if (selectionIdx >= 1) {
			// previous item (selectionIdx of 0 can be shown)
			this.$selectors["create-upload-prev-btn"].removeClass("hidden")
		} else {
			this.$selectors["create-upload-prev-btn"].addClass("hidden")
		}

		// set currentSelectionIdx (set it last else race condition between saveCurrentFormToEntryr and populateEditForm might clash causing data overlaps)
		this.currentSelectionIdx = selectionIdx
	}

	populateEditForm(selectionIdx) {
		// uses this.entry[selectionIdx].metadata to fill up this.$selectors["create-edit-form"]
		var metadata = this.entry[selectionIdx].metadata
		this.$selectors["create-form-title-input"].val(metadata.title)

		// format date to local time (dispaly date, by default will take the date right now)
		var date = metadata.date
		if (date) {
			// datetime-local input takes in value in the format of 'YYYY-MM-DDThh:mm' in local time
			var day = date.getDate().toString().padStart(2, "0")
			var month = (date.getMonth() +1).toString().padStart(2, "0")
			var year = date.getFullYear().toString().padStart(4, "0")

			var hour = date.getHours().toString().padStart(2, "0")
			var min = date.getMinutes().toString().padStart(2, "0")

			var seconds = date.getSeconds().toString().padStart(2, "0")
			var ms = date.getMilliseconds().toString().padStart(3, "0")

			var value = `${year}-${month}-${day}T${hour}:${min}:${seconds}.${ms}`

			this.$selectors["create-form-date-input"].val(value)
		}

		if (metadata.enrichedMetadata) {
			// location data
		}
	}

	deleteCurrentSelected() {
		// references this.currentSelectionIdx
		if (this.currentSelectionIdx !== -1 && this.currentSelectionIdx <= this.entry.length -1) {
			// valid currentSelectionIdx (zero index based)

			this.entry.splice(this.currentSelectionIdx, 1)
			console.log("[DEBUG]: post-deletion entry", this.entry)

			if (this.entry.length == 0) {
				// show default empty page
				this.hideContent()
			} else if (this.currentSelectionIdx <= this.entry.length -1) {
				// show the next item in list
				// 'redraw' logic
				this.handleImageClickSelection(this.currentSelectionIdx, true)
			} else {
				// deleted item was last in array (hence currentSelectionIdx does not fit)
				this.currentSelectionIdx = this.entry.length -1
				this.handleImageClickSelection(this.currentSelectionIdx, true)
			}
		}
	}

	hideContent() {
		// called when this.entry.length === 0 (no entry to show)

		// hide proceed button
		this.$selectors["create-page-topbar-right"].addClass("hidden")

		// hide edit form
		this.$selectors["create-edit-form"].addClass("hidden")

		// show empty placeholder
		this.$selectors["create-edit-emptyplaceholder"].removeClass("hidden")

		// hide uploaded tray images
		this.$selectors["create-upload-tray"].addClass("hidden")

		// show uploaded tray empty placeholder
		this.$selectors["create-upload-tray-empty"].removeClass("hidden")

		// remove img src
		this.$selectors["create-upload-img-display"].attr("src", "")

		// reset this.currentSelectionIdx (to trigger next .handleIamgeSelection() upon .addImage())
		this.currentSelectionIdx = -1
	}

	updateMetadata(blobHash, processedData) {
		// blobHash to find the exact file to update
		// processedData contains date and location properties processed by server
		for (let i = 0; i < this.entry.length; i++) {
			if (this.entry[i].fileHash === blobHash) {
				// update metdata for this
				var metadata = this.entry[i].metadata

				if ('date' in processedData) {
					metadata.date = processedData.date
				}

				if ('location' in processedData) {
					metadata.location = {
						"lat": processedData.location.lat,
						"long": processedData.location.long
					}
				}

				if ('sizeBytes' in processedData) {
					metadata.sizeBytes = processedData.sizeBytes
				}

				if ('dimensions' in processedData) {
					// processedData.dimensions = {"width": 0, "height": 0}
					metadata.dimensions = [processedData.dimensions.width, processedData.dimensions.height]
				}

				if ('cameraMake' in processedData) {
					metadata.cameraMake = processedData.cameraMake
				}

				// toggle property so this.populateEditForm knows to update with enriched metadata
				this.entry[i].enrichedMetadata = true

				// populate edit form if currently in view
				if (i === this.currentSelectionIdx) {
					this.populateEditForm(i)
				}

				// set state
				this.entry[i].metadata.states.dateModified = false // reset to default value

				// exit
				return
			}
		}
	}

	parseToFormData() {
		// returns data as a formdata object with files under the field "files"
		var formData = new FormData()
		for (let i = 0; i < this.entry.length; i++) {
			var data = this.entry[i]
			var metadata = data.metadata

			var parsedMetadata = {} // to be populated

			// only include date field if data.enrichedMetadataModified is true (else server will extract date info from image itself if date field is absent)
			if (metadata.states.dateModified) {
				// date was fetched from the server but modified still
				parsedMetadata.date = metadata.date.valueOf() // get milliseconds since epoch
			}

			// include title if any
			// note: metadata.title value has already been trimmed (string.proto.trim()) on SINGLE entry point - .saveCurrentFormToEntry()
			if (metadata.title.length >= 1) {
				parsedMetadata.title = metadata.title
			}

			formData.append("files", data.fileBlob)
			formData.append("metadata", JSON.stringify(parsedMetadata))
		}

		return formData
	}

	submitData() {
		// submit images to server

		// save whatever was written
		this.saveCurrentFormToEntry()

		if (this.entry.length >= 1) {
			// theres uploaded data
			var fd = this.parseToFormData()

			interfaceHandler.uploadImages(fd).then((returnedPayload) => {
				// success: boolean (whether upload post was successful or not)
				var [success, failedUploads] = returnedPayload
				console.log("[DEBUG]: received data server", success, failedUploads)
				if (success) {
					// create a new container for the next upload (if any)
					interfaceHandler.newCreatePageContainer();
				} else if (failedUploads) {
					// some images still salvageable

					// save entry data (for images that failed)
					var cached = []
					for (let i = 0; i < failedUploads.length; i++) {
						var fileIdx = failedUploads[i]
						if (fileIdx >= this.entry.length) {
							// file index out of range (not possible??)
							console.warn("[WARN]: fileIdx", fileIdx, "out of range for entries", this.entry)

							// skip this file index
							continue
						}

						cached.push(this.entry[fileIdx])
					}

					// create a new container with re-used data for those files that have failed
					interfaceHandler.newCreatePageContainer(cached)

					// show notification
					interfaceHandler.notification("Failed to upload these files", "#ff0000")
				} else {
					// totally failed
					// re-use the same current createPageContainer
					interfaceHandler.notification("Failed to upload", "#ff0000")
				}
			})
		}
	}

	destroy() {
		this.hideContent() // show default empty page

		this.$selectors = null // remove reference to $selectors (only after this.hideContent has been called since method manipulates DOM elements)
		this.entry = null // remove reference to entry
	}
}

$(document).ready(() => {
	console.log("[DEBUG]: alive")
	const $selectors = {
		"big-window": $("#big-window"),
		"window-blur": $("#window-blur"),
		"left-window": $("#left-window"),

		"dates-giant-container": $("#dates-giant-container"),

		"item-zoom": $("#item-zoom"),
		"item-image-element": $("#item-image-element"),

		"item-detail-title": $("#item-detail-title"),
		"item-detail-title-inputtext": $("#item-detail-title-inputtext"),
		"item-detail-date-text": $("#item-detail-date-text"),
		"item-detail-fixeddate-text": $("#item-detail-fixeddate-text"), // fixed date (uploaded date)
		"item-detail-collection-text": $("#item-detail-collection-text"),
		"item-detail-location-text": $("#item-detail-location-text"),
		"item-detail-cameraman-text": $("#item-detail-cameraman-text"),
		"item-detail-camera-text": $("#item-detail-camera-text"),
		"item-detail-filesize-text": $("#item-detail-filesize-text"),
		"item-detail-ar-text": $("#item-detail-ar-text"),
		"item-detail-filedimen-text": $("#item-detail-filedimen-text"),
		"item-detail-note": $("#item-detail-note"),

		"item-detail-more": $("#item-detail-more"),
		"item-detail-more-trigger": $("#item-detail-more-trigger"),
		"item-detail-more-trigger-image": $("#item-detail-more-trigger-image"),

		"notification-panel": $("#notification-panel"),
		"notification-container": $("#notification-container"),
		"task-save-path": $(".task-save-path"),
		"task-save-path check": $(".task-save-path.check"),
		"task-save-path circle": $(".task-save-path.circle"),
		"notification-text-element": $("#notification-text-element"),

		"left-panel-action-home": $("#left-panel-action-home"),
		"left-panel-action-search": $("#left-panel-action-search"),
		"left-panel-action-create": $("#left-panel-action-create"),
		"left-panel-action-settings": $("#left-panel-action-settings"),

		"settings-page": $("#settings-page"),
		"page-window-navig-button": $(".page-window-navig-button"),

		"create-page": $("#create-page"),
		"create-page-topbar-right": $("#create-page-topbar-right"),
		"create-page-proceed-btn": $("#create-page-proceed-btn"),

		"create-upload-tray": $("#create-upload-tray"),
		"create-upload-delete-btn": $("#create-upload-delete-btn"),
		"create-upload-prev-btn": $("#create-upload-prev-btn"),
		"create-upload-next-btn": $("#create-upload-next-btn"),
		"create-upload-more-btn": $("#create-upload-more-btn"),
		"create-upload-counter": $("#create-upload-counter"),
		"create-upload-img-display": $("#create-upload-img-display"),
		"create-upload-tray-empty": $("#create-upload-tray-empty"),

		"create-info-container": $("#create-info-container"),
		"create-edit-emptyplaceholder": $("#create-edit-emptyplaceholder"),
		"create-edit-form": $("#create-edit-form"),

		"create-form-title-input": $("#create-form-title-input"),
		"create-form-date-input": $("#create-form-date-input"),
		"create-form-dateinput-info": $("#create-form-dateinput-info"),

		"create-file-input": $("#create-file-input"),
		"create-upload-btn": $("#create-upload-btn")
	}
	const simpleSelectors = {
		"item-zoom": document.getElementById("item-zoom")
	}

	// allow click events to go through for input element
	$selectors["item-detail-title-inputtext"].on("click", e => {
		e.stopPropagation();
		e.preventDefault();

		$selectors["item-detail-title-inputtext"].focus();
	})

	// auto save when text has been idle for some time
	const TITLE_EDIT_IDLE_THRESHOLD = 5000; // 5 seconds
	var timeOutEventId; // stores the timer id returned by setTimeout
	$selectors["item-detail-title-inputtext"].on("input", e => {
		if (timeOutEventId) {
			clearTimeout(timeOutEventId)
		}

		timeOutEventId = setTimeout(() => {
			// send contents to server
			var result = APIClass.Actions.modifyTitle(interfaceHandler.currentImageUid, $selectors["item-detail-title-inputtext"].val())
			result.then(success => {
				interfaceHandler.notification("Saved!", "#80a86d")
				console.log("[DEBUG]: success:", success)
			})
		}, TITLE_EDIT_IDLE_THRESHOLD)
	})

	// for task_save_checkmark icon (svg)
	var check_dasharray_length = $selectors["task-save-path check"][0].getTotalLength()
	$selectors["task-save-path check"].css("stroke-dasharray", check_dasharray_length)
	$selectors["task-save-path check"].css("stroke-dashoffset", check_dasharray_length)

	var circle_dasharray_length = $selectors["task-save-path circle"][0].getTotalLength()
	$selectors["task-save-path circle"].css("stroke-dasharray", circle_dasharray_length)
	$selectors["task-save-path circle"].css("stroke-dashoffset", circle_dasharray_length)

	// create page upload interface handler
	$selectors["create-upload-btn"].on("click", e => {
		e.preventDefault()
		$selectors["create-file-input"].trigger("click")
	})
	$selectors["create-upload-more-btn"].on("click", e => {
		e.preventDefault()
		$selectors["create-file-input"].trigger("click")
	})

	// listener for image uploads to create page
	$selectors["create-file-input"].on("change", e => {
		e.preventDefault();
		const files = $selectors["create-file-input"].prop("files")

		// get the current create page container
		var createPageContainer = interfaceHandler.getCreatePageContainer()

		// add file blobs one by one to createPageContainer
		for (let i = 0; i < files.length; i++) {
			createPageContainer.addImage(files[i])
		}

		// debug
		const fd = createPageContainer.parseToFormData()
		console.log(fd.getAll("files"), fd.getAll("metadata"))

		// reset so change event will fire
		e.target.value = null;
	})

	// form actions
	$selectors["create-form-title-input"].on("click", e => {
		e.preventDefault()
		e.stopPropagation()

		$selectors["create-form-title-input"].focus()
	})

	// form title input
	var createFormTitleInputTimeoutEventId;
	$selectors["create-form-title-input"].on("input", e => {
		if (createFormTitleInputTimeoutEventId) {
			clearTimeout(createFormTitleInputTimeoutEventId)
		}

		createFormTitleInputTimeoutEventId = setTimeout(() => {
			// get the current create page container
			var createPageContainer = interfaceHandler.getCreatePageContainer()

			// save form data via method
			createPageContainer.saveCurrentFormToEntry()
		}, 1000)
	})

	// form date input
	$selectors["create-form-date-input"].on("click", e => {
		e.preventDefault()
		e.stopPropagation()

		$selectors["create-form-date-input"].focus()
	})

	// delete button on create-upload page
	$selectors["create-upload-delete-btn"].on("click", e => {
		e.preventDefault();

		// retrieve create page container
		var createPageContainer = interfaceHandler.getCreatePageContainer()

		createPageContainer.deleteCurrentSelected()
	})

	// prev/next navig buttons for create upload container
	$selectors["create-upload-prev-btn"].on("click", e => {
		e.preventDefault()

		// retrieve create page container
		var createPageContainer = interfaceHandler.getCreatePageContainer()

		createPageContainer.prevSelection()
	})
	$selectors["create-upload-next-btn"].on("click", e => {
		e.preventDefault()

		// retrieve create page container
		var createPageContainer = interfaceHandler.getCreatePageContainer()

		createPageContainer.nextSelection()
	})

	// proceed button on create page
	// event to be attached before interfaceHandler.registerPages() be fired since page-window-navig-button events are set then
	$selectors["create-page-proceed-btn"].on("click", e => {
		// submit uploaded date to server

		// retrieve create page container
		var createPageContainer = interfaceHandler.getCreatePageContainer()

		// delegate it to create page object
		createPageContainer.submitData()
	})

	// disable submit function on edit details form (title, date)
	// instead, forward request to $selectors["create-page-proceed-btn"]
	$selectors["create-edit-form"].on("submit", e => {
		e.preventDefault()

		$selectors["create-page-proceed-btn"].trigger("click")
	})

	// proxy trigger for summary tab on close up view page
	$selectors["item-detail-more-trigger"].on("click", () => {
		var attr = $selectors["item-detail-more"].attr("open")
		if (attr == false || attr == undefined) {
			$selectors["item-detail-more"].prop("open", true)
			$selectors["item-detail-more-trigger-image"].attr("src", "/navig_icons/unfold_less_double.svg")
		} else {
			$selectors["item-detail-more"].prop("open", false)
			$selectors["item-detail-more-trigger-image"].attr("src", "/navig_icons/unfold_more_double.svg")
		}
	})

	// 'hydrate' page with info
	$selectors["create-form-dateinput-info"].text(`Dates are in ${Intl.DateTimeFormat().resolvedOptions().timeZone} timezone`)

	// main interface controller
	interfaceHandler.ready($selectors)
	interfaceHandler.isReady = true

	// register gestures controller
	interfaceHandler.registerGestures()

	// testing
	// interfaceHandler.switchPage(2)
})