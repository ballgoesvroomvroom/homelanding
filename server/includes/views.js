// stores the paths for the different views
const path = require("path");

// root is a global variable
const html = path.join(root, "/public/html/")

class Docs {
	static homepage = path.join(html, "views/docs/homepage.html")

	static documentSkeleton = path.join(html, "views/docs/documentSkeleton.html")
	static articleSkeleton = path.join(html, "views/docs/articleSkeleton.html")
}

class Hotel {
	static promotions = path.join(html, "views/hotel/promotions.html")
	static reservations = path.join(html, "views/hotel/reservations.html")
}

class Qriller {
	static document = path.join(html, "views/qriller/latex_home.html")
	static answerSheet = path.join(html, "views/qriller/answer_page.html")

	static worksheetDirectory = path.join(html, "views/qriller/worksheet_directory.html")

	static engineTestInterface = path.join(html, "views/qriller/engine_test.html")	
	static worksheetCoverPage = path.join(html, "views/qriller/cover_page.html")
}

class Views {
	static home = path.join(html, "base.html")
	static upload_lockscreen = path.join(html, "views/upload_lock.html")
	static upload = path.join(html, "views/upload.html")

	static notFound = path.join(html, "includes/404.html")

	static docs = Docs
	static hotel = Hotel
	static qriller = Qriller
}

module.exports = Views;