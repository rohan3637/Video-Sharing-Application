const express = require("express");
const uploadFileToS3 = require("../controllers/upload.controller.js");
const {
  initializeUpload,
  uploadChunk,
  completeUpload,
} = require("../controllers/multipartUpload.controller.js");

const multer = require("multer");

const router = express.Router();
const upload = multer();

/*router.post("/", upload.fields([
    { name: "chunk" },
    { name: "totalChunks" },
    { name: "chunkIndex" },
  ]),
  uploadFileToS3
);*/

// Route for initializing upload
router.post("/initialize", upload.none(), initializeUpload);

// Route for uploading individual chunks
router.post("/", upload.single("chunk"), uploadChunk);

// Route for completing the upload
router.post("/complete", completeUpload);

module.exports = router;
