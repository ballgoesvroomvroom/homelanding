const baseURL = "/";

const path = require("path")
const express = require("express");

const views = require("../includes/views.js");
const viewsRouteHandler = path.join(__dirname, "views")

const router = express.Router();

// article domain
const articleViewRouter = require(path.join(viewsRouteHandler, "docs.js"))
const hotelViewRouter = require(path.join(viewsRouteHandler, "hotel.js"))
const qrillerInterfaceViewRouter = require(path.join(viewsRouteHandler, "qrillerInterface.js"))

// HOME PAGE
router.get("/", (req, res) => {
	res.type("html");
	res.sendFile(views.home);
})

router.get(`/${encodeURIComponent("<3")}`, (req, res) => {
	res.type("html");

	if (req.session.isAdmin) {
		res.sendFile(views.upload)
	} else {
		// send lock screen
		res.sendFile(views.upload_lockscreen)
	}
})

// SECRET CREATE PATHS
router.get("/secret-upload-path", (req, res) => {
	if (req.session.username === "admin") {
		let keys = serverDB.getBaseField("keys");
		while (true) {
			// generate a random hex string of 30 characters; 1 byte - 2 hex characters
			var r = crypto.randomBytes(15).toString("hex");
			if (keys[r] == null) {
				// generated string doesn't exist in keys table
				keys[r] = [false, ""]; // add it into the server database
				return res.json({"key": r});
			} else {
				// duplicate; do nothing; regenerate key
			}
		}
	} else {
		return res.status(403).end();
	}
})

// SECRET GET PATH
router.get("/secret-get-path", (req, res) => {
	if (req.session.username === "admin") {
		let keys = serverDB.getBaseField("keys");
		res.type("json");
		res.json(keys);
	} else {
		res.status(403).end();
	}
})

router.use(articleViewRouter.baseURL, articleViewRouter.router)
router.use(hotelViewRouter.baseURL, hotelViewRouter.router)
router.use(qrillerInterfaceViewRouter.baseURL, qrillerInterfaceViewRouter.router)

module.exports = {
	baseURL, router
}