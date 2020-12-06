let express = require('express');
let router = express.Router();

let conn = require('../db/db');

function getWarmupQuery(id) {
  // TODO: Filter by user ID
  let query = `SELECT
    W.id as id,
    W.name as name,
    W.filename as filename,
    E.predefined_exercise_id as predefined_exercise_id,
    E.range_begin as range_begin,
    E.range_end as range_end,
    E.name as exercise_name,
    PE.name as exercise_default_name
  FROM
    warmups W
  JOIN
    exercises E ON W.id = E.warmup_id
  JOIN
    predefined_exercises PE ON E.predefined_exercise_id = PE.id`;

  if (id) {
    query += ` WHERE W.id = ${id}`;
  }

  return query;
}

function rawRowToWarmup(rowArray) {
  let warmup = {
    id: rowArray[0].id,
    name: rowArray[0].name,
    filename: rowArray[0].filename,
    exercises: [],
  };

  warmup.exercises = rowArray.map(row => {
    return {
      range: { begin: row.range_begin, end: row.range_end },
      name: row.exercise_name || row.exercise_default_name,
      exerciseId: row.predefined_exercise_id, // TODO: Change to predefinedExerciseId?
    };
  });

  return warmup;
}

/* GET warmups listing. */
router.get('/', function(req, res, next) {
  try {
    // db request
    /*let warmups = [
      {
        id: 1,
        name: 'db Basic warmup (all)',
        filename: null,
        exercises: [
          { exerciseId: 0, name: 'Bocca Chiusa', range: { begin: 10, end: 12 }},
          { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
        ],
      },
      {
        id: 2,
        name: 'db Quick warmup (BC)',
        filename: null,
        exercises: [
          { exerciseId: 0, name: 'Bocca Chiusa', range: { begin: 10, end: 12 }},
        ],
      },
      {
        id: 3,
        name: 'Advanced warmup (vroli)',
        filename: null,
        exercises: [
          { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
          { exerciseId: 1, name: 'Vroli vroli', range: { begin: 10, end: 12 }},
        ],
      },
      {
        id: 4,
        name: 'Range extension warmup (oia)',
        filename: null,
        exercises: [
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 12 }},
          { exerciseId: 2, name: 'O - I - A', range: { begin: 10, end: 20 }},
        ],
      },
    ];
    */

    const query = getWarmupQuery();

    conn.query(query, (err, results, fields) => {
      if (err) {
        console.log('Error fetching warmups list!', err);
        res.status(500).send({ message: 'Error fetching warmups list' });
      }

      if (results) {
        let groupedWarmups = {};
        results.forEach(row => {
          groupedWarmups[row.id] = groupedWarmups[row.id] || [];
          groupedWarmups[row.id].push(row);
        });

        let result = [];
        Object.keys(groupedWarmups).forEach(key => {
          result.push(rawRowToWarmup(groupedWarmups[key]));
        });

        res.status(200).send({ warmups: result });
      } else {
        console.log('Error: warmup not found!');
        res.status(404).send({ message: 'Error warmup not found' });
      }
    });
  } catch (err) {
    console.log('Error fetching warmups list!', err);
    res.status(500).send({ message: 'Error fetching warmups list' });
  }
});

/* GET warmup. */
router.get('/warmup', function(req, res, next) {
  try {
    let id = req.query.id;

    const query = getWarmupQuery(id);

    conn.query(query, (err, results, fields) => {
      if (err) {
        console.log('Error fetching warmups list!', err);
        res.status(500).send({ message: 'Error fetching warmups list' });
      }

      if (results) {
        res.status(200).send({ warmup: rawRowToWarmup(results) });
      } else {
        res.status(404).send({ message: 'Error warmup not found' });
      }
    });
  } catch (err) {
    res.status(500).send({ message: 'Error fetching warmups list' });
  }
});

/* Save warmup. */
router.post('/save', function(req, res, next) {
  try {
    let warmup = req.body;

    console.log('Saving warmup', warmup);
  } catch(err) {
    console.log('Error saving warmup!', err);
    res.status(500).send({ message: 'Error saving warmup' });
  }
});

module.exports = router;
