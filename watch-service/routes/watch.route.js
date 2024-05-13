const express = require("express");
const watchVideo = require("../controllers/watch.controller.js");
const getAllVideos = require("../controllers/videos.controller.js");

const router = express.Router();

router.get("/", watchVideo);
router.get("/videos", getAllVideos);

module.exports = router;
