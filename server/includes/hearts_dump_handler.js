const path = require("path")
const fs = require("fs")
const sharp = require("sharp")
const crypto = require("crypto")
const exifr = require("exifr")
const moment = require('moment-timezone');

const databaseInterface = require("../database/interface.js");
const images_db = databaseInterface.images_db

const IMAGES_DIR = path.join(__dirname, "")

function trimOutFileExtension(filename) {
	var s = filename.split(".")
	return s.slice(0, -1).join(".")
}

class UploadError {
	static noDate = 1
	static noDimensions = 2
}

class Utils {
	// timezone issues (found this amazing solution on stackoverflow written by Matt)
	// calculates the timezone difference from local (uploaded user) and UTC time
	// timeZone: string (e.g. "Asia/Singapore" or "America/New_York")
	// https://stackoverflow.com/a/29268535/12031810
	static getTimeZoneOffset(date, timeZone) {
		// Abuse the Intl API to get a local ISO 8601 string for a given time zone.
		// let iso = date.toLocaleString('en-CA', { timeZone, hour12: false }).replace(', ', 'T'); // not reliable on different os

		// use moment instead (as a proxy, sort-of)
		var t = moment(date.toISOString()) // UTC timezone
		var localisedT = t.tz(timeZone)
		var isoFromMoment = localisedT.format("YYYY-MM-DDTHH:mm:ss.SSS") // local iso 8601

		// Include the milliseconds from the original timestamp
		// iso += '.' + date.getMilliseconds().toString().padStart(3, '0');

		// Lie to the Date object constructor that it's a UTC time.
		console.log("[DEBUG]: gettzoffset", date, isoFromMoment)
		const lie = new Date(isoFromMoment + 'Z');
		console.log("[DEBUG]: processed lie", lie, lie - date, -(lie-date))

		// Return the difference in timestamps, as minutes
		// Positive values are West of GMT, opposite of ISO 8601
		// this matches the output of `Date.getTimeZoneOffset`
		return -(lie - date) / 60 / 1000;
	}
}

class Properties {
	constructor(filesizeBytes = -1, originalname = "") {
		this.filesizeBytes = filesizeBytes
		this.originalname = originalname
		this.date = {}
		this.dimensions = {}
		this.location = {}
		this.metadata = {
			hasDateInfo: false,
			hasLocInfo: false,
			isCustomDateInput: false // toggled true when date info was inputted by client rather than extracted
		}
	}

	addLocation(lat, long) {
		this.location = {
			lat: lat,
			long: long
		}

		this.metadata.hasLocInfo = true
	}

	addDimensions(width, height) {
		this.dimensions = {
			width: width,
			height: height
		}
	}

	addDateTaken(dateObj, localTimezone, customDateInput) {
		// dateObj.valueOf() should return the representive second in time (respective to localTimezone) for the image date (be it custom input or not)
		console.log("[DEBUG]: dateObj:", dateObj, dateObj.valueOf())
		console.log("[DEBUG]: .getTimezoneOffset()", dateObj.getTimezoneOffset())
		this.date = {
			ms_since_epoch: dateObj.valueOf(),
			days_since_epoch: Math.floor(dateObj /8.64e7),
			repr_date: new Date(dateObj).toLocaleString("en-US", {timeZone: "Asia/Singapore"})
		}

		var localTimezoneOffsetFromUTC = Utils.getTimeZoneOffset(dateObj, localTimezone)
		var localDate = new Date(dateObj.valueOf() -localTimezoneOffsetFromUTC  *60000)
		this.localUploadedDate = {
			// local to the user who uploaded
			offset: localTimezoneOffsetFromUTC,
			day: localDate.getUTCDate(), // always operate in UTC timezone (server locations may change)
			month: localDate.getUTCMonth() +1, // since everything is 1 index based
			year: localDate.getUTCFullYear()
		}

		this.metadata.hasDateInfo = true
		this.metadata.isCustomDateInput = customDateInput // determine whether date was extracted from image or user-inputted
	}
}

class Image {
	static imagesFolderDir = path.join(__dirname, "../../public/hearts")
	static compressedImagesFolderDir = path.join(Image.imagesFolderDir, "./compressed")

