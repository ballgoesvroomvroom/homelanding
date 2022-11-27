const baseURL = "/";

const express = require("express");

const views = require("../includes/views.js");

const router = express.Router();

// HOME PAGE
router.get("/", (req, res) => {
	res.type("html");
	res.sendFile(views.home);
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

module.exports = {
	baseURL, router
}