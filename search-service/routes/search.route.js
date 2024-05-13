const express = require("express");
const searchVideos = require("../opensearch/searchVideos.js");

const router = express.Router();

router.get("/", searchVideos);

module.exports = router;
