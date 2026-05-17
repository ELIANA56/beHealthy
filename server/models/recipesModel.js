function listRecipes(db) {
  const sql = `SELECT * FROM Recipes ORDER BY Recipe_ID DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = { listRecipes };
