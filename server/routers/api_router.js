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
const articles_router = require(path.join(__dirname, "./api/articles.js"));
const qriller_router = require(path.join(__dirname, "./api/qrillerAPI.js"));

// router object
const router = express.Router()

// use sub-routers (api routes)
router.use(pc_api_router.baseURL, pc_api_router.router)
router.use(articles_router.baseURL, articles_router.router)
router.use(qriller_router.baseURL, qriller_router.router)

module.exports = { // export router object and authenticated middleware
	baseURL, router
}