const express = require("express");
const publishMessageToKafka = require("../controllers/kafkaPublisher.controller.js");

const router = express.Router();

router.post("/", publishMessageToKafka);

module.exports = router;
