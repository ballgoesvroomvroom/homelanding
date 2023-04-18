const fs = require("fs")
const path = require("path")
const dotenv = require("dotenv").config();
const CryptoJS = require("crypto-js")

const status = {
	"ERROR": 1,
	"OK": 2
}

class Mask {
	constructor(passphrase) {
		this.passphrase = passphrase
	}

	encryptAES(text) {
		const ciphertext = CryptoJS.AES.encrypt(text, this.passphrase, {mode: CryptoJS.mode.ECB});
		const ivHex = ciphertext.iv.toString();
	}

	decryptAES(ciphertext) {
		return ciphertext;
		// const bytes = CryptoJS.AES.decrypt(ciphertext, this.passphrase, {mode: CryptoJS.mode.ECB});
		// const originalText = bytes.toString(CryptoJS.enc.Utf8);
		// return originalText;
	}

	hash(text) {
		return CryptoJS.SHA512(text).toString()
	}

	encryptFields(data, path) {
		// path: string; e.g. '/name'
		// modifies 'data' variable

		// placeholder for now
		for (let [key, val] of Object.entries(data)) {
			val.username = this.encryptAES(val.username)
		}
	}

	decryptFields(data, path) {
		// placeholder for now
		for (let [key, val] of Object.entries(data)) {
			val.username = this.decryptAES(val.username)
		}
	}
}

class Database {
	constructor(name, properties) {
		// absolute path to filename
		// autosave: seconds, saves local content to filename every autosave seconds
		this.name = name
		this.filename = path.join(__dirname, `./${name}.json`);
		this.status = status.ERROR;
		this.properties = properties;
		this.data = {}; // store contents here

		try {
			fs.accessSync(this.filename, fs.constants.R_OK | fs.constants.W_OK);
		} catch (err) {
			console.warn(err);
			fs.writeFileSync(this.filename, "{}");
		}

		this.status = status.OK;
		console.log("[DEBUG]: properties:", properties)

		this.loadIntoMemory().then(data => {
			// read properties and carry out the necessary operations (decrypting)
			// if (properties.keysEncrypted) {
			// 	this.mask = new Mask(properties.passphrase)
			// 	const data = {}
			// 	for (const [key, val] of Object.entries(this.data)) {
			// 		var decrypted = this.mask.decryptAES(key)

			// 		data[decrypted] = val;
			// 	}
			// 	// set new data
			// 	this.data = data
			// }

			// parse the properties.fieldsEncrypted value to determine which values need to be decrypted
			this.mask = new Mask(properties.passphrase)
			if ("fieldsEncrypted" in properties) {
				if (this.mask == null) {
					this.mask = new Mask(properties.passphrase)
				}

				for (let i = 0; i < properties.fieldsEncrypted.length; i++) {
					this.mask.decryptFields(this.data, properties.fieldsEncrypted[i])
				}
			}

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
		const data = JSON.stringify(this.encryptDatabase(), null, "\t");
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

	encryptDatabase() {
		// encrypts .data field (modifies .data field)
		// returns final encrypted data
		// encrypts using .properties field
		// if (this.properties.keysEncrypted) {
		// 	// this.mask should exist
		// 	const data = {}
		// 	for (const [key, val] of Object.entries(this.data)) {
		// 		var encrypted = this.mask.encryptAES(key)

		// 		data[encrypted] = val;
		// 	}
		// 	// set new data
		// 	this.data = data
		// }

		// parse the properties.fieldsEncrypted value to determine which values need to be decrypted
		if ("fieldsEncrypted" in this.properties) {
			for (let i = 0; i < this.properties.fieldsEncrypted.length; i++) {
				this.mask.encryptFields(this.data, this.properties.fieldsEncrypted[i])
			}
		}

		return this.data
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
		keysEncrypted: true,
		salt: "pepperandcorn",
		// fieldsEncrypted: ["/username"],
		passphrase: process.env.ENCRYPT_PASSPHRASE
	}),
	images_db: new Database("hearts", {
		keysEncrypted: false
	})
}