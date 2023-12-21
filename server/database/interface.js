const fs = require("fs")
const path = require("path")
const dotenv = require("dotenv").config({path: path.join(__dirname, "../../.env")});
const CryptoJS = require("crypto-js")

const status = {
	"ERROR": 1,
	"OK": 2
}

class Mask {
	constructor(salt) {
		/**
		 * salt: string, salt applied to string
		 */
		this.salt = salt
	}

	hash(text) {
		return CryptoJS.SHA512(text +this.salt).toString()
	}
}

class Database {
	constructor(name, properties) {
		// absolute path to filename
		// autosave: seconds, saves local content to filename every autosave seconds
		this.name = name
		this.filename = path.join(__dirname, `./${name}.json`);
		this.status = status.ERROR;
		this.properties = Object.assign({
			"salt": ""
		}, properties);
		this.data = {}; // store contents here

		this.mask = new Mask(this.properties.salt)

		try {
			fs.accessSync(this.filename, fs.constants.R_OK | fs.constants.W_OK);
		} catch (err) {
			console.warn(err);
			fs.writeFileSync(this.filename, "{}");
		}

		this.status = status.OK;
		console.log("[DEBUG]: properties:", properties)

		this.loadIntoMemory().then(data => {
			// data loaded in successfully

			console.log("[DEBUG]: data:", this.data)
		});
		this.updateIntervalId = setInterval(() => this.pushIntoFile(), 600000); // update every 600 seconds (10 minutes)
	}

	set autosave(newvalue) {
		// rewrite setInterval
		if (this.updateIntervalId != null) {
			clearInterval(this.updateIntervalId);
			this.updateIntervalId = null;
		}
		if (newvalue === -1) {
			// quit autosave; do nothing
		} else {
			this.updateIntervalId = setInterval(() => this.pushIntoFile(), newvalue *1000);
		}
	}

	loadIntoMemory() {
		// read the file and update .contents with the latest info
		return new Promise((res, rej) => {
			if (this.status == status.ERROR) {
				console.warn("[WARN]: trying to update contents on a failed database");
				this.autosave = -1 // stop all current and future push operations
				return rej();
			}

			const data = fs.readFileSync(this.filename, {encoding: "utf-8", flag: "r"});
			this.data = JSON.parse(data);
			return res(this.data);
		}).catch(err => {
			this.status = status.ERROR
			console.warn(".loadIntoMemory() failed for", this.name, err)
		})
	}

	async pushIntoFile(res=null) {
		// use with promise resolve function (callback function)
		// may not have res, since multiple database could be needed to close
		if (this.status == status.ERROR) {
			console.warn("trying to push contents but database failed");
			clearInterval(this.updateIntervalId);
			if (res !== null) {console.log(res); res()} // resolve anyways; no clue what to add at this point in time
			return;
		}
		const data = JSON.stringify(this.data, null, "\t");
		await fs.writeFile(this.filename, data, "utf-8", err => {
			if (err) {
				console.warn("[DEBUG]: error while trying to push contents with fs.writeFile", err);
				this.status = status.ERROR;
				return;
			}

			console.log("[DEBUG]: push operation successful for", this.filename);
			if (res !== null) {res()}
		});
	}

	offLoad() {
		// frees the memory (destroy the object)
		let obj = this;
		var p = new Promise(this.pushIntoFile).then(() => {
			obj.data = {};
		})
		return;
	}
}

module.exports = {
	auth_keys: new Database("auth_keys", {
		salt: process.env.BLACK_SALT
	}),
	qriller_users: new Database("qriller", {
		salt: process.env.HIMALAYAN_SALT
	}),
	images_db: new Database("hearts", {
	})
}