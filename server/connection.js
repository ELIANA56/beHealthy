const mysql = require('mysql2');
const config = require('./config');

const db = mysql.createConnection({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  multipleStatements: true,
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
    return;
  }
  console.log('Connected to MySQL (%s).', config.db.database);
});

module.exports = db;
