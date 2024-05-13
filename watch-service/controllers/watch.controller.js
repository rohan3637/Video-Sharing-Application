const AWS = require("aws-sdk");

async function generateSignedURL(videoKey) {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: videoKey,
    Expires: 3600, // URL expires in 1 hr
  };
  const s3 = new AWS.S3({
    region: "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: "v4",
  });
  return new Promise((resolve, reject) => {
    s3.getSignedUrl("getObject", params, (err, url) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(url);
      }
    });
  });
}

const watchVideo = async (req, res) => {
  try {
    const videoKey = req.query.key || null;
    if (!videoKey) {
      return res.status(400).json({
        success: false,
        message: "Missing query parameter!!",
      });
    }
    const signedUrl = await generateSignedURL(videoKey);
    return res.status(200).json({
      success: true,
      signedUrl: signedUrl,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error. " + err.message,
    });
  }
};

module.exports = watchVideo;
