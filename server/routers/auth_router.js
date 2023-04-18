const baseURL = "/auth"; // base url for this router

const express = require("express");

const views = require("../includes/views.js");
const sessions = require("../includes/sessions.js");
const errmsg = require("../includes/err_msgs.js")

const databaseInterface = require("../database/interface.js");
const auth_keysDB = databaseInterface.auth_keys
// const databaseinst = require("../../base/database.js");

// const userDB = databaseinst.user;

const router = express.Router();
const SessionStore = sessions.SessionStore;

const cookieDelimiter = /; /g;
const cookieKeyValueSplit = /=/;

const parseCookie = (req, res, next) => {
	// sets headers.cookies = {"cookie1": "cookie1value", "cookie2": "cookie2value"}
	let headers = req.headers;

	if (headers.hasOwnProperty("cookie")) {
		let rawCookies = headers.cookie;
		let cookedCookies = {}

		rawCookies.split(cookieDelimiter).forEach(cookiePair => {
			var [key, value] = cookiePair.split(cookieKeyValueSplit);
			cookedCookies[key] = value;
		})

		headers.cookie = cookedCookies
	} else {
		headers.cookie = {};
	}

	next();
}

const baseSession = (req, res, next) => { // session id
	let headers = req.headers;

	// find SessionStore.cookieName header
	var sid;
	if (headers.hasOwnProperty("cookie") && headers.cookie.hasOwnProperty(SessionStore.cookieName)) {
		// ensure cookies exists in the first place
		sid = headers.cookie[SessionStore.cookieName];

		// validate if sid is valid\
		if (!SessionStore.valid(sid)) {
			// not valid; generate new sid
			sid = SessionStore.newClient();

			// set header
			res.set({"Set-Cookie": `${SessionStore.cookieName}=${sid}; path=/`});
		}
	} else { // create new session
		sid = SessionStore.newClient();

		// set header
		res.set({"Set-Cookie": `${SessionStore.cookieName}=${sid}; path=/`});
	}

	// attach session object to req
	req.session = SessionStore.getClient(sid);
	req.session.persist(); // reset TTL counter as user is active
	next();
}

const authenticated = (req, res, next) => { // actual authentication
	// validate if session object exists
	let sessionobj = req.session;
	if (sessionobj == null) {
		// maybe got timed out;
		// return a 400 error
		return router.status(400).end();
	}

	// check authentication status
	if (sessionobj.isAuthenticated) {
		next(); // authenticated
	} else {
		res.sendFile(views.login); // send login page
	}
}

const admin_authenticated = (req, res, next) => { // actual authentication
	// validate if session object exists
	let sessionobj = req.session;
	if (sessionobj == null) {
		// maybe got timed out;
		// return a 400 error
		return router.status(400).end();
	}

	// check authentication status
	if (sessionobj.isAuthenticated && sessionobj.isAdmin) {
		next(); // authenticated
	} else {
		// deny request
		res.status(401).end();
		// res.sendFile(views.login); // send login page
	}
}

router.get("/perms", (req, res) => {
	// return permissions scope user has
	res.json(req.session.perms);
})

router.post("/login", (req, res) => {
	// authenticate based on username and password (plain/text)
	let authSuccess = false;

	// validate input
	try {
		if (req.headers.hasOwnProperty("authorization")) {
			let method = req.headers.authorization.split(" ");

			// only accept the 'Basic' method
			if (method.length != 2) {
				// expected two values 'Basic username:password'
				throw new Error(errmsg.invalid);
			} else if (method[0] != "Basic") {
				throw new Error(errmsg.invalid);
			}

			// encoded in base64; decode it first
			let b = Buffer.from(method[1], "base64");
			method[1] = b.toString("utf-8");

			// take second value 'username:password'
			let creds = method[1].split(":");

			if (creds.length != 2) {
				// not valid; username:password only; expected 2 values
				throw new Error(errmsg.invalid);
			}
			let [username, password] = creds;

			if (username.length < 5 || username.length > 25) {
				throw new Error(errmsg.invalid);
			} else if (password.length != 6) {
				throw new Error(errmsg.invalid);
			}

			var hashed_password = auth_keysDB.mask.hash(password +auth_keysDB.salt)
			if (hashed_password in auth_keysDB.data) {
				var userData = auth_keysDB.data[hashed_password];
				req.session.username = userData.username;
				console.log("[DEBUG]: user logged in as", req.session.username)
				req.session.isAdmin = true
				req.sesison.uid = userData.uid

				authSuccess = true;

				// set perms
				req.session.perms = {
					"upload": userData.perms.upload,
					"delete": userData.perms.delete
				};
			}
		} else {
			throw new Error(errmsg.missing);
		}
	} catch (err) {
		res.statusMessage = err.message;
		return res.status(400).json({"error": `Malformed input; ${err.message}`});
	}

	if (authSuccess) {
		req.session.isAuthenticated = true;
		res.json({"username": req.session.username})
	} else {
		// return 401
		// following spec
		// res.set("WWW-Authenticate", `Basic realm="Site login"`);
		res.status(401).json({"error": "Invalid credentials"});
	}
})

module.exports = { // export router object and authenticated middleware
	baseURL, router, parseCookie, baseSession, authenticated, admin_authenticated
}