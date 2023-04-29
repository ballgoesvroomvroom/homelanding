const baseURL = `/docs`

const express = require("express");
const path = require("path");
const fs = require("fs")

const views = require("../../includes/views.js");
const docHandler = require("../../includes/documentsHandler.js");
const parser = require("../../includes/documentsMarkdownParser.js");

const router = express.Router()

// cache skeleton pages
class Skeleton {
	static document = fs.readFileSync(views.docs.documentSkeleton, {encoding: "utf8", flag: "r"})
	static article  = fs.readFileSync(views.docs.articleSkeleton, {encoding: "utf8", flag: "r"})
}

console.log(Skeleton.article)

// home page
router.get("/", (req, res) => {
	res.type("html")
	return res.sendFile(views.docs.homepage)
})

// document home domain
router.get("/:documentId", (req, res) => {
	// no hydration

	var isExists = docHandler.documentExists(req.params.documentId)
	if (!isExists) {
		return res.status(404).end()
	}

	res.type("html")

	return res.sendFile(views.docs.documentSkeleton)
})

// article page
router.get("/:documentId/:articleId", (req, res) => {
	// hydrate content
	var isExists = docHandler.articleExists(req.params.documentId, req.params.articleId)
	if (!isExists) {
		return res.status(404).end()
	}

	// set type
	res.type("html")

	// hydrate skeleton
	docHandler.readArticle(req.params.documentId, req.params.articleId).then(data => {
		// parse data
		return parser(data)
	}).then(parsedHtml => {
		// read Skeleton.article
		Skeleton.article = fs.readFileSync(views.docs.articleSkeleton, {encoding: "utf8", flag: "r"})
		var hydrated = Skeleton.article.replace("%ARTICLE-CONTENT%", parsedHtml)
		hydrated = hydrated.replace("%ARTICLE-HEADER%", req.params.articleId)
		hydrated = hydrated.replace("%ARTICLE-PARENT%", req.params.documentId)
		res.write(hydrated)
	}).catch(err => {
		// catch error
		console.warn(err)
		res.status(500).end()
	})
})

module.exports = { // export router object and authenticated middleware
	baseURL, router
}