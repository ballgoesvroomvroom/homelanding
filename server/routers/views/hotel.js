const baseURL = `/hotel`

const express = require("express");
const path = require("path");
const fs = require("fs")

const views = require("../../includes/views.js");
const docHandler = require("../../includes/documentsHandler.js");
const parser = require("../../includes/documentsMarkdownParser.js");

const router = express.Router()

router.get("/promotions", (req, res) => {
	res.type("html")
	res.sendFile(views.hotel.promotions)
})

router.get("/reservations", (req, res) => {
	res.type("html")
	res.sendFile(views.hotel.reservations)
})

router.get("/restaurants", (req, res) => {
	res.type("html")
	res.sendFile(views.hotel.restaurants)
})

module.exports = { // export router object and authenticated middleware
	baseURL, router
}