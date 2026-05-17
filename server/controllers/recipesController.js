function listRecipes(req, res, { db }) {
  const sql = `SELECT * FROM Recipes ORDER BY Recipe_ID DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error fetching recipes.' });
    }
    res.json(results);
  });
}

module.exports = { listRecipes };
