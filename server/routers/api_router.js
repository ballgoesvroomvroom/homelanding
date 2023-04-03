const baseURL = "/api"

const express = require("express")
const multer = require("multer")
const exifr = require("exifr")
const fs = require("fs")
const path = require("path")

// auth routers
const auth_router = require(path.join(__dirname, "./auth_router.js"));

// api routers
const pc_api_router = require(path.join(__dirname, "./api/photocards.js"));

// router object
const router = express.Router()

router.use(pc_api_router.baseURL, pc_api_router.router)

module.exports = { // export router object and authenticated middleware
	baseURL, router
}