	constructor(filepath, filename, filesizeBytes, originalname, uploadedMetadata) {
		console.log("[DEBUG]: original name", originalname)
		this.filepath = filepath
		this.filename = filename
		this.filename_wo_ext = trimOutFileExtension(filename)
		this.imageProperties = new Properties(filesizeBytes = filesizeBytes, originalname = originalname)

		this.uploadedMetadata = uploadedMetadata // should contain (date and timezonePref; latter set by scheduler.act())

		this.compressed = {}; // dict containing compressed versions

		// fill uploadedMetadata with default properties
		this.uploadedMetadata.title ??= "" // default value of ""
	}

	process() {
		// extract exif data (package as Properties object)
		// this.buffer = fs.readFileSync(this.filepath, "base64");
		console.log("[DEBUG]: processing..", this.filepath)
		return exifr.parse(this.filepath, true).then(r => {
			// date
			var date;
			var customDateInput = false;

			// check if date field is present in uploadedMetadata
			if ('date' in this.uploadedMetadata) {
				// this.uploadedMetadata should represent the milliseconds since unix epoch
				date = new Date(this.uploadedMetadata.date)
				customDateInput = true; // set this to true so imageProperties know that date was NOT extracted from the image itself
				console.log("[DEBUG]: custom date used with", this.uploadedMetadata.date, date)
			} else {
				date = r.DateTimeOriginal // should be in UTC
				console.log("[DEBUG]: original date", date)

				// date returned by exifr.parse() is built using Date object, hence it will take it as the local date & time (in perspective of the systems time)
				// hence we extract the individual components and work off there, instead of relying on the UTC components
				// using extracted components to create the same exact date with moment.js just that with the uploaded timezone set provided (spoofing the timezone)
				var day = date.getDate().toString().padStart(2, "0")
				var month = (date.getMonth() +1).toString().padStart(2, "0")
				var year = date.getFullYear().toString().padStart(4, "0")

				var hour = date.getHours().toString().padStart(2, "0")
				var min = date.getMinutes().toString().padStart(2, "0")
				var sec = date.getSeconds().toString().padStart(2, "0")
				var ms = date.getMilliseconds().toString().padStart(3, "0")

				// in the format YYYY-MM-DD HH:mm:ss.SSS (for moment object)
				var format_date_string = `${year}-${month}-${day} ${hour}:${min}:${sec}.${ms}`
				console.log("[DEBUG]: formatted string", format_date_string)

				// create moment object and force the extracted date info to be in the uploaded user's timezone
				var momentObj = moment.tz(format_date_string, this.uploadedMetadata.timezonePref)
				console.log("[DEBUG]: moment object", momentObj)

				// convert it back to utc
				date = new Date(momentObj.utc().valueOf())
			}

			console.log("[DEBUG]: parsed date", date)
			if (date) {
				this.imageProperties.addDateTaken(date, this.uploadedMetadata.timezonePref, customDateInput)
			} else {
				// no date, reject

				// debug
				console.log("[DEBUG]:", r)
				return Promise.reject(UploadError.noDate)
			}

			// dimensions
			var height = r.ImageHeight || r.ExifImageHeight; // falsy values include number 0
			var width = r.ImageWidth || r.ExifImageWidth
			if (height && width) {
				this.imageProperties.addDimensions(height, width)
			} else {
				return Promise.reject(UploadError.noDimensions)
			}

			// location
			if (r.latitude && r.longitude) {
				this.imageProperties.addLocation(r.latitude, r.longitude)
			}
		})
	}

	createLowerRes(qualityRes) {
		// qualityRes: array containing numbers of quality to scale down
		var destination_folder = Image.compressedImagesFolderDir;
		qualityRes = qualityRes.map(qualityReduced => {
			var newFilename = `${this.filename_wo_ext}_${qualityReduced}.webp`
			var newFileDest = path.join(destination_folder, newFilename)

			console.log("[DEBUG]: creating write stream for", this.filepath)
			// create in/out streams
			const readableStream = fs.createReadStream(this.filepath)
			const writableStream = fs.createWriteStream(newFileDest)

			// create sharp pipeline
			const transform = sharp()
				.webp({quality: qualityReduced})

			// funnel pipeline
			readableStream.pipe(transform).pipe(writableStream)
			console.log("[DEBUG]: stream funneled")

			// update data
			writableStream.on("finish", () => {
				this.compressed[qualityReduced] = {
					filename: newFilename,
					filepath: newFileDest,
					sizeBytes: writableStream.bytesWritten
				}
			})

			return newFileDest
		})
		console.log("[DEBUG]: post-map:", qualityRes)
	}

