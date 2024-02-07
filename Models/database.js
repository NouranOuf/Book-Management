const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "adminadmin",
  database: "book management",
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("connected ^-^");
  }
});
module.exports = db;
