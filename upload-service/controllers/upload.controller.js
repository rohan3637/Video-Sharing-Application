const AWS = require("aws-sdk");

const uploadFileToS3 = async (req, res) => {
  try {
    const chunk = req.files.chunk || null;
    const filename = req.body.filename || null;
    const totalChunks =
      req.body.totalChunks !== undefined
        ? parseInt(req.body.totalChunks)
        : null;
    const chunkIndex =
      req.body.chunkIndex !== undefined ? parseInt(req.body.chunkIndex) : null;
    if (!req.files || !chunk || !filename || !totalChunks || chunkIndex < 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required data !!",
      });
    }
    AWS.config.update({
      region: "ap-south-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `${filename}_${chunkIndex}`,
      Body: chunk[0].buffer,
    };
    const s3 = new AWS.S3();
    s3.upload(params, (err, data) => {
      if (err) {
        res.status(404).json({
          success: false,
          message: "Error uploading file: " + err.message,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "File uploaded successfully",
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error. " + err.message,
    });
  }
};

module.exports = uploadFileToS3;
