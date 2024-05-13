const VideoData = require("../db/db.js");
const pushToOpenSearch = require("../opensearch/pushToOpenSearch.js");

const updateVideoMetaData = async (id, transcodedUrl) => {
  try {
    await VideoData.updateVideoTranscodedUrl(id, transcodedUrl);
  } catch (err) {
    console.log("Error updating Video MetaData. " + err.message);
  }
};

const createVideoMetaData = async (title, description, author, url) => {
  try {
    return await VideoData.addVideoDetailsToDB(title, description, author, url);
  } catch (err) {
    console.log("Error creating Video Meta Data. " + err.message);
  }
};

module.exports = {
  updateVideoMetaData,
  createVideoMetaData,
};
