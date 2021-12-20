const mongo = require("../db/mongo");

module.exports = async (req, res) => {
  try {
    await mongo();
    res.status(200).send("DB connection healthy");
  } catch (err) {
    res.status(500).send("DB connection unhealthy");
  }
};
