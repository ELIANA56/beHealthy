function listArticles(db) {
  const sql = `SELECT * FROM Content_Hub ORDER BY Article_ID DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = { listArticles };
