// stores the paths for the different views
const path = require("path");

// root is a global variable
const html = path.join(root, "/public/html/")

class Views {
	static home = path.join(html, "base.html")
	static upload_lockscreen = path.join(html, "views/upload_lock.html")
	static upload = path.join(html, "views/upload.html")

	static notFound = path.join(html, "includes/404.html")
}

module.exports = Views;