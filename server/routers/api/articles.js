const baseURL = `/${encodeURIComponent("docs")}`

const express = require("express")
const multer = require("multer")
const exifr = require("exifr")
const path = require("path")
const fs = require("fs")

const backend_handler = require(path.join(__dirname, "../../includes/documentsHandler.js"))
const auth_router = require(path.join(__dirname, "../auth_router.js"));

const articles_path = path.join(__dirname, "../../../server-locked-resource/documents/")

const router = express.Router()

// returns data representing available documents and their respective articles
router.get("/get-all", async (req, res) => {
	/*
	 *	returnPayload = {
	 *		documents = ["doc1", "doc2"],
	 *		articles = {
	 *			doc1: ["art1", "art2"],
	 *			doc2: ["art3", "art4"]
	 *		}
	 *	}
	 */
	return res.json(await backend_handler.getAll())
})

module.exports = { // export router object and authenticated middleware
	baseURL, router
}