	getUid() {
		// returns a unique key that does not exist in images_db.data.images
		while (true) {
			var key = crypto.randomBytes(32).toString("hex")
			if (key in images_db.data.images) {
				// regenerate
				continue
			} else {
				return key
			}
		}
	}

	pack() {
		return {
			title: this.uploadedMetadata.title,
			note: "",
			collection: "",
			filename: this.filename,
			sizeBytes: this.imageProperties.filesizeBytes,
			ms_since_epoch: this.imageProperties.date.ms_since_epoch,
			uploaded_timezone_str: this.uploadedMetadata.timezonePref,
			ext_data: {
				orig_name: this.imageProperties.originalname,
				lat: this.imageProperties.location.lat,
				long: this.imageProperties.location.long,
				width: this.imageProperties.dimensions.width,
				height: this.imageProperties.dimensions.height,
				repr_date: this.imageProperties.date.repr_date,
				is_custom_date_input: this.imageProperties.metadata.isCustomDateInput
			},
			localUploadedDate: this.imageProperties.localUploadedDate, // array in itself
			compressed: this.compressed
		}
	}

	addToDatabase() {
		// get uid
		var generatedUid = this.getUid()

		// pack data
		var data = this.pack()

		// insert entry into images_db.data.images with generatedUid (for lookup purposes)
		images_db.data.images[generatedUid] = data

		// find current branch (year, month, day; LOCAL TO UPLOADED USERS TIME, this.imageProperties.localUploadedDate) in sortedTrees
		var s = images_db.data.sortedTree
		var localUploadedDate = this.imageProperties.localUploadedDate
		if (!(localUploadedDate.year.toString() in s)) {
			var yearBranch = {}
			s[localUploadedDate.year.toString()] = yearBranch

			// build the month and day branch too
			var monthBranch = {}
			yearBranch[localUploadedDate.month.toString()] = monthBranch

			monthBranch[localUploadedDate.day.toString()] = {
				images: [],
				properties: {
					"custom_name": `${localUploadedDate.day}/${localUploadedDate.month}/${localUploadedDate.year}`,
					"background_image_filename": ""
				}
			}
		}

		var yearBranch = s[localUploadedDate.year.toString()]
		if (!(localUploadedDate.month.toString() in yearBranch)) {
			// build the month and day branch
			var monthBranch = {}
			yearBranch[localUploadedDate.month.toString()] = monthBranch

			monthBranch[localUploadedDate.day.toString()] = {
				images: [],
				properties: {
					"custom_name": `${localUploadedDate.day}/${localUploadedDate.month}/${localUploadedDate.year}`,
					"background_image_filename": ""
				}
			}
		}

		var monthBranch = yearBranch[localUploadedDate.month.toString()]
		if (!(localUploadedDate.day.toString() in monthBranch)) {
			monthBranch[localUploadedDate.day.toString()] = {
				images: [],
				properties: {
					"custom_name": `${localUploadedDate.day}/${localUploadedDate.month}/${localUploadedDate.year}`,
					"background_image_filename": ""
				}
			}
		}

		var dayBranch = monthBranch[localUploadedDate.day.toString()]
		var imagesBranch = dayBranch.images

		if (imagesBranch.length == 0) {
			imagesBranch.push(generatedUid); // simply push
			return; // nothing else to do
		}

		// compare epoch time (UTC) (this.imageProperties.date.ms_since_epoch)
		// first get a map of the epoch times for images already in imagesBranch
		var uploadTimings = imagesBranch.map(storedImageUid => {
			// gaurantee to exist?
			return images_db.data.images[storedImageUid].ms_since_epoch
		})

		// find index to sort in ascending order (with this.imageProperties.date.ms_since_epoch)
		var ms_since_epoch = this.imageProperties.date.ms_since_epoch // shorthand
		for (let i = 0; i < uploadTimings.length; i++) {
			if (ms_since_epoch < uploadTimings[i]) {
				imagesBranch.splice(i, 0, generatedUid)
				break
			} else if (i == uploadTimings.length -1) {
				// last index
				imagesBranch.push(generatedUid)
			}
		}
		console.log("[DEBUG]: done adding to database")
	}

