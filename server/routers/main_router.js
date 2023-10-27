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

router.use(articleViewRouter.baseURL, articleViewRouter.router)
router.use(hotelViewRouter.baseURL, hotelViewRouter.router)
router.use(qrillerInterfaceViewRouter.baseURL, qrillerInterfaceViewRouter.router)

module.exports = {
	baseURL, router
}