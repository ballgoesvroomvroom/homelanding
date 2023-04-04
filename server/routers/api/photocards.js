const baseURL = `/${encodeURIComponent("<3")}`

const express = require("express")
const multer = require("multer")
const exifr = require("exifr")
const fs = require("fs")
const path = require("path")

const backend_handler = require(path.join(__dirname, "../../includes/hearts_dump_handler.js"))
const auth_router = require(path.join(__dirname, "../auth_router.js"));

const hearts_path = path.join(__dirname, "../../../public/hearts/")

const router = express.Router()

const file_ext_mimetypes = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"video/mp4": "mp4",
	"video/quicktime": "mov",
	"image/webp": "webp"
}

function trimOutFileExtension(filename) {
	var s = filename.split(".")
	return s.slice(0, -1).join(".")
}

var unique_ticker = 0; // for when multiple same file uploads resulting in the same Date.now() result and same file name
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, hearts_path)
	},
	filename: function (req, file, cb) {
		cb(null, `[${trimOutFileExtension(file.originalname)}]_${Date.now()}_${unique_ticker++}.${file_ext_mimetypes[file.mimetype]}`)
	}
})
const upload = multer({storage: storage});

// returns a list of files in /public/hearts
router.get("/laided-pathway", (req, res) => {
	/*
	 *	return payload = [[dayInNumberSinceUnixEpoch, [givenTitle, filePath, ms_since_epoch], ...], [dayInNumberSinceUnixEpoch, [givenTitle, filePath, ms_since_epoch]]]
	 */
	res.json(backend_handler.fetchImages())
})

// returns image details from uid
router.get("/query/:uid", (req, res) => {
	var uid = req.params.uid.toString() // no clue what is done with encoding under the hood
	return res.json(backend_handler.queryImageDetails(uid))
})

// modify image details (single image with uid)
router.post("/modify/:uid", auth_router.admin_authenticated, (req, res) => {
	var uid = req.params.uid.toString()
	console.log(req.body)
	var body = req.body

	var success = backend_handler.modifyImageDetails(uid, body)
	if (success) {
		return res.status(200).end()
	} else {
		return res.status(400).end() // possibly wrong request body
	}
})

// use server resources to retrieve image details (date, location, camera make, size in bytes, dimensions)
router.post("/image-fetch-details", auth_router.admin_authenticated, upload.array("files"), (req, res) => {
	req.files.forEach(fileObj => {
		var imageObj = new backend_handler.Image(fileObj.path, fileObj.filename, fileObj.size, "", {'timezonePref': "Asia/Singapore"})

		imageObj
			.process()
			.then(() => imageObj.pack())
			.then(d => {
				res.json({
					date: d.ms_since_epoch,
					sizeBytes: d.sizeBytes,
					location: {
						lat: d.ext_data.lat,
						long: d.ext_data.long
					},
					dimensions: {
						width: d.ext_data.width,
						height: d.ext_data.height
					}
				})
			}).catch(err => {
				// most likely no dates
				res.json({})
				console.log("failed to process")
			}).then(() => imageObj.destroy())
	})
})

// uploads images
router.post("/upload", auth_router.admin_authenticated, upload.array("files"), (req, res) => {
	// determine if formData was sent correctly
	// format body.metadata first
	if (typeof req.body.metadata == "string" && req.body.metadata.length === 0) {
		// empty string
		return
	} else if (typeof req.body.metadata == "string") {
		// req.body.metadata is a string representing metadata for one file
		// e.g. req.body.metadata = "{'title': 'burger'}"
		// wrap it in an array
		req.body.metadata = [req.body.metadata]
	}

	// 'files' field of formData parsed to req.files instead of req.body.files
	if (!('timezonePref' in req.body) || (req.body.timezonePref.length === 0) || !('metadata' in req.body) || (req.files.length !== req.body.metadata.length)) {
		// invalid body
		console.log("[DEBUG]: request to /upload failed with request body", req.body)
		return res.status(400).end()
	}

	const timezonePref = req.body.timezonePref // should be a string, e.g. "UTC" or "Asia/Singapore"
	const handleFileScheduler = new backend_handler.Scheduler()
	var fileIdx = -1; // use to index user input'ted' metadata
	req.files.forEach(fileObj => {
		/*	fileObj = {
		 *		fieldname: "files",
		 *		originalname: "IMG-123.jpg",
		 *		encoding: "7bit",
		 *		mimetype: "image/jpeg",
		 *		destination: "full-file-destination (where it is stored) on system (WITHOUT FILENAME)",
		 *		filename: "actual-filename with extensions e.g. image.jpg",
		 *		path: "full-file-path on system (including filename) e.g. C:/users/User/desktop/image.jpg",
		 *		size: 123 (in bytes)
		 */
		console.log("[DEBUG]: FULL RAW CONTENT", fileObj)
		handleFileScheduler.queue.push({
			path: fileObj.path,
			filename: fileObj.filename,
			sizeBytes: fileObj.size,
			originalFilename: fileObj.originalname,
			uploadedMetadata: JSON.parse(req.body.metadata[++fileIdx]),
			timezonePref: timezonePref
		})
	})

	handleFileScheduler.act().then(() => {
		if (handleFileScheduler.unsuccessful.length == handleFileScheduler.queue.length) {
			// totally not okay
			return res.json({status: 3})
		} else if (handleFileScheduler.unsuccessful.length > 0) {
			// semi-okay (returns the array containing the original names of the files that have failed)
			return res.json({status: 2, unsuccessful: handleFileScheduler.unsuccessful})
		} else if (handleFileScheduler.unsuccessful.length == 0) {
			// all okay
			return res.json({status: 1})
		}
	})
})


module.exports = { // export router object and authenticated middleware
	baseURL, router
}