const tree = {
	'root': {
		'cat_pics': {
			'rom.png': true,
			'bom.jpg': true,
			'crom.png': true
		},
		'clips': {
			'trash': {
			},
			'goals': {
				'clip1.mp4': true,
				'clip2.mp4': true
			},
			'g2.gif': true,
			'cs2.mp4': true
		},
		'artworks': {
			'pen_render': {
				'render_4k.png': true,
				'render_2k.png': true
			}
		}
	}
}

const fileTypeToImageMap = ["/navig_icons/image.svg", "/navig_icons/video.svg", "/navig_icons/folderopen.svg"]

var currentdirectory = "root:/"

$(document).ready(function() {
	var prev_hist = [];
	var forw_hist = [];
	var currenttree, currentprompt, currentfileinview
	var $currentSelectedFileItem

	const $selectors = {
		"pathdisp": $("#pathdisp"),
		"fileview-container": $("#fileview-container"),
		"navigbutton-back": $("#navigbutton-back"),
		"navigbutton-forward": $("#navigbutton-forward"),

		"filedisplay": $("#filedisplay"),
		"filecard-close": $("#filecard-close"),
		"filecard-maximise": $("#filecard-maximise"),
		"filecard-minimise": $("#filecard-minimise"),
		"fileheader": $("#fileheader"),
		"filecontentcontainer": $("#filecontentcontainer"),
		"filecontent": $("#filecontent"),

		"confirmationcontainer": $("#confirmationcontainer"),
		"confirmationcard": $("#confirmationcard"),
		"confirmationcardtext": $("#confirmationcardtext"),
		"confirmationbutton": $("#confirmationbutton")
	}

	function resourcepointerToActualPath(resourcepointer) {
		// resourcepointer e.g. 'root:/abc/path/1.jpg'
		// remove 'root' text
		var path = resourcepointer.split("/")

		let pathstring = "cannon/"

		// do not -1 because last item is not an empty string (resourcepointer is to a file, not a folder, hence no trailing forward slashes)
		for (let i = 1; i < path.length; i++) {
			pathstring += path[i] +"/"
		}

		// slice out last character (trailing forward slash) after the file extension
		return pathstring.slice(0, pathstring.length -1)
	}

	function showConfirmation(resourcepointer) {
		// remove active highlighting on file item first
		if ($currentSelectedFileItem) {
			$currentSelectedFileItem.removeClass("active")
			$currentSelectedFileItem = null
		}

		currentprompt = resourcepointer

		// update prompt text
		$selectors["confirmationcardtext"].text(resourcepointer.replace("root", "~"))

		// show prompt
		$selectors["confirmationcontainer"].css("display", "block")
		setTimeout(() => $selectors["confirmationcard"].addClass("active"), 100)
	}

	function processConfirmation(confirmed) {
		if (currentprompt) {
			// only trigger if there is currently a prompt (currentprompt stores the resource pointer)

			console.log(confirmed)
			if (confirmed) {
				// hide prompt
				$selectors["confirmationcard"].removeClass("active")
				setTimeout(() => $selectors["confirmationcontainer"].css("display", "none"), 250)

				viewFile(currentprompt)
			} else {
				// just hide prompt
				$selectors["confirmationcard"].removeClass("active")
				setTimeout(() => $selectors["confirmationcontainer"].css("display", "none"), 250)
			}

			currentprompt = null;
		}
	}

	function viewFile(resourcepointer) {
		currentfileinview = resourcepointer

		// load up html element needed for this filetype
		if (determineFiletype(resourcepointer) == 1) {
			const $img = $("<img>", {
				id: "filecontent",
				src: resourcepointerToActualPath(resourcepointer)
			})

			$img.appendTo($selectors["filecontentcontainer"])
		} else {
			// video
			const $vid = $("<video>", {
				id: "filecontent",
				src: resourcepointerToActualPath(resourcepointer)
			})

			$vid.prop("autoplay", true)
			$vid.prop("loop", true)
			$vid.prop("muted", true)

			$vid.appendTo($selectors["filecontentcontainer"])
		}

		// set header text
		$selectors["fileheader"].text(resourcepointer.replace("root", "~"))

		$selectors["filedisplay"].show(100)
	}

	function closeFileviewing() {
		currentfileinview = null
		$selectors["filedisplay"].hide(100)

		$selectors["filecontentcontainer"].empty()
	}

	function determineFiletype(path) {
		// determines filetype based on file extension
		// returns 1 for images, 2 for videos, 3 for folders (follows fileTypeToImageMap)
		var individual_path = path.split("/")
		var focus = individual_path[individual_path.length -1] // last item

		// split by '.' separator
		var filename_split = focus.split(".")
		if (filename_split.length == 1) {
			// no extensions
			return 3
		}

		var extension = filename_split[filename_split.length -1]
		if (extension == "jpg" || extension == "png" || extension == "gif") {
			return 1
		} else {
			// video (mp4)
			return 2
		}
	}

	function buildFileitem(filename) {
		const $fileitem = $("<div>", {
			"class": "fileitem"
		})

		const $fileitem_treelink = $("<div>", {
			"class": "fileitem-treelink"
		})
		const $p = $("<p>")
		$p.html(`<img src="${fileTypeToImageMap[determineFiletype(filename) -1]}">${filename}`)

		$fileitem_treelink.appendTo($fileitem)
		$p.appendTo($fileitem)

		return $fileitem
	}

	function buildSubtree(subtree) {
		// subtree must not be a file
		// subtree must have a trailing forward slash

		// clear out current file items
		$selectors["fileview-container"].empty()

		var path = subtree.split("/")
		var dir = tree

		// -1 because of empty string in path array (.split caused it due to trailing forward slash)
		var pathstring = "root:/" // build path string
		for (let i = 0; i < path.length -1; i++) {
			if (i > 0) {
				// dont add in 'root'
				pathstring += path[i] +"/"
			}
			dir = dir[path[i]]
		}

		// display filepath in pathdisp
		$selectors["pathdisp"].text(pathstring)

		// update current tree variable
		currenttree = subtree

		for (const [filename, exists] of Object.entries(dir)) {
			if (exists) {
				const $fileitem = buildFileitem(filename)
				$fileitem.appendTo($selectors["fileview-container"])

				let resourcepointer;
				if (typeof dir[filename] == "object") {
					// target is a folder
					resourcepointer = subtree +filename +"/" // important to add the trailing slash

					$fileitem.on("click", function() {
						// remove active highlighting on file item (file not folders)
						if ($currentSelectedFileItem) {
							$currentSelectedFileItem.removeClass("active")
							$currentSelectedFileItem = null
						}

						// set previous history
						prev_hist.push(subtree)


						// clear forward history
						forw_hist = [];

						// disable forward button
						disableNavigButton(1, true)

						// enable previous button
						disableNavigButton(0, false)

						// load up new subtree (directory)
						buildSubtree(resourcepointer)
					})
				} else {
					// just a regular file
					resourcepointer = subtree +filename // path already has trailing slash
					
					$fileitem.on("click", function() {
						if ($currentSelectedFileItem) {
							$currentSelectedFileItem.removeClass("active");
						}

						$currentSelectedFileItem = $fileitem
						$fileitem.addClass("active");
						
						showConfirmation(resourcepointer)
					})
				}
			}
		}
	}

	$selectors["confirmationbutton"].on("click", function(e) {
		e.stopPropagation()
		processConfirmation(true)
	})
	$selectors["confirmationcard"].on("click", function(e) {
		// just stop propagation onto confirmationcontainer (else will close prompt)
		e.stopPropagation()
	})
	$selectors["confirmationcontainer"].on("click", function(e) {
		processConfirmation(false)
	})

	function disableNavigButton(buttonIndex, toDisable) {
		// acts on back button (buttonIndex of 0) or forward button (buttonIndex of 1)
		var buttonToAct = buttonIndex == 0 ? "navigbutton-back" : "navigbutton-forward"

		if (toDisable) {
			$selectors[buttonToAct].addClass("navigbuttons-disabled")
		} else {
			$selectors[buttonToAct].removeClass("navigbuttons-disabled")
		}
	}

	$selectors["navigbutton-back"].on("click", function() {
		if ($selectors["navigbutton-back"].hasClass("navigbuttons-disabled")) {
			// button is disabled
			return
		}

		// set forward history
		forw_hist.push(currenttree);

		// go back to last viewed page
		buildSubtree(prev_hist.pop())

		disableNavigButton(0, prev_hist.length == 0)
		disableNavigButton(1, false) // there has to be something in forw_hist
	})

	$selectors["navigbutton-forward"].on("click", function() {
		if ($selectors["navigbutton-forward"].hasClass("navigbuttons-disabled")) {
			// button is disabled
			return
		}

		// add subtree to prev_hist
		prev_hist.push(currenttree)

		// go forward to last backed out page
		buildSubtree(forw_hist.pop())

		disableNavigButton(1, forw_hist.length == 0)
		disableNavigButton(0, false) // there has to be something in prev_hist
	})

	$selectors["filecard-close"].on("click", closeFileviewing)

	$selectors["filecard-maximise"].on("click", () => {
		// open a new tab to resourcepointer if currentfileinview is not null
		if (currentfileinview) {
			window.open(currentfileinview.replace("root", "cannon"), "_blank")
		}
	})

	buildSubtree("root/")
})