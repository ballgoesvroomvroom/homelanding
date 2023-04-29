// stores the paths for the different views
const path = require("path");

// root is a global variable
const html = path.join(root, "/public/html/")

class Docs {
	static homepage = path.join(html, "views/docs/homepage.html")

	static documentSkeleton = path.join(html, "views/docs/documentSkeleton.html")
	static articleSkeleton = path.join(html, "views/docs/articleSkeleton.html")
}

class Views {
	static home = path.join(html, "base.html")
	static upload_lockscreen = path.join(html, "views/upload_lock.html")
	static upload = path.join(html, "views/upload.html")

	static notFound = path.join(html, "includes/404.html")

	static docs = Docs
}

module.exports = Views;