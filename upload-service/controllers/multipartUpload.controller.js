const AWS = require("aws-sdk");
const fs = require("fs");
const publishMessageToKafka = require("../controllers/kafkaPublisher.controller.js");
const { createVideoMetaData } = require("./videometadata.update.js");

// Initialize upload
const initializeUpload = async (req, res) => {
  try {
    const { filename } = req.body;
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: filename,
      ContentType: "video/mp4",
    };
    const s3 = new AWS.S3({
      region: "ap-south-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const multipartParams = await s3
      .createMultipartUpload(uploadParams)
      .promise();
    return res.status(200).json({
      success: true,
      uploadId: multipartParams.UploadId,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Upload initialization failed",
    });
  }
};

// Upload chunk
const uploadChunk = async (req, res) => {
  try {
    const { filename, chunkIndex, uploadId } = req.body;
    if (!filename || !chunkIndex || !uploadId) {
      return res.status(400).json({
        success: false,
        message: "Missing required data !!",
      });
    }
    const chunkParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: filename,
      UploadId: uploadId,
      PartNumber: parseInt(chunkIndex) + 1,
      Body: req.file.buffer,
    };
    const s3 = new AWS.S3({
      region: "ap-south-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    await s3.uploadPart(chunkParams).promise();
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Chunk could not be uploaded",
    });
  }
};

// Complete upload
const completeUpload = async (req, res) => {
  try {
    const { filename, totalChunks, uploadId, author, title } = req.body;
    const description = req.body.description || null;
    if (!filename || !totalChunks || !uploadId || !author || !title) {
      return res.status(400).json({
        success: false,
        message: "Missing required data !!",
      });
    }
    const completeParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: filename.replace(/ /g, "_"),
      UploadId: uploadId,
    };
    const s3 = new AWS.S3({
      region: "ap-south-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const data = await s3.listParts(completeParams).promise();
    const parts = data.Parts.map((part) => ({
      ETag: part.ETag,
      PartNumber: part.PartNumber,
    }));
    completeParams.MultipartUpload = { Parts: parts };
    const uploadResult = await s3
      .completeMultipartUpload(completeParams)
      .promise();
    const result = await createVideoMetaData(
      title,
      description,
      author,
      uploadResult.Location
    );
    await publishMessageToKafka(
      result.insertId,
      uploadResult.Key,
      title,
      description,
      author
    );
    return res.status(200).json({
      success: true,
      message: "Uploaded successfully!!!",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "Upload completion failed. " + error.message,
    });
  }
};

module.exports = { initializeUpload, uploadChunk, completeUpload };
