const mysql = require("../config/mysql.js");

const addVideoDetailsToDB = async (title, description, author, url) => {
  const statement =
    "insert into videoData (title, description, author, url) VALUES (?, ?, ?, ?)";
  const parameters = [title, description, author, url];
  return await mysql.query(statement, parameters);
};

const updateVideoTranscodedUrl = async (id, transcodedUrl) => {
  const sql = "update videoData set transcoded_url = ? where id = ?";
  const parameters = [transcodedUrl, id];
  return await mysql.query(sql, parameters);
};

const getVideoDatById = async (id) => {
  const sql = "select * from videoData where id = ?";
  const parameters = [id];
  const result = await mysql.query(sql, parameters);
  const videoData = result[0];
  return {
    id: videoData.id,
    title: videoData.title,
    description: videoData.description,
    author: videoData.author,
  };
};

module.exports = {
  addVideoDetailsToDB,
  updateVideoTranscodedUrl,
  getVideoDatById,
};
