const mysql = require("../config/mysql.js");

const getAllVideosFromDB = async () => {
  const statement = "select * from videodata;";
  const parameters = [];
  return await mysql.query(statement, parameters);
};

module.exports = getAllVideosFromDB;