	destroy() {
		// remove references to objects
		this.imageProperties = null;
		this.properties = null;

		// deletes image from file system
		fs.unlink(this.filepath, err => {
			if (err) {
				console.warn("[DEBUG]: unable to delete file", this.filepath, "with error:", err)
			} else {
				console.log("[DEBUG]: deleted file successfully")
			}
		})

		// delete compressed images from file system (if any)
		for (const [resQuality, compressedObj] of Object.entries(this.compressed)) {
			fs.unlink(compressedObj.filepath, err => {
				if (err) {
					console.warn("[DEBUG]: unable to delete compressed file", compressedObj.filepath, "with error:", err)
				}
			})
		}
	}
}

class Scheduler {
	// processes multiple images in order to ensure no concurrent writes occur
	constructor() {
		this.queue = []
		this.unsuccessful = [] // stores the index (referencing this.queue) which has failed
	}

	act() {
		return new Promise(async res => {
			for (let i = 0; i < this.queue.length; i++) {
				// obj = [fileObj.pathonsystem, fileObj.filenamewithext, fileObj.sizeInBytes, fileObj.originalname]
				const obj = this.queue[i];

				// include obj.timezonePref into obj.uploadedMetadata
				obj.uploadedMetadata.timezonePref = obj.timezonePref

				// constructor arguments: filepath, filename, filesizeBytes, originalname, uploadedMetadata
				const handleFileObject = new Image(
					obj.path,
					obj.filename,
					obj.sizeBytes,
					obj.originalFilename,
					obj.uploadedMetadata
				)

				// execute main process
				await handleFileObject.process()
					.then(() => handleFileObject.createLowerRes([20, 50]))
					.then(() => {
						console.log("[DEBUG]: done processing image", handleFileObject.imageProperties)
						handleFileObject.addToDatabase()
				}).catch(errCode => {
					// error handling
					if (typeof errCode == "number") {
						console.warn("[DEBUG]: handleFileObject returned error code:", errCode, "when .process() method was called")
					} else {
						console.error("[CAUGHT ERROR]:", errCode)
					}

					// delete file
					handleFileObject.destroy()

					// add it to this.unsuccessful references
					this.unsuccessful.push(i)
				})
			}

			res()
		})
	}
}

// returns nested array containing the images in order
function fetchImages(compressed=true) {
	/*
	 *	return payload = [[image_uid, filePath, ms_since_epoch], ...]; files returned are in ascending timestamp order
	 */

	return images_db.data.sortedTree
	var payload = []
	console.log("[DEBUG]: FETCHING", images_db.data.sorted)

	for (let i = 0; i < images_db.data.sorted.length; i++) {
		var image_uid = images_db.data.sorted[i]
		var data = images_db.data.images[image_uid]

		// determine if to send raw uncompressed filename or not
		var filename = data.filename
		if (compressed && data.compressed) {
			filename = "/compressed/" // add in the directory
			if ("20" in data.compressed) {
				filename += data.compressed["20"].filename
			} else if ("50" in data.compressed) {
				filename += data.compressed["50"].filename
			} else {
				// reset
				filename = data.filename
			}
		}

		payload.push([image_uid, filename, data.ms_since_epoch])
	}

	return payload
}

function queryImageDetails(uid) {
	// returns the image payload attached to uid
	if (uid in images_db.data.images) {
		return images_db.data.images[uid]
	} else {
		return {}
	}
}

function modifyImageDetails(uid, body) {
	// modifies image details (BUT NOT DATE since its image-locked)
	// filter out the predefined parameters to modify
	var modifiedParams = {}
	if ("title" in body) {
		modifiedParams["title"] = body["title"]
	}

	if (Object.keys(modifiedParams).length == 0) {
		// empty modify params (nothing to modify)
		return false
	}

	// pull up image data
	var imgData = images_db.data.images[uid]

	if (!imgData) {
		// no image data with the given uid
		return false
	}

	// modifiedParams is valid, any entries it has, image properties should have it (character for character)
	for (const [prop, val] of Object.entries(modifiedParams)) {
		imgData[prop] = val
	}

	return true
}

module.exports = {
	Image, Scheduler, fetchImages, queryImageDetails, modifyImageDetails
}