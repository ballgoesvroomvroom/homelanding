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
}

module.exports = Handler