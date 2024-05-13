const getAllVideosFromDB = require("../db/db.js");

const getAllVideos = async (req, res) => {
  try {
    const allVideos = await getAllVideosFromDB();
    return res.status(200).json(allVideos);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error. " + err.message,
    });
  }
};

module.exports = getAllVideos;
