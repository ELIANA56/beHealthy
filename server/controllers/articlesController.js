function listArticles(req, res, { db }) {
  const sql = `SELECT * FROM Content_Hub ORDER BY Article_ID DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error fetching articles.' });
    }
    res.json(results);
  });
}

module.exports = { listArticles };
