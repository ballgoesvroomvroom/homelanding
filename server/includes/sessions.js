// handles sessions

// CONSTANTS
const SESSION_TTL = 43200; // minutes; 30 days

// DEPENDANCIES
const crypto = require("crypto")

function randomBytes(size) {
	// shorthand function
	return crypto.randomBytes(size).toString("hex")
}

class SessionStore {
	cookieName = "filt"; // used to assign cookie name (session id)

	constructor() {
		this.clients = new Map();

		var store = this;
		this._cleanupID = setInterval(function() {
			store._cleanupOperation();
		}, 1000)
	}

	_cleanupOperation() {
		var timeNow = (new Date()).getTime();

		this.clients.forEach((clientObject, clientId) => {
			if (timeNow - clientObject._createdAt > SESSION_TTL *60 *1000) {
				this.destroyClient(clientId);
			}
		})
	}

	valid(clientId) {
		// wrapper
		return this.clients.has(clientId);
	}

	getClient(clientId) {
		// no need to validate for existence
		// will return undefined if no clientId exists anyways
		return this.clients.get(clientId);
	}

	newClient() {
		// construct a new client; returns the newly constructed client with its id
		let constructedClient = new Client();

		this.clients.set(constructedClient.id, constructedClient);
		return constructedClient.id;
	}

	destroyClient(clientId) {
		if (this.clients.has(clientId)) {
			// client exists
			this.clients.get(clientId).destroy(); // destroy client object
			this.clients.delete(clientId); // remove from memory
		}
	}
}

class Client {
	constructor() {
		this.id = randomBytes(16)
		this.isAuthenticated = false;
		this._returnTo = null // contains the path (req.originalUrl) after successful login, to be set back to null once used up

		// storage containers
		this.cartItems = [] // contains the cart information whose elements are arrays with length 2 (see /server/routers/api/qrillerAPI.js for implementation)
		this.cartItemsRepresentative = [] // similar to .cartItems but instead of the uniquecode, it is represented by the topic's title in the format, '1.0 | Indices Part I'

		this.currentOrder = {
			isValid = false, // boolean, determines if there is a current order in action
			items = [], // str[2][], schema is identical to .cartItems of the client's property
			total = 0, // number, numerical representation of order's total
			currency = "sgd", // "sgd"|"usd"
		}

		// metadaata
		this._createdAt = (new Date()).getTime();
	}

	persist() {
		// reset timer
		this._createdAt = (new Date()).getTime();
	}

	destroy() {
		// place holder
		return;
	}
}

module.exports = {
	SessionStore: new SessionStore()
}
