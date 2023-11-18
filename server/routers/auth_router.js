const baseURL = "/auth"; // base url for this router

const express = require("express");
const crypto = require("crypto");
const path = require("path")
const dotenv = require("dotenv").config({path: path.join(__dirname, "../../.env")});
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
console.log("MAIL SERVER", process.env.SENDGRID_API_KEY)

const views = require("../includes/views.js");
const sessions = require("../includes/sessions.js");
const errmsg = require("../includes/err_msgs.js")

const databaseInterface = require("../database/interface.js");
const qrillerDB = databaseInterface.qriller_users
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

const authenticated = (req, res, next) => { // middleware that only accepts authenticated users
	// validate if session object exists
	let sessionobj = req.session;
	if (sessionobj == null) {
		// unlikely to happen, could be that it got timed out the exact instance;
		// return a 400 error
		return router.status(400).end();
	}

	// check authentication status
	if (sessionobj.isAuthenticated) {
		next(); // authenticated
	} else {
		if (req.method != "GET") {
			// api method, reutrn 401 unauthorised (403 forbidden for valid credentials but not enough privileges)
			return res.status(401)
		}

		req.session._returnTo = req.originalUrl
		res.sendFile(views.qriller.loginPage); // send login page
	}
}

const applyVerificationIdAction = (vid) => {
	/**
	 * verifies the users tagged to the specific verification id (vid)
	 * vid: string, the 256-bit long string of random characters generated during creation of user
	 * applies modifications to .pendingAccountCreationConfirmation in qrillerDB.data.users
	 * returns a boolean, true if verification was successful, false otherwise
	 */
	if (qrillerDB.data.verificationLinks[vid]) {
		// check for verification id's expiry
		if (Date.now() > qrillerDB.data.verificationLinks[vid].expires) {
			// expired, remove vid reference in .verificationLinks
			delete qrillerDB.data.verificationLinks[vid]
			return false
		}

		// check if user exists
		if (qrillerDB.data.users[qrillerDB.data.verificationLinks[vid].key] == null) {
			// no user found tagged to this verification link
			// bugged out verification id?
			delete qrillerDB.data.verificationLinks[vid] // remove this vid
			return false
		}

		// check if user is already authenticated
		if (!qrillerDB.data.users[qrillerDB.data.verificationLinks[vid].key].pendingAccountCreationConfirmation) {
			// value of 0, false, null will return true
			// if .pendingAccountCreationConfirmation takes any of these 3 values, it means user has already verified email address
			// entry should have already been deleted during verification flow
			delete qrillerDB.data.verificationLinks[vid]
			return false
		}

		// proceed to authenticate user
		delete qrillerDB.data.users[qrillerDB.data.verificationLinks[vid].key].pendingAccountCreationConfirmation // simply remove field (retrieval will result in a null value)
		delete qrillerDB.data.verificationLinks[vid]

		return true // success
	}

	return false // no vid found
}

router.get("/perms", (req, res) => {
	// return permissions scope user has
	res.json(req.session.perms);
})

