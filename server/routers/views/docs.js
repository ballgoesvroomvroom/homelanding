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

// template engine (for hydrating pages)
class Template {
	static loopMatch = /{{%LOOP (?<loopid>[A-Z]*)\s*?(?<element>.*?)\s*?%ENDLOOP}}/m
}

// home page
router.get("/", (req, res) => {
	res.type("html")
	return res.sendFile(views.docs.homepage)
})

// document home domain
router.get("/:documentId", (req, res) => {
	// hydrate content

	// documentId is always lowercase
	var docId = req.params.documentId.toLowerCase()

	var isExists = docHandler.documentExists(docId)
	if (!isExists) {
		return res.status(404).end()
	}

	// get list of articles in this document (sorted according to creation date)
	var getArticleList = docHandler.getArticleList(docId)

	// set type
	res.type("html");

	// hydrate html page
	getArticleList.then(sortedArticleList => {
		Skeleton.document = fs.readFileSync(views.docs.documentSkeleton, {encoding: "utf8", flag: "r"})
		var hydrated = Skeleton.document.replaceAll("%DOCUMENT-NAME%", docId.toUpperCase())

		// loops
		var loopMatch = hydrated.match(Template.loopMatch)
		while (loopMatch != null) {
			var groups = loopMatch.groups

			// handling logic
			var newContent = "";
			if (groups.loopid === "ARTICLEITEM") {
				const element = groups.element

				for (let fileIdx = 0; fileIdx < sortedArticleList.length; fileIdx++) {
					var fileNameWoExt = sortedArticleList[fileIdx].split(".")
					fileNameWoExt.pop()
					fileNameWoExt = fileNameWoExt.join(".")

					newContent += element
						.replace("%ARTICLE-PATH%", `/docs/${docId}/${fileNameWoExt}`)
						.replace("%ARTICLE-NAME%", fileNameWoExt)
				}
			}

			// remove loop statement
			hydrated = hydrated.replace(Template.loopMatch, newContent)

			// find next loop
			Template.loopMatch.lastIndex = 0 // reset index
			loopMatch = hydrated.match(Template.loopMatch)
		}

		res.write(hydrated)
		res.status(200).end()
	})
})

// article page
router.get("/:documentId/:articleId", (req, res) => {
	// hydrate content
	var docId = req.params.documentId.toLowerCase()
	var artId = req.params.articleId.toLowerCase()
	var isExists = docHandler.articleExists(docId, artId)
	if (!isExists) {
		return res.status(404).end()
	}

	// set type
	res.type("html")

	// hydrate skeleton
	docHandler.readArticle(docId, artId).then(data => {
		// parse data
		return parser(data)
	}).then(parsedHtml => {
		// read Skeleton.article
		Skeleton.article = fs.readFileSync(views.docs.articleSkeleton, {encoding: "utf8", flag: "r"})
		var hydrated = Skeleton.article.replace("%ARTICLE-CONTENT%", parsedHtml)
		hydrated = hydrated.replaceAll("%ARTICLE-HEADER%", artId)
		hydrated = hydrated.replaceAll("%ARTICLE-PARENT%", docId)
		res.write(hydrated)
		res.status(200).end()
	}).catch(err => {
		// catch error
		console.warn(err)
		res.status(500).end()
	})
})

module.exports = { // export router object and authenticated middleware
	baseURL, router
}