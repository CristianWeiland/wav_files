let express = require('express');
let router = express.Router();

let conn = require('../db/db');

/* GET exercises listing. */
router.get('/', function(req, res, next) {
  try {
    // db request
    conn.query(`SELECT id, name FROM predefined_exercises;`, (err, results, fields) => {
      res.status(200).send({ predefined_exercises: results });
    });
  } catch (err) {
    console.log('Error fetching exercises list!', err);
    res.status(500).send({ message: 'Error fetching exercises list' });
  }
});

module.exports = router;
