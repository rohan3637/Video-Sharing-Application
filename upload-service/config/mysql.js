const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME,
});

function query(sql, args) {
  return new Promise((resolve, reject) => {
    pool.query(sql, args, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function runMigration() {
  try {
    const migrationSqlPath = path.join(__dirname, "../migration/base.sql");
    const migrationSql = fs.readFileSync(migrationSqlPath, "utf8");
    await query(migrationSql);
    console.log("Migration executed successfully");
  } catch (error) {
    console.error("Error running migration:", error);
  }
}

runMigration();

module.exports = {
  query: query,
};
