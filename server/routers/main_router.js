const baseURL = "/";

const path = require("path")
const express = require("express");

const views = require("../includes/views.js");
const viewsRouteHandler = path.join(__dirname, "views")

const router = express.Router();

const auth_router = require(path.join(__dirname, "./auth_router.js"));

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

// authenticate newly signed up users
router.get("/authenticate", (req, res) => {
	if (req.query.vid) {
		var result = auth_router.applyVerificationIdAction(req.query.vid) // returns true if applied successfully
		if (result === true) {
			res.status(200)
			res.send("OKAY")
			res.end()
		} else {
			// failed to verify
			res.status(200)
			res.send("INVALID LINK?")
			res.end()
		}
	} else {
		res.status(400).end()
	}
})

router.use(articleViewRouter.baseURL, articleViewRouter.router)
router.use(hotelViewRouter.baseURL, hotelViewRouter.router)
router.use(qrillerInterfaceViewRouter.baseURL, qrillerInterfaceViewRouter.router)

module.exports = {
	baseURL, router
}