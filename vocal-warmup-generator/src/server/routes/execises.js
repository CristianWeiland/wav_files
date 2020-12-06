let express = require('express');
let router = express.Router();

let conn = require('../db/db');

/* GET exercises listing. */
router.get('/', function(req, res, next) {
  try {
    // db request
    let exercises = [
      { id: 0, name: 'Bocca Chiusa' },
      { id: 1, name: 'Vroli' },
      { id: 2, name: 'O-I-A' },
      { id: 3, name: 'Ziu ziu' },
      { id: 4, name: 'Mei mai mei' },
    ];

    conn.query(`SELECT id, name FROM predefined_exercises;`, (err, results, fields) => {
      console.log('query result');
      console.log(results);
    });

    res.status(200).send({ exercises });
  } catch (err) {
    console.log('Error fetching exercises list!', err);
    res.status(500).send({ message: 'Error fetching exercises list' });
  }
});

module.exports = router;