router.post("/create", (req, res) => {
	/**
	 * creates the user with credentials supplied in body as fields, 'username', 'email', 'pw'
	 * created user's uid would be the hashed email address
	 * responds with status 200 if successful
	 * otherwise status 400 if invalid request (username already exists, password and email failed formatting)
	 */

	// validate credentials first
	var un = req.body.username,
		email = req.body.email,
		pw = req.body.pw
	if (un == null || typeof un != "string") {
		return res.status(400).json({error: "Username is not supplied or is of the wrong type."})
	} else if (email == null || typeof email != "string") {
		return res.status(400).json({error: "Email address is not supplied or is of the wrong type."})
	} else if (pw == null || typeof pw != "string") {
		return res.status(400).json({error: "Password is not supplied or is of the wrong type."})
	}

	if (un.length < 3 || un.length > 23) {
		return res.status(400).json({error: "Username does not fit length requirements."})
	} else if (pw.length < 3 || pw.length > 23) {
		return res.status(400).json({error: "Password does not fit length requirements."})
	} else if (email.length === 0 || email.length >= 999) {
		return res.status(400).json({error: "Email address does not fit length requirements."})
	}

	var emailSplit = email.toLowerCase().split("@") // make email details case-insensitive
	if (emailSplit.length !== 2) {
		return res.status(400).json({error: "Email address is not formatted correctly."})
	} else if (emailSplit[0].length === 0) {
		return res.status(400).json({error: "Name portion of email address cannot be empty."})
	}
	var domain = emailSplit[1].split(".")
	if (domain.length <= 1) {
		// missing domain, e.g 'google' instead of 'google.com'
		return res.status(400).json({error: "Domain portion of email address is not a domain."})
	} else if (!domain.every(r => r.length >= 1)) {
		// domain got missing fields following '.' delimiter
		return res.status(400).json({error: "Domain portion of email address is not a valid domain, check for excess period characters."})
	}

	// generate key for this user from solely email
	var key = qrillerDB.mask.hash(email)

	// determine if email address already exists
	if (qrillerDB.data.users[key] != null) {
		return res.status(400).json({error: "Email address already in use."})
	}

	// generate a 256-bit long random string by the CryptoJS library, to be attached to the user for user verification by mail
	// send mail with senggrid (sgMail)
	var verificationId = crypto.randomBytes(32).toString("hex")
	sgMail.send({
		to: email,
		from: "help@qriller.com",
		subject: "Newly Created User",
		text: "Hello! This email indicates your first sign up!\n\n",
		html: `<h2>Steps you need to take next:</h2><br><ul><li>Follow this <a href="https://qriller.com/authenticate?vid=${verificationId}">link</a> to verify your email address</li><li>That's all!</li><ul><br><p>Your verification id: ${verificationId}</p>`
	}).then(() => {
		// email sent successfully
		console.log("EMAIL SENT SUCCESSFULLY FOR VERID", verificationId)

		// create a new user with hashed password and hashed email reference
		// add in the verification reference too
		qrillerDB.data.users[key] = {
			"username": un,
			"password": qrillerDB.mask.hash(pw),
			"loginMethod": "password",
			"email": email,

			"pendingAccountCreationConfirmation": true // to be set to false once user verifies email address
		}
		qrillerDB.data.verificationLinks[verificationId] = {
			"key": key,
			"expires": Date.now() +(8.64e+8) // milliseconds when this verification link expires and will be purged from the database
		}

		// end request
		res.status(200).end()
	}).catch(err => {
		console.warn("FAILED", err)
		res.status(500).end() // server failure
	})
})

router.post("/login", (req, res) => {
	/**
	 * authenticate user with the basic authorisation scheme
	 * accepts 'application/json' or 'application/octet-stream' as the request's content type
	 * on successful authentication (comparison of credentials), will send a response with content type 'application/json' with body containing a string-encoded JSON object with field 'username' set to the username
	* return json will also contain redirection paths, via the 'returnTo' field
	 */
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

			if (username.length < 3 || username.length > 23) {
				throw new Error(errmsg.invalid);
			} else if (password.length < 3 || password.length > 25) {
				throw new Error(errmsg.invalid);
			}

			var userdata = qrillerDB.data.users[username.toLowerCase()]
			if (userdata == null) {
				// no user found
				throw new Error(errmsg.missing)
			}

			var hashed_password = qrillerDB.mask.hash(password)
			if (hashed_password === userdata.password) {
				req.session.username = userdata.username;
				console.log("[DEBUG]: user logged in as", req.session.username)
				req.session.uid = userdata.username

				authSuccess = true;
			}
		} else {
			throw new Error(errmsg.missing);
		}
	} catch (err) {
		res.statusMessage = err.message;
		return res.status(400).json({"error": `Malformed input; ${err.message}`});
	}

	if (authSuccess) {
		req.session.isAuthenticated = true; // set state

		// determine next route for user
		var redirectTo = "/"
		if (req.session._returnTo != null) {
			redirectTo = req.session._returnTo
			req.session._returnTo = null
		}

		res.json({"username": req.session.username, "uid": req.session.uid, returnTo: redirectTo})
	} else {
		// return 401
		// following spec
		// res.set("WWW-Authenticate", `Basic realm="Site login"`);
		res.status(401).json({"error": "Invalid credentials"});
	}
})

module.exports = { // export router object and authenticated middleware
	baseURL, router, parseCookie, baseSession, authenticated, applyVerificationIdAction
}