const path = require("path")
const fs = require("fs")

class Handler {
	static path = path.join(__dirname, "../../server-locked-resource/documents/")

	static readArticle(documentId, articleId) {
		if (!Handler.articleExists(documentId, articleId)) {
			return
		} else {
			return new Promise((res, rej) => {
				fs.readFile(path.join(Handler.path, `./${documentId}`, `${articleId}.md`), "utf-8", (err, data) => {
					if (err) {
						rej()
					} else {
						res(data)
					}
				})
			})
		}
	}

	static getAll() {
		/*
		 *	returnPayload = {
		 *		documents = ["doc1", "doc2"],
		 *		articles = {
		 *			doc1: ["art1", "art2"],
		 *			doc2: ["art3", "art4"]
		 *		}
		 *	}
		 */
		return new Promise((res, rej) => {
			fs.readdir(Handler.path, (err, data) => {
				if (err) {
					rej()
				} else {
					res(data)
				}
			})
		}).then(data => {
			var docs = data
			var articles = {}

			for (let i = 0; i < data.length; i++) {
				articles[data[i]] = fs.readdirSync(path.join(Handler.path, data[i]))
					.map(fileName => {
						// extract it without extensions
						var fileNameWoExt = fileName.split(".")
						fileNameWoExt.pop()
						return fileNameWoExt.join(".")
					})
			}

			return {
				documents: docs,
				articles: articles
			}
		})
	}

	static documentExists(documentId) {
		// returns boolean
		return fs.existsSync(path.join(Handler.path, documentId))
	}

	static articleExists(documentId, articleId) {
		// returns boolean
		var d = fs.existsSync(path.join(Handler.path, documentId))
		if (!d) {
			return false
		} else if (fs.existsSync(path.join(Handler.path, `./${documentId}`, `${articleId}.md`))) {
			return true
		}
	}

	static getArticleList(documentId) {
		// SHOULD BE CALLED AFTER DOCUMETEXISTS() RETURNS TRUE
		var articleList = {}

		return new Promise((res, rej) => {
			fs.readdir(path.join(Handler.path, documentId), (err, data) => {
				if (err) {
					rej()
				} else {
					res(data)
				}
			})
		}).then(files => {
			var min = [-1, ""] // store smallest value (creation date) for sorting purposes
			var totalFiles = 0 // get a tally count for files in directory
			for (var file of files) {
				const { birthtimeMs } = fs.statSync(path.join(Handler.path, documentId, file))
				articleList[file] = birthtimeMs

				if (min[0] === -1 || birthtimeMs < min[0]) {
					min[0] = birthtimeMs
					min[1] = file
				}

				totalFiles++
			}

			if (totalFiles === 0) {
				// no files in directory
				return []
			}

			// sort list
			var sortedArticleList = [min[1]]
			delete articleList[min[1]]

			while (sortedArticleList.length < totalFiles) {
				min = [-1, ""]
				for (file of Object.keys(articleList)) {
					var ms = articleList[file]

					if (min[0] == -1 || ms < min[0]) {
						min[0] = ms
						min[1] = file
					}
				}

				sortedArticleList.push(min[1])
				delete articleList[min[1]]
			}

			// sorted
			return sortedArticleList
		})
	}
}

module.exports = Handler